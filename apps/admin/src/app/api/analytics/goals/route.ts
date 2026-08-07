import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import {
  queryTinybird,
  parseAnalyticsParams,
  periodToRange,
  granularityToMs,
  F,
} from "@/lib/tinybird";
import { CUSTOM_EVENT_TYPE } from "@/lib/analyticsTypes";
import { GOAL_NAME } from "@/lib/analyticsQuery";
import type {
  GoalMetric,
  GoalSeriesPoint,
  GoalsResponse,
} from "@/lib/analyticsTypes";

const MAX_GOALS = 30;

interface Row {
  level: "goals" | "series" | "catalog" | "visitors";
  bucket: number;
  name: string;
  uv: number;
  total: number;
}

interface Window {
  start: number;
  end: number;
  bucketMs: number;
}

function emptyPoint(timestamp: number, names: string[]): GoalSeriesPoint {
  const point: GoalSeriesPoint = { timestamp };
  for (const name of names) point[name] = 0;
  return point;
}

function toGoalsResponse(rows: Row[], window: Window): GoalsResponse {
  const { start, end, bucketMs } = window;

  const totalVisitors = Number(
    rows.find((r) => r.level === "visitors")?.uv ?? 0,
  );

  const goals: GoalMetric[] = rows
    .filter((r) => r.level === "goals" && r.name)
    .map((r) => ({
      name: String(r.name),
      uv: Number(r.uv),
      total: Number(r.total),
      conversionRate: totalVisitors > 0 ? Number(r.uv) / totalVisitors : 0,
    }))
    .sort((a, b) => b.uv - a.uv || a.name.localeCompare(b.name))
    .slice(0, MAX_GOALS);

  const names = goals.map((g) => g.name);
  const ranked = new Set(names);

  const byBucket = new Map<number, GoalSeriesPoint>();
  for (const row of rows) {
    if (row.level !== "series" || !ranked.has(row.name)) continue;
    const bucket = Number(row.bucket);
    let point = byBucket.get(bucket);
    if (!point) {
      point = emptyPoint(bucket, names);
      byBucket.set(bucket, point);
    }
    point[String(row.name)] = Number(row.total);
  }

  const series: GoalSeriesPoint[] = [];
  for (
    let bucket = Math.floor(start / bucketMs) * bucketMs;
    bucket < end;
    bucket += bucketMs
  ) {
    series.push(byBucket.get(bucket) ?? emptyPoint(bucket, names));
  }

  const catalog = rows
    .filter((r) => r.level === "catalog" && r.name)
    .map((r) => String(r.name))
    .sort((a, b) => a.localeCompare(b));

  return { goals, series, catalog, totalVisitors };
}

export const GET = wrapRoute<GoalsResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);
  const bucketMs = granularityToMs(params.granularity);

  const site = `${F.websiteId} = '${params.websiteId}' AND ${F.isBot} = 0`;
  const inWindow = `${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}`;

  const res = await queryTinybird<Row>(
    `
    (
      SELECT
        multiIf(GROUPING(bucket) = 0, 'series', 'goals') AS level,
        bucket,
        name,
        uniqExact(vid) AS uv,
        sum(cnt) AS total
      FROM (
        SELECT
          intDiv(${F.timestamp}, ${bucketMs}) * ${bucketMs} AS bucket,
          ${GOAL_NAME} AS name,
          ${F.visitorId} AS vid,
          COUNT() AS cnt
        FROM ${F.engine}
        WHERE ${site} AND ${F.type} != 'pageview' AND ${inWindow}
        GROUP BY bucket, name, vid
      )
      GROUP BY GROUPING SETS ((bucket, name), (name))
    )
    UNION ALL
    (
      SELECT
        'catalog' AS level,
        0 AS bucket,
        ${F.eventName} AS name,
        0 AS uv,
        COUNT() AS total
      FROM ${F.engine}
      WHERE ${site} AND ${F.type} = '${CUSTOM_EVENT_TYPE}'
      GROUP BY name
    )
    UNION ALL
    (
      SELECT
        'visitors' AS level,
        0 AS bucket,
        '' AS name,
        uniqExact(${F.visitorId}) AS uv,
        0 AS total
      FROM ${F.engine}
      WHERE ${site} AND ${F.type} = 'pageview' AND ${inWindow}
    )
  `,
    "goals",
  );

  return toGoalsResponse(res.data, { start, end, bucketMs });
});
