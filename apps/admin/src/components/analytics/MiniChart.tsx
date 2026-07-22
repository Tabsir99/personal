"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { TimeseriesPoint } from "@/lib/analyticsTypes";
import { CHART } from "./dashboard/chartTheme";
import { AnalyticsTooltip } from "./dashboard/AnalyticsTooltip";
import { useReveal } from "./dashboard/reveal";
import { headroomTop } from "./dashboard/chartFormat";

interface MiniChartProps {
  data: TimeseriesPoint[];
  empty?: boolean;
}

export function MiniChart({ data, empty }: MiniChartProps) {
  const { ref, revealed, enter } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`${enter} size-full`}>
      {revealed && (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
            style={empty ? { opacity: 0.35 } : undefined}
          >
            <defs>
              <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.series} stopOpacity={0.15} />
                <stop offset="95%" stopColor={CHART.series} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART.grid}
              strokeOpacity={0.4}
              vertical={false}
            />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(ts) => {
                const d = new Date(ts);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
              tick={{ fontSize: 10, fill: CHART.muted }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              domain={[0, headroomTop]}
              tick={{ fontSize: 10, fill: CHART.muted }}
              tickLine={false}
              axisLine={false}
              width={28}
              allowDecimals={false}
            />
            <AnalyticsTooltip
              sections={(p) => [
                p.date,
                {
                  color: "series",
                  label: "Visitors",
                  value: p.get("visitors").toLocaleString(),
                },
              ]}
            />
            <Area
              type="monotone"
              dataKey="visitors"
              stroke={CHART.series}
              strokeWidth={1.5}
              fill="url(#visitorsGradient)"
              animationDuration={800}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function generateEmptyTimeseries(): TimeseriesPoint[] {
  const now = Date.now();
  const DAY = 86_400_000;
  return Array.from({ length: 30 }, (_, i) => ({
    timestamp: now - (29 - i) * DAY,
    visitors: 0,
    newVisitors: 0,
    returningVisitors: 0,
    pageviews: 0,
    sessions: 0,
    bounceRate: 0,
    sessionDuration: 0,
    revenue: 0,
    payingVisitors: 0,
    conversionRate: 0,
  }));
}
