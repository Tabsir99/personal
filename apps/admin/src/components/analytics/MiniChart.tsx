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
import type { TimeseriesPoint } from "@/lib/analyticsTypes";

interface MiniChartProps {
  data: TimeseriesPoint[];
  empty?: boolean;
}

export function MiniChart({ data, empty }: MiniChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
        style={empty ? { opacity: 0.35 } : undefined}
      >
        <defs>
          <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-primary)"
              stopOpacity={0.15}
            />
            <stop
              offset="95%"
              stopColor="var(--color-primary)"
              stopOpacity={0}
            />
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
          tickFormatter={(ts) => {
            const d = new Date(ts);
            return `${d.getDate()}/${d.getMonth() + 1}`;
          }}
          tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={40}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={28}
          allowDecimals={false}
        />
        <Tooltip
          animationEasing="ease-out"
          animationDuration={200}
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: 12,
            boxShadow: "var(--shadow-card-hover)",
          }}
          labelFormatter={(ts) =>
            new Date(ts as number).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })
          }
          formatter={(value: number) => [value, "Visitors"]}
        />
        <Area
          type="monotone"
          dataKey="visitors"
          stroke="var(--color-primary)"
          strokeWidth={1.5}
          fill="url(#visitorsGradient)"
          animationDuration={800}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function generateEmptyTimeseries(): TimeseriesPoint[] {
  const now = Date.now();
  const DAY = 86_400_000;
  return Array.from({ length: 30 }, (_, i) => ({
    timestamp: now - (29 - i) * DAY,
    visitors: 0,
    pageviews: 0,
    sessions: 0,
  }));
}
