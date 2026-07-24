import type { AnalyticsEventRow } from "@tabsircg/analytics-contract";
import type {
  FunnelDefinition,
  FunnelDetailResponse,
  FunnelStep,
  FunnelStepData,
} from "@/lib/analyticsTypes";

/**
 * Independent JS reference for the funnel compute route. A plain loop over the
 * seeded rows — "obviously correct" — so agreement with the ClickHouse output
 * validates the SQL: the per-step predicate translation
 * (`positionCaseInsensitive` / `startsWith` / `endsWith` / `=` / `event_name =`),
 * the `uniqExactIf` distinct-visitor count, and the bot + window filters.
 *
 * Mirrors funnel/route.ts exactly: steps are counted independently (nothing is
 * forced to shrink), conversion is relative to step 0, and drop-off is relative
 * to the immediately previous step's count.
 */

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
      // positionCaseInsensitive(href, url) > 0
      return href.toLowerCase().includes(step.url.toLowerCase());
    case "startsWith":
      return href.startsWith(step.url);
    case "endsWith":
      return href.endsWith(step.url);
    default:
      return href === step.url; // equals
  }
}

export function referenceFunnel(
  funnel: FunnelDefinition,
  rows: AnalyticsEventRow[],
  w: Win,
): FunnelDetailResponse {
  const inWindow = rows.filter(
    (r) => r.is_bot === 0 && r.timestamp >= w.start && r.timestamp < w.end,
  );

  const counts = funnel.steps.map((step) => {
    const vids = new Set<string>();
    for (const r of inWindow) if (stepMatches(r, step)) vids.add(r.visitor_id);
    return vids.size;
  });

  const totalVisitors = counts[0] ?? 0;

  const data: FunnelStepData[] = funnel.steps.map((step, i) => {
    const value = counts[i];
    const prev = i === 0 ? value : counts[i - 1];
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
      period: "",
      timezone: "UTC",
      lastUpdated: "",
    },
  };
}
