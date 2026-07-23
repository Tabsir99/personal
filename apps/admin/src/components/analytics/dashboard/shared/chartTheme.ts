// Every analytics chart colour lives here. Reference a CHART role — never inline
// a colour in a chart. Teal for traffic, washed danger for money, amber as an
// accent; green is deliberately absent (collides with teal at low opacity).

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
  ramp: [0.36, 0.27, 0.21, 0.16, 0.13, 0.1].map(
    (a) => `oklch(0.76 0.085 198 / ${a})`,
  ),
} as const;

export type ChartColors = Exclude<keyof typeof CHART, "ramp">;

export function alpha(color: string, a: number): string {
  return `color-mix(in oklab, ${color} ${Math.round(a * 100)}%, transparent)`;
}
