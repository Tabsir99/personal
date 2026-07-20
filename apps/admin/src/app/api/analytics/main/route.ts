import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import {
  queryTinybird,
  parseAnalyticsParams,
  periodToRange,
  previousPeriodRange,
  granularityToMs,
  F,
} from "@/lib/tinybird";
import type { OverviewMetrics, TimeseriesPoint, MainResponse } from "@/lib/analyticsTypes";

interface PeriodRow {
  period: "current" | "previous";
  visitors: number;
  pageviews: number;
  sessions: number;
  bounces: number;
  totalDuration: number;
}

function toMetrics(row: PeriodRow | undefined): OverviewMetrics {
  const sessions = Number(row?.sessions ?? 0);
  const bounces = Number(row?.bounces ?? 0);
  const totalDuration = Number(row?.totalDuration ?? 0);

  return {
    visitors: Number(row?.visitors ?? 0),
    pageviews: Number(row?.pageviews ?? 0),
    sessions,
    bounceRate: sessions > 0 ? bounces / sessions : 0,
    sessionDuration:
      sessions > 0 ? Math.round(totalDuration / sessions / 1000) : 0,
  };
}

async function fetchOverviewComparison(
  websiteId: string,
  start: number,
  end: number,
  prevStart: number,
): Promise<{ current: OverviewMetrics; previous: OverviewMetrics }> {
  const res = await queryTinybird<PeriodRow>(`
    WITH session_stats AS (
      SELECT
        ${F.sessionId} as sid,
        CASE WHEN ${F.timestamp} >= ${start} THEN 'current' ELSE 'previous' END as period,
        any(${F.visitorId}) as vid,
        COUNT() as pvs,
        MAX(${F.timestamp}) - MIN(${F.timestamp}) as duration
      FROM ${F.engine}
      WHERE ${F.websiteId} = '${websiteId}'
        AND ${F.type} = 'pageview'
        AND ${F.isBot} = 0
        AND ${F.timestamp} >= ${prevStart}
        AND ${F.timestamp} < ${end}
      GROUP BY sid, period
    )
    SELECT
      period,
      COUNT(DISTINCT vid) as visitors,
      SUM(pvs) as pageviews,
      COUNT() as sessions,
      SUM(CASE WHEN pvs = 1 THEN 1 ELSE 0 END) as bounces,
      SUM(duration) as totalDuration
    FROM session_stats
    GROUP BY period
  `);

  console.log("COMPARASION", res);

  const currentRow = res.data.find((r) => r.period === "current");
  const previousRow = res.data.find((r) => r.period === "previous");

  return {
    current: toMetrics(currentRow),
    previous: toMetrics(previousRow),
  };
}

async function fetchTimeseries(
  websiteId: string,
  start: number,
  end: number,
  bucketMs: number,
): Promise<TimeseriesPoint[]> {
  const res = await queryTinybird<{
    bucket: number;
    visitors: number;
    pageviews: number;
    sessions: number;
  }>(`
    SELECT
      intDiv(${F.timestamp}, ${bucketMs}) * ${bucketMs} as bucket,
      COUNT(DISTINCT ${F.visitorId}) as visitors,
      COUNT() as pageviews,
      COUNT(DISTINCT ${F.sessionId}) as sessions
    FROM ${F.engine}
    WHERE ${F.websiteId} = '${websiteId}'
      AND ${F.type} = 'pageview'
      AND ${F.isBot} = 0
      AND ${F.timestamp} >= ${start}
      AND ${F.timestamp} < ${end}
    GROUP BY bucket
    ORDER BY bucket
  `);

  console.log("TIMESERIES", res);

  return res.data.map((row) => ({
    timestamp: Number(row.bucket),
    visitors: Number(row.visitors),
    pageviews: Number(row.pageviews),
    sessions: Number(row.sessions),
  }));
}

export const GET = wrapRoute<MainResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);
  const prev = previousPeriodRange(start, end);
  const bucketMs = granularityToMs(params.granularity ?? "daily");

  const [{ current, previous }, timeseries] = await Promise.all([
    fetchOverviewComparison(params.websiteId, start, end, prev.start),
    fetchTimeseries(params.websiteId, start, end, bucketMs),
  ]);

  return { current, previous, timeseries };
});
