"use client";

import { useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MouseHandlerDataParam } from "recharts";
import type { TimeseriesPoint } from "./types";

interface MainChartProps {
  data: TimeseriesPoint[];
  granularity: "hourly" | "daily" | "weekly" | "monthly";
  metric?: string;
}

const CHART_KEYS = new Set(["visitors", "pageviews", "sessions"]);

const METRIC_META: Record<string, { label: string; color: string }> = {
  visitors: { label: "Visitors", color: "var(--color-primary)" },
  pageviews: { label: "Pageviews", color: "var(--color-primary)" },
  sessions: { label: "Sessions", color: "var(--color-primary)" },
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
  const meta = METRIC_META[key];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
    <div className="bg-card px-4 pt-2 pb-4">
      <div className="h-96">
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
                <stop offset="0%" stopColor={meta.color} stopOpacity={0.34} />
                <stop offset="20%" stopColor={meta.color} stopOpacity={0.17} />
                <stop offset="45%" stopColor={meta.color} stopOpacity={0.08} />
                <stop offset="100%" stopColor={meta.color} stopOpacity={0} />
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
                  stopColor="var(--color-muted-foreground)"
                  stopOpacity={0.18}
                />
                <stop
                  offset="35%"
                  stopColor="var(--color-muted-foreground)"
                  stopOpacity={0.08}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-muted-foreground)"
                  stopOpacity={0}
                />
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
              stroke="var(--color-border)"
              strokeOpacity={0.6}
            />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(ts) => formatTimestamp(ts, granularity)}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={32}
              allowDecimals={false}
            />
            <Tooltip
              animationDuration={200}
              animationEasing="ease-out"
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
                boxShadow: "var(--shadow-card-hover)",
              }}
              labelFormatter={(ts) =>
                new Date(ts as number).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })
              }
              formatter={(value: number) => [
                value.toLocaleString(),
                meta.label,
              ]}
            />
            {/* Muted background area (no tooltip entry, no active dots) */}
            <Area
              type="linear"
              dataKey={key}
              stroke="var(--color-muted-foreground)"
              strokeWidth={2}
              strokeOpacity={0.2}
              fill="url(#muted-vertical-fill)"
              tooltipType="none"
              activeDot={false}
              animationDuration={600}
              animationEasing="ease-out"
            />
            {/* Active masked area */}
            <Area
              id="active-area-series"
              type="linear"
              dataKey={key}
              stroke={meta.color}
              strokeWidth={2.5}
              strokeOpacity={0.5}
              fill="url(#active-vertical-fill)"
              mask="url(#hover-mask)"
              animationDuration={600}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
