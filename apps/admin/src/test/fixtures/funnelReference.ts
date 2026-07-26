import type { AnalyticsEventRow } from "@tabsircg/analytics-contract";
import type {
  FunnelDefinition,
  FunnelDetailResponse,
  FunnelStep,
  FunnelStepData,
  FunnelStepReferrer,
  FunnelStepCountry,
} from "@/lib/analyticsTypes";

// Independent JS oracle for funnel/route.ts: a plain loop over the rows, mirroring its counting, revenue and breakdown logic so agreement validates the SQL.

export interface Win {
  start: number;
  end: number;
}

/** JS twin of stepPredicate in funnel/route.ts. */
function stepMatches(row: AnalyticsEventRow, step: FunnelStep): boolean {
  if (step.type === "goal") return row.event_name === step.goalName;
  if (row.type !== "pageview") return false;
  const href = row.href;
  switch (step.urlMatchType) {
    case "contains":
      return href.toLowerCase().includes(step.url.toLowerCase());
    case "startsWith":
      return href.startsWith(step.url);
    case "endsWith":
      return href.endsWith(step.url);
    default:
      return href === step.url;
  }
}

interface Visitor {
  minTs: number;
  referrer: string;
  country: string;
  revenueCents: number;
  reached: boolean[];
}

export function referenceFunnel(
  funnel: FunnelDefinition,
  rows: AnalyticsEventRow[],
  w: Win,
): FunnelDetailResponse {
  const inWindow = rows.filter(
    (r) => r.is_bot === 0 && r.timestamp >= w.start && r.timestamp < w.end,
  );

  const visitors = new Map<string, Visitor>();
  for (const r of inWindow) {
    let v = visitors.get(r.visitor_id);
    if (!v) {
      v = {
        minTs: r.timestamp,
        referrer: r.referrer,
        country: r.country,
        revenueCents: 0,
        reached: funnel.steps.map(() => false),
      };
      visitors.set(r.visitor_id, v);
    }
    if (r.timestamp < v.minTs) {
      v.minTs = r.timestamp;
      v.referrer = r.referrer;
      v.country = r.country;
    }
    v.revenueCents += r.revenue_cents;
    funnel.steps.forEach((step, i) => {
      if (stepMatches(r, step)) v.reached[i] = true;
    });
  }
  const all = [...visitors.values()];

  const counts = funnel.steps.map(
    (_, i) => all.filter((v) => v.reached[i]).length,
  );
  const totalVisitors = counts[0] ?? 0;

  const rank = <T extends { visitors: number }>(
    tally: Map<string, number>,
    value: number,
    make: (key: string, visitors: number, pct: number) => T,
  ): T[] =>
    [...tally.entries()]
      .map(([k, visitors]) => ({ k, visitors }))
      .filter((r) => r.visitors > 0)
      .sort((a, b) => b.visitors - a.visitors || a.k.localeCompare(b.k))
      .slice(0, 3)
      .map((r) =>
        make(
          r.k,
          r.visitors,
          value > 0 ? Math.round((r.visitors / value) * 100) : 0,
        ),
      );

  const topReferrers = (i: number, value: number): FunnelStepReferrer[] => {
    const tally = new Map<string, number>();
    for (const v of all)
      if (v.reached[i]) tally.set(v.referrer, (tally.get(v.referrer) ?? 0) + 1);
    return rank(tally, value, (ref, visitors, percentage) => ({
      referrer: ref || "Direct / None",
      visitors,
      percentage,
    }));
  };

  const topCountries = (i: number, value: number): FunnelStepCountry[] => {
    const tally = new Map<string, number>();
    for (const v of all)
      if (v.reached[i]) tally.set(v.country, (tally.get(v.country) ?? 0) + 1);
    return rank(tally, value, (cty, visitors, percentage) => ({
      countryCode: cty,
      visitors,
      percentage,
    }));
  };

  const revenueFor = (i: number): number =>
    all.filter((v) => v.reached[i]).reduce((s, v) => s + v.revenueCents, 0) / 100;

  const data: FunnelStepData[] = funnel.steps.map((step, i) => {
    const value = counts[i];
    const prev = i === 0 ? value : counts[i - 1];
    return {
      id: `step${i + 1}`,
      label: `Step ${i + 1}`,
      value,
      revenue: revenueFor(i),
      stepIndex: i,
      stepType: step.type,
      conversionRate: totalVisitors > 0 ? (value / totalVisitors) * 100 : 0,
      dropoffFromPrevious:
        i === 0 || prev === 0 ? 0 : ((prev - value) / prev) * 100,
      topReferrers: topReferrers(i, value),
      topCountries: topCountries(i, value),
    };
  });

  const completions = data.length ? data[data.length - 1].value : 0;
  const totalRevenue = revenueFor(0);

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
      period: "",
      timezone: "UTC",
      lastUpdated: "",
    },
  };
}
