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
import { GOAL_NAME } from "@/lib/analyticsQuery";
import {
  assembleVisitor,
  groupByVisitor,
  JOURNEY_COLUMNS,
  MAX_ROWS_PER_VISITOR,
  type JourneyRow,
} from "./assemble";

const EVERY_VISITOR = "all";

const GOAL_NAME_TO_EVENT_TYPE: Record<string, string> = {
  payment: "payment",
  identify: "identify",
  external_link: "external_link",
  pageview: "pageview",
};

const optionsSchema = z.object({
  goal: z.string().min(1).default("payment"),
  limit: z.coerce.number().int().min(1).max(25).default(10),
  skip: z.coerce.number().int().min(0).default(0),
  search: z.string().default(""),
});

const channelExpr = buildChannelSQL(F.referrer);

const sortKeyTypeFor = (goalName: string) =>
  GOAL_NAME_TO_EVENT_TYPE[goalName] ?? "custom";

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

  const goalName = options.goal === EVERY_VISITOR ? null : options.goal;
  const activeInPeriod = `${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}`;

  const completedGoal = goalName
    ? `${GOAL_NAME} = '${escapeSQL(goalName)}' AND ${activeInPeriod}`
    : "";
  const sortKeyTypePin = goalName
    ? `AND ${F.type} = '${escapeSQL(sortKeyTypeFor(goalName))}'`
    : "";
  const rankVisitorsBy = goalName
    ? `min(${F.timestamp})`
    : `max(${F.timestamp})`;
  const goalCompletedAt = completedGoal
    ? `min(if(${completedGoal}, ${F.timestamp}, NULL)) OVER (PARTITION BY ${F.visitorId})`
    : "0";

  const visitorsInScope = `
    ${F.websiteId} = '${params.websiteId}'
      AND ${F.isBot} = 0
      ${sortKeyTypePin}
      AND ${completedGoal || activeInPeriod}
      ${options.search ? `AND ${F.extraData} ILIKE '%${escapeSQL(options.search)}%'` : ""}
  `;

  const rowsRes = await queryTinybird<JourneyRow & { total: number }>(
    `
    SELECT * FROM (
      SELECT
        ${JOURNEY_COLUMNS.join(", ")},
        ${channelExpr} as channel,
        ifNull(${goalCompletedAt}, 0) as goal_at,
        (SELECT COUNT(DISTINCT ${F.visitorId}) FROM ${F.engine} WHERE ${visitorsInScope}) as total
      FROM ${F.engine}
      WHERE ${F.websiteId} = '${params.websiteId}'
        AND ${F.isBot} = 0
        AND ${F.visitorId} IN (
          SELECT visitor_id FROM (
            SELECT ${F.visitorId} as visitor_id, ${rankVisitorsBy} as rank_at
            FROM ${F.engine}
            WHERE ${visitorsInScope}
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
    visitors.push(assembleVisitor(rows, goalName));
  }

  const rankOf = (v: JourneyVisitor) => v.goalCompletedAt ?? v.lastSeenAt;
  visitors.sort((a, b) => rankOf(b) - rankOf(a));

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
