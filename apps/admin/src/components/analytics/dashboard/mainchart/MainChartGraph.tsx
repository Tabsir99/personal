"use client";

import { useMemo, useCallback, useRef } from "react";
import { useMotionValue, animate } from "motion/react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { MouseHandlerDataParam } from "recharts";
import type { TimeseriesPoint } from "@/lib/analyticsTypes";
import { CHART } from "../shared/chartTheme";
import { AnalyticsTooltip } from "../shared/AnalyticsTooltip";
import { useReveal } from "../shared/reveal";
import { formatCurrency, headroomTop, niceStep } from "../shared/chartFormat";
import { renderSeries, leftAxisFormat, type Selection } from "./series";
import { ChartDefs } from "./chartDefs";
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

const BOUNCE_AXIS = {
  domain: [0, 1] as [number, number],
  ticks: [0, 0.25, 0.5, 0.75, 1],
};

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
  const isBounce = selection === "bounceRate";

  const { ticks: revenueTicks, domain: revenueDomain } = useMemo(
    () => revenueAxis(Math.max(0, ...data.map((d) => d.revenue))),
    [data],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const { ref, revealed, enter } = useReveal<HTMLDivElement>();

  const setRefs = useCallback(
    (el: HTMLDivElement) => {
      containerRef.current = el;
      ref(el);
    },
    [ref],
  );

  const front = useMotionValue(data.length - 1);
  const animControlRef = useRef<ReturnType<typeof animate> | null>(null);

  const handleMouseMove = useCallback(
    (state: MouseHandlerDataParam) => {
      if (!state || state.activeTooltipIndex == null) return;
      const idx = Number(state.activeTooltipIndex);
      if (Number.isNaN(idx)) return;

      if (data.length > 1) {
        const offset = idx / (data.length - 1);
        containerRef.current?.style.setProperty(
          "--target-offset",
          String(offset),
        );
      }

      animControlRef.current?.stop();
      animControlRef.current = animate(front, idx, {
        duration: 0.3,
        ease: "easeOut",
      });
    },
    [data.length, front],
  );

  const handleMouseLeave = useCallback(() => {
    containerRef.current?.style.setProperty("--target-offset", "1");
    animControlRef.current?.stop();
    animControlRef.current = animate(front, data.length - 1, {
      duration: 0.3,
      ease: "easeOut",
    });
  }, [data.length, front]);

  const tooltipSecs = useMemo(
    () => tooltipSections(selection, periodLabel),
    [selection, periodLabel],
  );

  const axisFormatter = useMemo(() => leftAxisFormat(selection), [selection]);

  const series = useMemo(
    () => renderSeries(selection, front),
    [selection, front],
  );

  const xTicks = useMemo(() => data.map((d) => d.timestamp), [data]);

  return (
    <div ref={setRefs} className={`${enter} bg-card px-4 pt-2 pb-4`}>
      <div className="h-96">
        {revealed && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <ChartDefs />
              <CartesianGrid
                yAxisId={selection === null ? "revenue" : "left"}
                strokeDasharray="3 3"
                stroke={CHART.grid}
                strokeOpacity={0.6}
              />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={["dataMin", "dataMax"]}
                ticks={xTicks}
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
                domain={isBounce ? BOUNCE_AXIS.domain : [0, headroomTop]}
                {...(isBounce ? { ticks: BOUNCE_AXIS.ticks } : {})}
                tickFormatter={axisFormatter}
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
              <AnalyticsTooltip sections={tooltipSecs} />
              {series}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
