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
import { eventWhere } from "@/lib/analyticsQuery";
import type {
  OverviewMetrics,
  TimeseriesPoint,
  MainResponse,
} from "@/lib/analyticsTypes";

interface MainRow {
  kind: "ov" | "ts" | "rev";
  k: string;
  visitors: number;
  newVisitors: number;
  returningVisitors: number;
  pageviews: number;
  sessions: number;
  bounces: number;
  totalDuration: number;
  payingVisitors: number;
  revenue: number;
}

function toMetrics(
  row: MainRow | undefined,
  rev: MainRow | undefined,
): OverviewMetrics {
  const sessions = Number(row?.sessions ?? 0);
  const bounces = Number(row?.bounces ?? 0);
  const totalDuration = Number(row?.totalDuration ?? 0);
  const visitors = Number(row?.visitors ?? 0);
  const payingVisitors = Number(rev?.payingVisitors ?? 0);

  return {
    visitors,
    pageviews: Number(row?.pageviews ?? 0),
    sessions,
    bounceRate: sessions > 0 ? bounces / sessions : 0,
    sessionDuration:
      sessions > 0 ? Math.round(totalDuration / sessions / 1000) : 0,
    revenue: Number(rev?.revenue ?? 0),
    payingVisitors,
    conversionRate: visitors > 0 ? payingVisitors / visitors : 0,
  };
}

/**
 * Overview comparison + the full timeseries in one request. The pageview slice
 * ([prevStart, end)) is scanned once into session rows, then GROUPING SETS
 * ((period), (bucket)) folds those into the current/previous totals and the
 * per-bucket series in a single pass. Previous-period sessions carry a bucket
 * sentinel of 0 so they collapse into one discarded row instead of leaking into
 * the first current bucket. Revenue is a second small scan of payment events,
 * bucketed by payment time and UNION'd in.
 */
function buildSql(
  websiteId: string,
  start: number,
  prevStart: number,
  end: number,
  bucketMs: number,
): string {
  const traffic = `
    WITH sessions AS (
      SELECT sid, vid, snum, startTs, durMs, pvs,
        if(startTs >= ${start}, 'current', 'previous') AS period,
        if(startTs >= ${start}, intDiv(startTs, ${bucketMs}) * ${bucketMs}, 0) AS bucket
      FROM (
        SELECT
          ${F.sessionId} AS sid,
          any(${F.visitorId}) AS vid,
          any(${F.sessionNumber}) AS snum,
          min(${F.timestamp}) AS startTs,
          max(${F.timestamp}) - min(${F.timestamp}) AS durMs,
          count() AS pvs
        FROM ${F.engine}
        WHERE ${eventWhere("pageview", websiteId, prevStart, end)}
        GROUP BY sid
      )
    )
    SELECT
      multiIf(GROUPING(bucket) = 0, 'ts', 'ov') AS kind,
      multiIf(GROUPING(bucket) = 0, toString(any(bucket)), any(period)) AS k,
      uniqExact(vid) AS visitors,
      uniqExactIf(vid, snum = 1) AS newVisitors,
      uniqExact(vid) - uniqExactIf(vid, snum = 1) AS returningVisitors,
      sum(pvs) AS pageviews,
      count() AS sessions,
      countIf(pvs = 1) AS bounces,
      sum(durMs) AS totalDuration,
      toUInt64(0) AS payingVisitors,
      toFloat64(0) AS revenue
    FROM sessions
    GROUP BY GROUPING SETS ((period), (bucket))`;

  const revenue = `
    SELECT
      'rev' AS kind,
      multiIf(GROUPING(bkt) = 0, toString(bkt), period) AS k,
      0 AS visitors, 0 AS newVisitors, 0 AS returningVisitors,
      0 AS pageviews, 0 AS sessions, 0 AS bounces, 0 AS totalDuration,
      uniqExact(vid) AS payingVisitors,
      round(sum(rev) / 100) AS revenue
    FROM (
      SELECT
        ${F.visitorId} AS vid,
        ${F.revenueCents} AS rev,
        if(${F.timestamp} >= ${start}, intDiv(${F.timestamp}, ${bucketMs}) * ${bucketMs}, 0) AS bkt,
        if(${F.timestamp} >= ${start}, 'current', 'previous') AS period
      FROM ${F.engine}
      WHERE ${eventWhere("payment", websiteId, prevStart, end)}
    )
    GROUP BY GROUPING SETS ((bkt), (period))`;

  return `${traffic}\n    UNION ALL${revenue}`;
}

export const GET = wrapRoute<MainResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);
  const prev = previousPeriodRange(start, end);
  const bucketMs = granularityToMs(params.granularity ?? "daily");

  const res = await queryTinybird<MainRow>(
    buildSql(params.websiteId, start, prev.start, end, bucketMs),
    "main",
  );

  const current = toMetrics(
    res.data.find((r) => r.kind === "ov" && r.k === "current"),
    res.data.find((r) => r.kind === "rev" && r.k === "current"),
  );
  const previous = toMetrics(
    res.data.find((r) => r.kind === "ov" && r.k === "previous"),
    res.data.find((r) => r.kind === "rev" && r.k === "previous"),
  );

  const revByBucket = new Map<number, number>();
  const payByBucket = new Map<number, number>();
  for (const r of res.data)
    if (r.kind === "rev" && Number(r.k) > 0) {
      revByBucket.set(Number(r.k), Number(r.revenue));
      payByBucket.set(Number(r.k), Number(r.payingVisitors));
    }

  const timeseries: TimeseriesPoint[] = res.data
    .filter((r) => r.kind === "ts" && Number(r.k) > 0)
    .map((r) => {
      const timestamp = Number(r.k);
      const visitors = Number(r.visitors);
      const sessions = Number(r.sessions);
      const totalDuration = Number(r.totalDuration);
      const payingVisitors = payByBucket.get(timestamp) ?? 0;
      return {
        timestamp,
        visitors,
        newVisitors: Number(r.newVisitors),
        returningVisitors: Number(r.returningVisitors),
        pageviews: Number(r.pageviews),
        sessions,
        bounceRate: sessions > 0 ? Number(r.bounces) / sessions : 0,
        sessionDuration:
          sessions > 0 ? Math.round(totalDuration / sessions / 1000) : 0,
        revenue: revByBucket.get(timestamp) ?? 0,
        payingVisitors,
        conversionRate: visitors > 0 ? payingVisitors / visitors : 0,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  return { current, previous, timeseries };
});
