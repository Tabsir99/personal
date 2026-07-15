import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import {
  F,
  queryAE,
  parseAnalyticsParams,
  periodToRange,
  previousPeriodRange,
  granularityToMs,
} from "@/lib/analyticsEngine";

interface OverviewMetrics {
  visitors: number;
  pageviews: number;
  sessions: number;
  bounceRate: number;
  sessionDuration: number;
}

interface TimeseriesPoint {
  timestamp: number;
  visitors: number;
  pageviews: number;
  sessions: number;
}

interface MainResponse {
  current: OverviewMetrics;
  previous: OverviewMetrics;
  timeseries: TimeseriesPoint[];
}

async function fetchOverview(
  websiteId: string,
  start: number,
  end: number,
): Promise<OverviewMetrics> {
  const [metricsRes, sessionPvRes] = await Promise.all([
    queryAE<{ visitors: number; pageviews: number; sessions: number }>(`
      SELECT
        COUNT(DISTINCT ${F.visitorId}) as visitors,
        COUNT(*) as pageviews,
        COUNT(DISTINCT ${F.sessionId}) as sessions
      FROM cgd
      WHERE index1 = '${websiteId}'
        AND ${F.type} = 'pageview'
        AND ${F.timestamp} >= ${start}
        AND ${F.timestamp} < ${end}
    `),
    queryAE<{ sid: string; pvs: number; duration: number }>(`
      SELECT ${F.sessionId} as sid, COUNT(*) as pvs,
             MAX(${F.timestamp}) - MIN(${F.timestamp}) as duration
      FROM cgd
      WHERE index1 = '${websiteId}'
        AND ${F.type} = 'pageview'
        AND ${F.timestamp} >= ${start}
        AND ${F.timestamp} < ${end}
      GROUP BY sid
    `),
  ]);

  const m = metricsRes.data[0];
  const visitors = Number(m?.visitors ?? 0);
  const pageviews = Number(m?.pageviews ?? 0);
  const sessions = Number(m?.sessions ?? 0);

  let bounces = 0;
  let totalDuration = 0;
  for (const row of sessionPvRes.data) {
    if (Number(row.pvs) === 1) bounces++;
    totalDuration += Number(row.duration ?? 0);
  }

  const bounceRate = sessions > 0 ? bounces / sessions : 0;
  const sessionDuration =
    sessions > 0 ? Math.round(totalDuration / sessions / 1000) : 0;

  return { visitors, pageviews, sessions, bounceRate, sessionDuration };
}

async function fetchTimeseries(
  websiteId: string,
  start: number,
  end: number,
  bucketMs: number,
): Promise<TimeseriesPoint[]> {
  const res = await queryAE<{ bucket: number; visitors: number; pageviews: number; sessions: number }>(`
    SELECT
      intDiv(toUInt64(${F.timestamp}), ${bucketMs}) as bucket,
      COUNT(DISTINCT ${F.visitorId}) as visitors,
      COUNT(*) as pageviews,
      COUNT(DISTINCT ${F.sessionId}) as sessions
    FROM cgd
    WHERE index1 = '${websiteId}'
      AND ${F.type} = 'pageview'
      AND ${F.timestamp} >= ${start}
      AND ${F.timestamp} < ${end}
    GROUP BY bucket
    ORDER BY bucket
  `);

  return res.data.map((row) => ({
    timestamp: Number(row.bucket) * bucketMs,
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

  const [current, previous, timeseries] = await Promise.all([
    fetchOverview(params.websiteId, start, end),
    fetchOverview(params.websiteId, prev.start, prev.end),
    fetchTimeseries(params.websiteId, start, end, bucketMs),
  ]);

  return { current, previous, timeseries };
});
