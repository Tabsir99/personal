"use client";

import { useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { MouseHandlerDataParam } from "recharts";
import type { TimeseriesPoint } from "@/lib/analyticsTypes";
import { CHART } from "./chartTheme";
import { AnalyticsTooltip } from "./AnalyticsTooltip";
import { useReveal } from "./reveal";

interface MainChartProps {
  data: TimeseriesPoint[];
  granularity: "hourly" | "daily" | "weekly" | "monthly";
  metric?: string;
}

const CHART_KEYS = new Set(["visitors", "pageviews", "sessions"]);

const METRIC_LABEL: Record<string, string> = {
  visitors: "Visitors",
  pageviews: "Pageviews",
  sessions: "Sessions",
};

function formatTimestamp(ts: number, granularity: string): string {
  const d = new Date(ts);
  if (granularity === "hourly") {
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function MainChart({
  data,
  granularity,
  metric = "visitors",
}: MainChartProps) {
  const key = CHART_KEYS.has(metric) ? metric : "visitors";
  const label = METRIC_LABEL[key];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { ref, revealed, enter } = useReveal<HTMLDivElement>();

  const handleMouseMove = useCallback((state: MouseHandlerDataParam) => {
    if (state.activeTooltipIndex !== activeIndex) {
      setActiveIndex(Number(state.activeTooltipIndex));
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const targetOffset =
    activeIndex !== null && data.length > 1
      ? activeIndex / (data.length - 1)
      : 1;

  return (
    <div ref={ref} className={`${enter} bg-card px-4 pt-2 pb-4`}>
      <div className="h-96">
        {revealed && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                {/* Active Area Vertical Gradient (top to bottom) */}
                <linearGradient
                  id="active-vertical-fill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={CHART.series}
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="20%"
                    stopColor={CHART.series}
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="40%"
                    stopColor={CHART.series}
                    stopOpacity={0.1}
                  />
                  <stop
                    offset="50%"
                    stopColor={CHART.series}
                    stopOpacity={0.05}
                  />
                  <stop
                    offset="100%"
                    stopColor={CHART.series}
                    stopOpacity={0}
                  />
                </linearGradient>

                {/* Muted Area Vertical Gradient (top to bottom) */}
                <linearGradient
                  id="muted-vertical-fill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={CHART.muted}
                    stopOpacity={0.18}
                  />
                  <stop
                    offset="35%"
                    stopColor={CHART.muted}
                    stopOpacity={0.08}
                  />
                  <stop offset="100%" stopColor={CHART.muted} stopOpacity={0} />
                </linearGradient>

                {/* The Mask using CSS transitions for hardware-accelerated transforms */}
                <mask id="hover-mask" maskContentUnits="objectBoundingBox">
                  <rect x="0" y="0" width="1" height="1" fill="black" />
                  <rect
                    x="0"
                    y="0"
                    width="1"
                    height="1"
                    fill="white"
                    style={{
                      transform: `scaleX(${targetOffset})`,
                      transformOrigin: "left",
                      transition: "transform 0.2s ease-out",
                    }}
                  />
                </mask>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART.grid}
                strokeOpacity={0.6}
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(ts) => formatTimestamp(ts, granularity)}
                tick={{ fontSize: 11, fill: CHART.muted }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                tick={{ fontSize: 11, fill: CHART.muted }}
                tickLine={false}
                axisLine={false}
                width={32}
                allowDecimals={false}
              />
              <AnalyticsTooltip
                sections={(p) => [
                  p.date,
                  {
                    color: "series",
                    label,
                    value: p.get(key).toLocaleString(),
                  },
                ]}
              />
              {/* Muted background area (dashed stroke, no tooltip entry, no active dots) */}
              <Area
                type="linear"
                dataKey={key}
                stroke={CHART.muted}
                strokeWidth={2}
                strokeOpacity={0.2}
                fill="url(#muted-vertical-fill)"
                tooltipType="none"
                activeDot={false}
                animationDuration={800}
                animationEasing="ease-out"
              />
              {/* Active masked area */}
              <Area
                id="active-area-series"
                type="linear"
                dataKey={key}
                stroke={CHART.series}
                strokeWidth={3}
                strokeLinecap="round"
                strokeOpacity={0.3}
                fill="url(#active-vertical-fill)"
                mask="url(#hover-mask)"
                activeDot={{
                  r: 4,
                  stroke: CHART.surface,
                  strokeWidth: 2,
                  fill: CHART.series,
                }}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
