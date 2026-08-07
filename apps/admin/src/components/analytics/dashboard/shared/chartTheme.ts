import type { CSSProperties } from "react";
import type { ReversalKind } from "./revenue";

export function alpha(color: string, a: number): string {
  return `color-mix(in oklab, ${color} ${Math.round(a * 100)}%, transparent)`;
}

const teal = "var(--color-primary)";
const money = "var(--color-destructive)";

export const CHART = {
  series: teal,
  newVisitors: teal,
  returningVisitors:
    "color-mix(in oklab, var(--color-primary) 42%, var(--color-card))",
  revenue: money,
  charged: money,
  refund:
    "color-mix(in oklab, var(--color-destructive) 52%, var(--color-card))",
  dispute:
    "color-mix(in oklab, var(--color-destructive) 78%, var(--color-card))",
  warning: "var(--color-warning)",
  muted: "var(--color-muted-foreground)",
  grid: "var(--color-border)",
  surface: "var(--color-card)",
} as const;

export type ChartColors = keyof typeof CHART;

export const REVERSAL = {
  refund: {
    fill: alpha(money, 0.12),
    stroke: alpha(money, 0.5),
    dash: "1.5 2.5",
    borderStyle: "dotted",
  },
  dispute: {
    fill: alpha(money, 0.24),
    stroke: alpha(money, 0.62),
    dash: "3 2",
    borderStyle: "dashed",
  },
} as const satisfies Record<
  ReversalKind,
  {
    fill: string;
    stroke: string;
    dash: string;
    borderStyle: "dotted" | "dashed";
  }
>;

export function isReversalColor(color: ChartColors): color is ReversalKind {
  return color === "refund" || color === "dispute";
}

export function swatchStyle(color: ChartColors): CSSProperties {
  if (color === "charged")
    return {
      background: "transparent",
      border: `1px solid ${alpha(money, 0.5)}`,
    };
  if (!isReversalColor(color)) return { background: CHART[color] };
  const { fill, stroke, borderStyle } = REVERSAL[color];
  return { background: fill, border: `1px ${borderStyle} ${stroke}` };
}

const DONUT_RAMP = {
  visitors: { hue: 198, chroma: 0.084 },
  revenue: { hue: 27, chroma: 0.11 },
} as const;

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
