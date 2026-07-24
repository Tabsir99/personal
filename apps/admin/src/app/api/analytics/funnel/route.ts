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

/**
 * Independent per-step counts sized against the funnel's own max — not an
 * in-order sequence. One scan: a conditional unique-visitor count per step.
 * Revenue + per-step source/country breakdowns (hover) are a deferred follow-up.
 */
export const GET = wrapRoute<FunnelDetailResponse>(async (req: NextRequest) => {
  await requireAuth();
  const sp = req.nextUrl.searchParams;
  const funnelId = sp.get("funnelId") ?? "";
  if (!funnelId) throw new HttpError(400, "funnelId is required");

  const params = parseAnalyticsParams(sp);
  const { start, end } = periodToRange(params.period);
  const funnel = await getFunnel(funnelId);

  const counts = funnel.steps
    .map((s, i) => `uniqExactIf(${F.visitorId}, ${stepPredicate(s)}) AS s${i}`)
    .join(",\n        ");

  const res = await queryTinybird<Record<string, number>>(
    `
      SELECT
        ${counts}
      FROM ${F.engine}
      WHERE ${F.websiteId} = '${params.websiteId}'
        AND ${F.isBot} = 0
        AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
    `,
    "funnel.steps",
  );

  const row = res.data[0] ?? {};
  const totalVisitors = Number(row.s0 ?? 0);

  const data: FunnelStepData[] = funnel.steps.map((step, i) => {
    const value = Number(row[`s${i}`] ?? 0);
    const prev = i === 0 ? value : Number(row[`s${i - 1}`] ?? 0);
    return {
      id: `step${i + 1}`,
      label: `Step ${i + 1}`,
      value,
      revenue: 0,
      stepIndex: i,
      stepType: step.type,
      conversionRate: totalVisitors > 0 ? (value / totalVisitors) * 100 : 0,
      dropoffFromPrevious:
        i === 0 || prev === 0 ? 0 : ((prev - value) / prev) * 100,
      topReferrers: [],
      topCountries: [],
    };
  });

  const completions = data.length ? data[data.length - 1].value : 0;

  return {
    funnel,
    data,
    metrics: {
      totalVisitors,
      completions,
      overallConversionRate:
        totalVisitors > 0 ? (completions / totalVisitors) * 100 : 0,
      overallRevenuePerVisitor: 0,
      period: params.period,
      timezone: "UTC",
      lastUpdated: new Date().toISOString(),
    },
  };
});
