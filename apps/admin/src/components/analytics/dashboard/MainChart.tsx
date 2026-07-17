"use client";

import { useState } from "react";
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
}

type Metric = "visitors" | "pageviews" | "sessions";

const METRICS: { key: Metric; label: string; color: string }[] = [
  { key: "visitors", label: "Visitors", color: "var(--teal-500)" },
  { key: "pageviews", label: "Pageviews", color: "var(--amber-500)" },
  { key: "sessions", label: "Sessions", color: "var(--red-400)" },
];

function formatTimestamp(ts: number, granularity: string): string {
  const d = new Date(ts);
  if (granularity === "hourly") {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function MainChart({ data, granularity }: MainChartProps) {
  const [active, setActive] = useState<Metric>("visitors");

  const metric = METRICS.find((m) => m.key === active)!;

  return (
    <div className="rounded-lg border border-foreground/6 bg-card p-5">
      <div className="flex items-center gap-3 mb-4">
        {METRICS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setActive(m.key)}
            className={`text-[12px] font-medium px-2.5 py-1 rounded-md transition-colors duration-100 ${
              active === m.key
                ? "bg-foreground/5 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`grad-${active}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metric.color} stopOpacity={0.12} />
                <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
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
              width={36}
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
              formatter={(value: number) => [value.toLocaleString(), metric.label]}
            />
            <Area
              type="monotone"
              dataKey={active}
              stroke={metric.color}
              strokeWidth={1.5}
              fill={`url(#grad-${active})`}
              animationDuration={600}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
