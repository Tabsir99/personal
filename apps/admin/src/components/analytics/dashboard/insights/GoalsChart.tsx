"use client";

import { memo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type {
  GoalMetric,
  GoalSeriesPoint,
  Granularity,
} from "@/lib/analyticsTypes";
import { CHART } from "../shared/chartTheme";
import {
  formatCount,
  formatTimestamp,
  headroomTop,
} from "../shared/chartFormat";

export const GoalsChart = memo(function GoalsChart({
  series,
  goals,
  colors,
  granularity,
  yMax,
}: {
  series: GoalSeriesPoint[];
  goals: GoalMetric[];
  colors: Record<string, string>;
  granularity: Granularity;
  yMax: number;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={series}
        margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
      >
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke={CHART.grid}
          strokeOpacity={0.5}
        />
        <XAxis
          dataKey="timestamp"
          type="number"
          domain={["dataMin", "dataMax"]}
          ticks={series.map((p) => p.timestamp)}
          tickFormatter={(t) => formatTimestamp(t, granularity)}
          tick={{ fontSize: 11, fill: CHART.muted }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={50}
        />
        <YAxis
          domain={[0, headroomTop(yMax)]}
          tick={{ fontSize: 11, fill: CHART.muted }}
          tickLine={false}
          axisLine={false}
          width={36}
          tickFormatter={formatCount}
        />
        {goals.map((g, i) => (
          <Line
            key={g.name}
            className={`gl-${i}`}
            dataKey={g.name}
            type="monotone"
            stroke={colors[g.name]}
            strokeWidth={1.5}
            strokeOpacity={0.9}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
});
