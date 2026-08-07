"use client";

import { useState } from "react";
import type { OverviewMetrics } from "@/lib/analyticsTypes";
import { formatMetric, formatSignedCurrency } from "../shared/chartFormat";
import {
  activeReversals,
  netRevenue,
  revenueParts,
  type RevenueParts,
} from "../shared/revenue";

export type ChartMetric =
  | "visitors"
  | "conversionRate"
  | "pageviews"
  | "sessions"
  | "bounceRate"
  | "sessionDuration";

interface MetricsBarProps {
  current: OverviewMetrics;
  previous: OverviewMetrics;
  activeMetric: ChartMetric | null;
  onMetricChange: (metric: ChartMetric) => void;
}

type Delta = { text: string; tone: "up" | "down" | "flat" };

function deltaLabel(curr: number, prev: number): Delta {
  if (prev === 0) return { text: "", tone: "flat" };
  const pct = Math.round(((curr - prev) / prev) * 100);
  if (pct === 0) return { text: "0%", tone: "flat" };
  return { text: `${Math.abs(pct)}%`, tone: pct > 0 ? "up" : "down" };
}

export function MetricsBar({
  current,
  previous,
  activeMetric,
  onMetricChange,
}: MetricsBarProps) {
  const [hovered, setHovered] = useState<ChartMetric | null>(null);
  const clearHover = () => setHovered(null);
  const anyFocused = activeMetric !== null || hovered !== null;

  const delta = (curr: number, prev: number) => deltaLabel(curr, prev);

  const metricCell = (
    metric: ChartMetric,
    label: string,
    value: string,
    d: Delta,
    invertTone = false,
    first = false,
  ) => (
    <MetricCell
      metric={metric}
      label={label}
      value={value}
      delta={d}
      invertTone={invertTone}
      showSeparator={!first}
      active={activeMetric === metric}
      hovered={hovered === metric}
      muted={anyFocused && activeMetric !== metric && hovered !== metric}
      onHover={setHovered}
      onClick={onMetricChange}
    />
  );

  return (
    <div className="flex" onMouseLeave={clearHover}>
      {metricCell(
        "visitors",
        "Visitors",
        formatMetric("visitors", current.visitors),
        delta(current.visitors, previous.visitors),
        false,
        true,
      )}
      <RevenueCell
        current={revenueParts(current.revenue)}
        delta={delta(netRevenue(current.revenue), netRevenue(previous.revenue))}
        onEnter={clearHover}
      />
      {metricCell(
        "conversionRate",
        "Conversion",
        formatMetric("conversionRate", current.conversionRate),
        delta(current.conversionRate, previous.conversionRate),
      )}
      {metricCell(
        "pageviews",
        "Pageviews",
        formatMetric("pageviews", current.pageviews),
        delta(current.pageviews, previous.pageviews),
      )}
      {metricCell(
        "sessions",
        "Sessions",
        formatMetric("sessions", current.sessions),
        delta(current.sessions, previous.sessions),
      )}
      {metricCell(
        "bounceRate",
        "Bounce rate",
        formatMetric("bounceRate", current.bounceRate),
        delta(current.bounceRate, previous.bounceRate),
        true,
      )}
      {metricCell(
        "sessionDuration",
        "Session time",
        formatMetric("sessionDuration", current.sessionDuration),
        delta(current.sessionDuration, previous.sessionDuration),
      )}
    </div>
  );
}

function DeltaBadge({
  delta,
  invertTone,
}: {
  delta: Delta;
  invertTone?: boolean;
}) {
  if (!delta.text) return null;
  const { text, tone } = delta;
  const color =
    tone === "flat"
      ? "text-muted-foreground"
      : (invertTone ? tone === "down" : tone === "up")
        ? "text-success"
        : "text-destructive";
  return (
    <span
      className={`ml-1.5 inline-flex items-center gap-0.5 text-xs font-medium ${color}`}
    >
      {text}
      {tone !== "flat" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className={`size-3 shrink-0 ${tone === "up" ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M8 2a.75.75 0 0 1 .75.75v8.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.22 3.22V2.75A.75.75 0 0 1 8 2Z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </span>
  );
}

function RevenueCell({
  current,
  delta,
  onEnter,
}: {
  current: RevenueParts;
  delta: Delta;
  onEnter: () => void;
}) {
  return (
    <span className="relative flex flex-col p-6" onMouseEnter={onEnter}>
      <span className="absolute inset-y-4 left-0 w-px bg-foreground/8" />
      <span className="flex items-center gap-1.5 pb-0.5 text-xs font-medium tracking-wide text-muted-foreground capitalize">
        {activeReversals(current).length > 0 ? "Net revenue" : "Revenue"}
      </span>
      <span className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
        {formatSignedCurrency(current.net)}
        <DeltaBadge delta={delta} />
      </span>
    </span>
  );
}

function MetricCell({
  metric,
  label,
  value,
  delta,
  invertTone,
  showSeparator,
  active,
  hovered,
  muted,
  onHover,
  onClick,
}: {
  metric: ChartMetric;
  label: string;
  value: string;
  delta: Delta;
  invertTone?: boolean;
  showSeparator: boolean;
  active: boolean;
  hovered: boolean;
  muted: boolean;
  onHover: (m: ChartMetric) => void;
  onClick: (m: ChartMetric) => void;
}) {
  const showUnderline = active || hovered;

  return (
    <button
      type="button"
      onClick={() => onClick(metric)}
      onMouseEnter={() => onHover(metric)}
      className="relative flex cursor-pointer flex-col p-6 text-left"
    >
      {showSeparator && (
        <span className="absolute inset-y-4 left-0 w-px bg-foreground/8" />
      )}
      <span
        className={`inline-flex flex-col items-start transition-all duration-150 active:scale-95 ${muted ? "opacity-50" : "opacity-100"}`}
      >
        <span
          className={`relative w-fit pb-0.5 text-xs font-medium tracking-wide capitalize transition-colors duration-150 ${active || hovered ? "text-foreground/70" : "text-muted-foreground"}`}
        >
          {label}
          <span
            className={`absolute bottom-0 left-0 h-0.5 w-full origin-left bg-primary/60 transition-transform duration-200 ${showUnderline ? "scale-x-100" : "scale-x-0"}`}
          />
        </span>
        <span className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          {value}
          <DeltaBadge delta={delta} invertTone={invertTone} />
        </span>
      </span>
    </button>
  );
}
