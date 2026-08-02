import type { Period, Granularity } from "@/lib/analyticsTypes";

export function formatCount(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
  return `${Math.round(n)}`;
}

export function formatCurrency(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
  return `$${Math.round(n)}`;
}

export function formatDuration(seconds: number): string {
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem.toString().padStart(2, "0")}s`;
}

export function formatBounce(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function formatConversion(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

export type FormattableMetric =
  | "visitors"
  | "pageviews"
  | "sessions"
  | "bounceRate"
  | "conversionRate"
  | "sessionDuration"
  | "revenue";

/** Single source of truth for turning a metric value into display text. */
export function formatMetric(metric: FormattableMetric, value: number): string {
  switch (metric) {
    case "visitors":
    case "pageviews":
    case "sessions":
      return formatCount(value);
    case "bounceRate":
      return formatBounce(value);
    case "conversionRate":
      return formatConversion(value);
    case "sessionDuration":
      return formatDuration(value);
    case "revenue":
      return formatCurrency(value);
  }
}

/** Round `raw` up to the nearest 1/2/5 × 10ⁿ — a human-friendly axis step. */
export function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

/** YAxis domain-max with ~10% headroom, so the line cap and active dot are
 * never clipped at the top edge. Use as `domain={[0, headroomTop]}`. */
export const headroomTop = (dataMax: number): number =>
  dataMax > 0 ? dataMax * 1.1 : 1;

export const PERIOD_LABEL: Record<Period, string> = {
  today: "Today",
  yesterday: "Yesterday",
  last7d: "Last 7 days",
  last30d: "Last 30 days",
  last90d: "Last 90 days",
};

/** Axis tick label for a bucket timestamp: time for hourly, date otherwise. */
export function formatTimestamp(ts: number, granularity: Granularity): string {
  const d = new Date(ts);
  if (granularity === "hourly") {
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
