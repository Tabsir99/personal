"use client";

import type { OverviewMetrics } from "./types";
import { MetricNumber } from "@/components/ui/MetricNumber";

interface MetricsBarProps {
  current: OverviewMetrics;
  previous: OverviewMetrics;
  realtimeCount: number | null;
}

function deltaLabel(curr: number, prev: number): { text: string; tone: "success" | "destructive" | "muted" } {
  if (prev === 0) return { text: "", tone: "muted" };
  const pct = Math.round(((curr - prev) / prev) * 100);
  if (pct === 0) return { text: "0%", tone: "muted" };
  const arrow = pct > 0 ? "↑" : "↓";
  const tone = pct > 0 ? "success" : "destructive";
  return { text: `${arrow}${Math.abs(pct)}%`, tone };
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatBounce(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function MetricsBar({ current, previous, realtimeCount }: MetricsBarProps) {
  const visitors = deltaLabel(current.visitors, previous.visitors);
  const pageviews = deltaLabel(current.pageviews, previous.pageviews);
  const sessions = deltaLabel(current.sessions, previous.sessions);
  const bounce = deltaLabel(current.bounceRate, previous.bounceRate);
  const duration = deltaLabel(current.sessionDuration, previous.sessionDuration);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px rounded-lg border border-foreground/6 bg-foreground/6 overflow-hidden">
      <MetricCell
        label="Visitors"
        value={current.visitors.toLocaleString()}
        delta={visitors.text}
        deltaTone={visitors.tone}
      />
      <MetricCell
        label="Pageviews"
        value={current.pageviews.toLocaleString()}
        delta={pageviews.text}
        deltaTone={pageviews.tone}
      />
      <MetricCell
        label="Sessions"
        value={current.sessions.toLocaleString()}
        delta={sessions.text}
        deltaTone={sessions.tone}
      />
      <MetricCell
        label="Bounce rate"
        value={formatBounce(current.bounceRate)}
        delta={bounce.text}
        deltaTone={bounce.tone === "success" ? "destructive" : bounce.tone === "destructive" ? "success" : "muted"}
      />
      <MetricCell
        label="Session time"
        value={formatDuration(current.sessionDuration)}
        delta={duration.text}
        deltaTone={duration.tone}
      />
      <MetricCell
        label="Online"
        value={realtimeCount !== null ? String(realtimeCount) : "–"}
        online={realtimeCount !== null && realtimeCount > 0}
      />
    </div>
  );
}

function MetricCell({
  label,
  value,
  delta,
  deltaTone,
  online,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "success" | "destructive" | "muted";
  online?: boolean;
}) {
  return (
    <div className="bg-card px-4 py-3.5">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        {online && (
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-50" />
            <span className="relative inline-flex size-1.5 rounded-full bg-success" />
          </span>
        )}
      </div>
      <MetricNumber
        size="lg"
        value={value}
        {...(delta ? { delta, deltaTone } : {})}
      />
    </div>
  );
}
