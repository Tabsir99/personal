"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function MainChart({ data, granularity, metric = "visitors" }: MainChartProps) {
  const key = CHART_KEYS.has(metric) ? metric : "visitors";
  const meta = METRIC_META[key];

  return (
    <div className="bg-card px-4 pt-2 pb-4">
      <div className="h-50">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={meta.color} stopOpacity={0.1} />
                <stop offset="95%" stopColor={meta.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              strokeOpacity={0.4}
              vertical={false}
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
              formatter={(value: number) => [value.toLocaleString(), meta.label]}
            />
            <Area
              type="monotone"
              dataKey={key}
              stroke={meta.color}
              strokeWidth={1.5}
              fill="url(#chart-grad)"
              animationDuration={600}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
