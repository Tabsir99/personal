import { NextRequest } from "next/server";
import { wrapRoute, HttpError } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import {
  queryTinybird,
  parseAnalyticsParams,
  periodToRange,
  escapeSQL,
  F,
} from "@/lib/tinybird";
import { getFunnel } from "@/actions/funnelActions";
import type {
  FunnelDetailResponse,
  FunnelStep,
  FunnelStepData,
  FunnelStepReferrer,
  FunnelStepCountry,
} from "@/lib/analyticsTypes";

function stepPredicate(step: FunnelStep): string {
  if (step.type === "goal") {
    return `${F.eventName} = '${escapeSQL(step.goalName)}'`;
  }
  const url = escapeSQL(step.url);
  const pageview = `${F.type} = 'pageview'`;
  switch (step.urlMatchType) {
    case "contains":
      return `${pageview} AND positionCaseInsensitive(${F.href}, '${url}') > 0`;
    case "startsWith":
      return `${pageview} AND startsWith(${F.href}, '${url}')`;
    case "endsWith":
      return `${pageview} AND endsWith(${F.href}, '${url}')`;
    default:
      return `${pageview} AND ${F.href} = '${url}'`;
  }
}

type BreakdownRow = Record<string, number | string>;

function topReferrers(
  rows: BreakdownRow[],
  step: number,
  value: number,
): FunnelStepReferrer[] {
  return rows
    .map((r) => ({
      ref: String(r.ref ?? ""),
      visitors: Number(r[`s${step}`] ?? 0),
    }))
    .filter((r) => r.visitors > 0)
    .sort((a, b) => b.visitors - a.visitors || a.ref.localeCompare(b.ref))
    .slice(0, 3)
    .map((r) => ({
      referrer: r.ref || "Direct / None",
      visitors: r.visitors,
      percentage: value > 0 ? Math.round((r.visitors / value) * 100) : 0,
    }));
}

function topCountries(
  rows: BreakdownRow[],
  step: number,
  value: number,
): FunnelStepCountry[] {
  return rows
    .map((r) => ({
      cty: String(r.cty ?? ""),
      visitors: Number(r[`s${step}`] ?? 0),
    }))
    .filter((r) => r.visitors > 0)
    .sort((a, b) => b.visitors - a.visitors || a.cty.localeCompare(b.cty))
    .slice(0, 3)
    .map((r) => ({
      countryCode: r.cty,
      visitors: r.visitors,
      percentage: value > 0 ? Math.round((r.visitors / value) * 100) : 0,
    }));
}

// One grouped-by-visitor scan: the () set gives per-step counts and revenue,
// the (ref)/(cty) sets give the same per breakdown.
export const GET = wrapRoute<FunnelDetailResponse>(async (req: NextRequest) => {
  await requireAuth();
  const sp = req.nextUrl.searchParams;
  const funnelId = sp.get("funnelId") ?? "";
  if (!funnelId) throw new HttpError(400, "funnelId is required");

  const params = parseAnalyticsParams(sp);
  const { start, end } = periodToRange(params.period);
  const funnel = await getFunnel(funnelId);

  const preds = funnel.steps.map(stepPredicate);
  const reached = preds
    .map((p, i) => `maxIf(1, ${p}) AS r${i}`)
    .join(",\n          ");
  const counts = preds.map((_, i) => `countIf(r${i} = 1) AS s${i}`).join(", ");
  const revenues = preds
    .map((_, i) => `sumIf(vrev, r${i} = 1) AS rev${i}`)
    .join(", ");

  const res = await queryTinybird<BreakdownRow>(
    `
      SELECT
        GROUPING(ref) AS gref,
        GROUPING(cty) AS gcty,
        ref,
        cty,
        ${counts},
        ${revenues}
      FROM (
        SELECT
          ${F.visitorId},
          argMin(${F.referrer}, ${F.timestamp}) AS ref,
          argMin(${F.country}, ${F.timestamp}) AS cty,
          ${reached},
          sum(${F.revenueCents}) AS vrev
        FROM ${F.engine}
        WHERE ${F.websiteId} = '${params.websiteId}'
          AND ${F.isBot} = 0
          AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
        GROUP BY ${F.visitorId}
      )
      GROUP BY GROUPING SETS ((), (ref), (cty))
    `,
    "funnel.steps",
  );

  const rows = res.data;
  const total =
    rows.find((r) => Number(r.gref) === 1 && Number(r.gcty) === 1) ?? {};
  const refRows = rows.filter((r) => Number(r.gref) === 0);
  const ctyRows = rows.filter((r) => Number(r.gcty) === 0);
  const totalVisitors = Number(total.s0 ?? 0);

  const data: FunnelStepData[] = funnel.steps.map((step, i) => {
    const value = Number(total[`s${i}`] ?? 0);
    const prev = i === 0 ? value : Number(total[`s${i - 1}`] ?? 0);
    return {
      id: `step${i + 1}`,
      label: `Step ${i + 1}`,
      value,
      revenue: Number(total[`rev${i}`] ?? 0) / 100,
      stepIndex: i,
      stepType: step.type,
      conversionRate: totalVisitors > 0 ? (value / totalVisitors) * 100 : 0,
      dropoffFromPrevious:
        i === 0 || prev === 0 ? 0 : ((prev - value) / prev) * 100,
      topReferrers: topReferrers(refRows, i, value),
      topCountries: topCountries(ctyRows, i, value),
    };
  });

  const completions = data.length ? data[data.length - 1].value : 0;
  const totalRevenue = Number(total.rev0 ?? 0) / 100;

  return {
    funnel,
    data,
    metrics: {
      totalVisitors,
      completions,
      overallConversionRate:
        totalVisitors > 0 ? (completions / totalVisitors) * 100 : 0,
      overallRevenuePerVisitor:
        totalVisitors > 0 ? totalRevenue / totalVisitors : 0,
      period: params.period,
      timezone: "UTC",
      lastUpdated: new Date().toISOString(),
    },
  };
});
