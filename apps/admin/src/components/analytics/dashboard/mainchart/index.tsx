"use client";

import { useState, useCallback } from "react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { MouseHandlerDataParam } from "recharts";
import type { TimeseriesPoint } from "@/lib/analyticsTypes";
import { CHART } from "../chartTheme";
import { AnalyticsTooltip } from "../AnalyticsTooltip";
import { useReveal } from "../reveal";
import { formatCurrency } from "../chartFormat";
import { renderSeries, leftAxisFormat, type Selection } from "./series";
import { chartDefs } from "./chartDefs";
import { tooltipSections } from "./tooltipSections";

interface MainChartProps {
  data: TimeseriesPoint[];
  granularity: "hourly" | "daily" | "weekly" | "monthly";
  metric?: Selection;
  periodLabel: string;
}

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

function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

function revenueAxis(max: number): {
  ticks: number[];
  domain: [number, number];
} {
  if (max <= 0) return { ticks: [0], domain: [0, 1] };
  const step = niceStep(max / 3);
  const ticks: number[] = [];
  for (let v = 0; v <= max + step / 2; v += step) ticks.push(v);
  const top = ticks[ticks.length - 1];
  return { ticks, domain: [0, top / 0.6] };
}

export function MainChart({
  data,
  granularity,
  metric = null,
  periodLabel,
}: MainChartProps) {
  const selection: Selection = metric;
  const { ticks: revenueTicks, domain: revenueDomain } = revenueAxis(
    Math.max(0, ...data.map((d) => d.revenue)),
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { ref, revealed, enter } = useReveal<HTMLDivElement>();

  const handleMouseMove = useCallback((state: MouseHandlerDataParam) => {
    setActiveIndex((prev) =>
      state.activeTooltipIndex !== prev
        ? Number(state.activeTooltipIndex)
        : prev,
    );
  }, []);

  const handleMouseLeave = useCallback(() => setActiveIndex(null), []);

  const targetOffset =
    activeIndex !== null && data.length > 1
      ? activeIndex / (data.length - 1)
      : 1;

  return (
    <div ref={ref} className={`${enter} bg-card px-4 pt-2 pb-4`}>
      <div className="h-96">
        {revealed && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {chartDefs(targetOffset)}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART.grid}
                strokeOpacity={0.6}
              />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={["dataMin", "dataMax"]}
                ticks={data.map((d) => d.timestamp)}
                tickFormatter={(ts) => formatTimestamp(ts, granularity)}
                tick={{ fontSize: 11, fill: CHART.muted }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={50}
                padding={
                  selection === null
                    ? { left: 16, right: 16 }
                    : { left: 0, right: 0 }
                }
              />
              <YAxis
                yAxisId="left"
                domain={[0, "auto"]}
                tickFormatter={leftAxisFormat(selection)}
                tick={{ fontSize: 11, fill: CHART.muted }}
                tickLine={false}
                axisLine={false}
                width={
                  selection === "sessionDuration"
                    ? 48
                    : selection === "conversionRate"
                      ? 44
                      : 36
                }
                allowDecimals={
                  selection === "bounceRate" || selection === "conversionRate"
                }
              />
              {selection === null && (
                <YAxis
                  yAxisId="revenue"
                  orientation="right"
                  domain={revenueDomain}
                  ticks={revenueTicks}
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 11, fill: CHART.revenue }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
              )}
              <AnalyticsTooltip
                sections={tooltipSections(selection, periodLabel)}
              />
              {renderSeries(selection, data, activeIndex)}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
