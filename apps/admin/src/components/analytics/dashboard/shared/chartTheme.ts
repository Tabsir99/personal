// Every analytics chart colour lives here — reference a CHART role, never inline one.

const teal = "var(--color-primary)";

export const CHART = {
  series: teal,
  newVisitors: teal,
  returningVisitors:
    "color-mix(in oklab, var(--color-primary) 42%, var(--color-card))",
  revenue: "var(--color-destructive)",
  warning: "var(--color-warning)",
  muted: "var(--color-muted-foreground)",
  grid: "var(--color-border)",
  surface: "var(--color-card)",
} as const;

export type ChartColors = keyof typeof CHART;

// Donut ramp anchored on each metric's role colour: teal for traffic, danger for money.
const DONUT_RAMP = {
  visitors: { hue: 198, chroma: 0.084 },
  revenue: { hue: 27, chroma: 0.11 },
} as const;

/** Fill + 1px edge for the slice at `rank` (0 = largest) of `count`. */
export function donutBand(
  rank: number,
  count: number,
  metric: keyof typeof DONUT_RAMP,
) {
  const { hue, chroma } = DONUT_RAMP[metric];
  const t =
    count > 1 ? Math.min(Math.max(rank, 0), count - 1) / (count - 1) : 0.5;
  const l = 0.955 - t * 0.2;
  const c = 0.022 + t * chroma;
  return {
    fill: `oklch(${l} ${c} ${hue})`,
    edge: `oklch(${l - 0.055} ${c * 0.94} ${hue})`,
  };
}

export function alpha(color: string, a: number): string {
  return `color-mix(in oklab, ${color} ${Math.round(a * 100)}%, transparent)`;
}
