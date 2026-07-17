"use client";

import { useState } from "react";
import type { OverviewMetrics } from "./types";

export type ChartMetric =
  "visitors" | "pageviews" | "sessions" | "bounceRate" | "sessionDuration";

interface MetricsBarProps {
  current: OverviewMetrics;
  previous: OverviewMetrics;
  realtimeCount: number | null;
  activeMetric: ChartMetric;
  onMetricChange: (metric: ChartMetric) => void;
}

function deltaLabel(
  curr: number,
  prev: number,
): { text: string; tone: "up" | "down" | "flat" } {
  if (prev === 0) return { text: "", tone: "flat" };
  const pct = Math.round(((curr - prev) / prev) * 100);
  if (pct === 0) return { text: "0%", tone: "flat" };
  return { text: `${Math.abs(pct)}%`, tone: pct > 0 ? "up" : "down" };
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function formatBounce(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function MetricsBar({
  current,
  previous,
  realtimeCount,
  activeMetric,
  onMetricChange,
}: MetricsBarProps) {
  const [hovered, setHovered] = useState<ChartMetric | null>(null);

  const visitors = deltaLabel(current.visitors, previous.visitors);
  const pageviews = deltaLabel(current.pageviews, previous.pageviews);
  const sessions = deltaLabel(current.sessions, previous.sessions);
  const bounce = deltaLabel(current.bounceRate, previous.bounceRate);
  const duration = deltaLabel(
    current.sessionDuration,
    previous.sessionDuration,
  );

  const cells = [
    {
      metric: "visitors" as const,
      label: "Visitors",
      value: current.visitors.toLocaleString(),
      delta: visitors.text,
      tone: visitors.tone,
      invertTone: false,
    },
    {
      metric: "pageviews" as const,
      label: "Pageviews",
      value: current.pageviews.toLocaleString(),
      delta: pageviews.text,
      tone: pageviews.tone,
      invertTone: false,
    },
    {
      metric: "sessions" as const,
      label: "Sessions",
      value: current.sessions.toLocaleString(),
      delta: sessions.text,
      tone: sessions.tone,
      invertTone: false,
    },
    {
      metric: "bounceRate" as const,
      label: "Bounce rate",
      value: formatBounce(current.bounceRate),
      delta: bounce.text,
      tone: bounce.tone,
      invertTone: true,
    },
    {
      metric: "sessionDuration" as const,
      label: "Session time",
      value: formatDuration(current.sessionDuration),
      delta: duration.text,
      tone: duration.tone,
      invertTone: false,
    },
  ];

  return (
    <div className="flex" onMouseLeave={() => setHovered(null)}>
      {cells.map((cell, i) => (
        <MetricCell
          key={cell.metric}
          metric={cell.metric}
          label={cell.label}
          value={cell.value}
          delta={cell.delta}
          tone={cell.tone}
          invertTone={cell.invertTone}
          active={activeMetric === cell.metric}
          hovered={hovered === cell.metric}
          muted={activeMetric !== cell.metric && hovered !== cell.metric}
          onHover={setHovered}
          onClick={onMetricChange}
          showSeparator={i > 0}
        />
      ))}
      <span
        className="relative flex flex-col p-6"
        onMouseEnter={() => setHovered(null)}
      >
        <span className="absolute inset-y-4 left-0 w-px bg-foreground/8" />
        <span className="flex items-center gap-1.5 pb-0.5 text-xs font-medium tracking-wide text-muted-foreground capitalize">
          Online
          {realtimeCount !== null && realtimeCount > 0 && (
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-50" />
              <span className="relative inline-flex size-1.5 rounded-full bg-success" />
            </span>
          )}
        </span>
        <span className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          {realtimeCount !== null ? realtimeCount : "–"}
        </span>
      </span>
    </div>
  );
}

function MetricCell({
  metric,
  label,
  value,
  delta,
  tone,
  invertTone,
  active,
  hovered,
  muted,
  onHover,
  onClick,
  showSeparator,
}: {
  metric: ChartMetric;
  label: string;
  value: string;
  delta?: string;
  tone?: "up" | "down" | "flat";
  invertTone?: boolean;
  active: boolean;
  hovered: boolean;
  muted: boolean;
  onHover: (m: ChartMetric) => void;
  onClick: (m: ChartMetric) => void;
  showSeparator: boolean;
}) {
  const deltaColor = (() => {
    if (!tone || tone === "flat" || !delta) return "text-muted-foreground";
    const isGood = invertTone ? tone === "down" : tone === "up";
    return isGood ? "text-success" : "text-destructive";
  })();

  const arrow = tone === "up" ? "↑" : tone === "down" ? "↓" : "";
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
            className={`absolute bottom-0 left-0 h-[1.5px] w-full origin-left bg-primary/60 transition-transform duration-200 ${showUnderline ? "scale-x-100" : "scale-x-0"}`}
          />
        </span>
        <span className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          {value}
          {delta && (
            <span className={`ml-1.5 text-xs font-medium ${deltaColor}`}>
              {delta} {arrow}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
