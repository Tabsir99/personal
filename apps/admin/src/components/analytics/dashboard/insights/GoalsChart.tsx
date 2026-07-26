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
import { AnalyticsTooltip, type TooltipSection } from "../shared/AnalyticsTooltip";
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
        <AnalyticsTooltip
          sections={(p) => {
            const activeGoals = goals.filter((g) => p.raw(g.name) > 0);
            const sections: TooltipSection[] = [
              p.date,
              ...activeGoals.map((g) => ({
                label: (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ background: colors[g.name] || CHART.series }}
                    />
                    <span>{g.name}</span>
                  </span>
                ),
                value: formatCount(p.raw(g.name)),
              })),
            ];
            if (activeGoals.length > 1) {
              const sum = activeGoals.reduce((s, g) => s + p.raw(g.name), 0);
              sections.push({
                label: "Total completions",
                value: formatCount(sum),
                dim: true,
              });
            }
            return sections;
          }}
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
