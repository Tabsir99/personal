import { NextRequest } from "next/server";
import { z } from "zod";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import {
  queryTinybird,
  parseAnalyticsParams,
  periodToRange,
  escapeSQL,
  F,
} from "@/lib/tinybird";
import type { JourneyResponse, JourneyVisitor } from "@/lib/analyticsTypes";
import { buildChannelSQL } from "../sources/channels";
import {
  assembleVisitor,
  groupByVisitor,
  JOURNEY_COLUMNS,
  MAX_ROWS_PER_VISITOR,
  type JourneyRow,
} from "./assemble";

/** `?goal=all` — every visitor active in the period, converted or not. */
const ALL_VISITORS = "all";

/** Types whose `event_name` is the type itself; anything else is `custom`. */
const TYPED_GOALS = new Set([
  "payment",
  "identify",
  "external_link",
  "pageview",
]);

const optionsSchema = z.object({
  goal: z.string().min(1).default("payment"),
  limit: z.coerce.number().int().min(1).max(25).default(10),
  skip: z.coerce.number().int().min(0).default(0),
  search: z.string().default(""),
});

const channelExpr = buildChannelSQL(F.referrer);

export const GET = wrapRoute<JourneyResponse>(async (req: NextRequest) => {
  await requireAuth();

  const search = req.nextUrl.searchParams;
  const params = parseAnalyticsParams(search);
  const { start, end } = periodToRange(params.period);
  const options = optionsSchema.parse({
    goal: search.get("goal") ?? undefined,
    limit: search.get("limit") ?? undefined,
    skip: search.get("skip") ?? undefined,
    search: search.get("search") ?? undefined,
  });

  // The only way to see a journey that converted on nothing.
  const goalName = options.goal === ALL_VISITORS ? null : options.goal;

  // Pinning `type` (3rd sort-key column) lets the index reach `timestamp`;
  // `event_name` alone is not in the key. Measured: 927k scanned rows -> 54k.
  const goalFilter = goalName
    ? `AND ${F.type} = '${escapeSQL(TYPED_GOALS.has(goalName) ? goalName : "custom")}'
       AND ${F.eventName} = '${escapeSQL(goalName)}'`
    : "";

  // `all` has no conversion to rank by, so it uses most recent activity.
  const rankBy = goalName ? `min(${F.timestamp})` : `max(${F.timestamp})`;

  const scope = `
    ${F.websiteId} = '${params.websiteId}'
      AND ${F.isBot} = 0
      ${goalFilter}
      AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
      ${options.search ? `AND ${F.extraData} ILIKE '%${escapeSQL(options.search)}%'` : ""}
  `;

  // The outer select carries no time or type bound: a journey is a whole
  // lifetime. `IN (subquery)` not a join, so the visitor set reaches the
  // `visitor_id` skip index; a join would force a full scan.
  const rowsRes = await queryTinybird<JourneyRow & { total: number }>(
    `
    SELECT * FROM (
      SELECT
        ${JOURNEY_COLUMNS.join(", ")},
        ${channelExpr} as channel,
        (SELECT COUNT(DISTINCT ${F.visitorId}) FROM ${F.engine} WHERE ${scope}) as total
      FROM ${F.engine}
      WHERE ${F.websiteId} = '${params.websiteId}'
        AND ${F.isBot} = 0
        AND ${F.visitorId} IN (
          SELECT visitor_id FROM (
            SELECT ${F.visitorId} as visitor_id, ${rankBy} as rank_at
            FROM ${F.engine}
            WHERE ${scope}
            GROUP BY visitor_id
            ORDER BY rank_at DESC
            LIMIT ${options.limit} OFFSET ${options.skip}
          )
        )
      ORDER BY visitor_id, timestamp DESC
      LIMIT ${MAX_ROWS_PER_VISITOR + 1} BY visitor_id
    )
    ORDER BY visitor_id, timestamp
  `,
    "journey.timelines",
  );

  const visitors: JourneyVisitor[] = [];
  for (const rows of groupByVisitor(rowsRes.data).values()) {
    visitors.push(assembleVisitor(rows, goalName, start, end));
  }
  // Restores the inner select's ranking, lost to `ORDER BY visitor_id`.
  const rank = (v: JourneyVisitor) => v.goalCompletedAt ?? v.lastSeenAt;
  visitors.sort((a, b) => rank(b) - rank(a));

  const totalCount = Number(rowsRes.data[0]?.total ?? 0);

  return {
    goal: options.goal,
    visitors,
    uv: totalCount,
    pagination: {
      limit: options.limit,
      skip: options.skip,
      totalCount,
      hasMore: options.skip + visitors.length < totalCount,
    },
  };
});
