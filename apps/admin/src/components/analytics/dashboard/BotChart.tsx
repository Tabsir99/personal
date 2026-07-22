"use client";

import { createElement, useCallback, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { MouseHandlerDataParam } from "recharts";
import { Tabs } from "premium-ds/tabs";
import type {
  BotCategory,
  BotCategoryTotal,
  BotTimeseriesPoint,
} from "@/lib/analyticsTypes";
import { categoryMeta } from "./botRegistry";
import { CHART } from "./chartTheme";
import { AnalyticsTooltip } from "./AnalyticsTooltip";
import { useReveal } from "./reveal";
import { headroomTop } from "./chartFormat";

function fmt(ts: number, granularity: string): string {
  const d = new Date(ts);
  return granularity === "hourly"
    ? d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function BotChart({
  data,
  categories,
  activeCategory,
  onCategoryChange,
  granularity,
}: {
  data: BotTimeseriesPoint[];
  categories: BotCategoryTotal[];
  activeCategory: BotCategory | null;
  onCategoryChange: (category: BotCategory) => void;
  granularity: "hourly" | "daily" | "weekly" | "monthly";
}) {
  const active = activeCategory ?? categories[0]?.category ?? "generic";
  const meta = categoryMeta(active);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const { ref, revealed, enter } = useReveal<HTMLDivElement>();

  const onMove = useCallback((s: MouseHandlerDataParam) => {
    setHoverIndex(
      s.activeTooltipIndex == null ? null : Number(s.activeTooltipIndex),
    );
  }, []);
  const onLeave = useCallback(() => setHoverIndex(null), []);

  const reveal =
    hoverIndex !== null && data.length > 1 ? hoverIndex / (data.length - 1) : 1;

  return (
    <div ref={ref} className={`${enter} flex h-full flex-col`}>
      <div className="shrink-0 px-3 pt-3">
        <Tabs
          label="Bot category"
          value={active}
          onChange={(v) => onCategoryChange(v as BotCategory)}
          items={categories.map(({ category, count }) => {
            const m = categoryMeta(category);
            return {
              value: category,
              label: m.label,
              count: count.toLocaleString(),
              icon: createElement(m.icon, { weight: "bold" }),
            };
          })}
        />
      </div>

      <div className="min-h-0 flex-1 px-2 pt-4 pb-2">
        {revealed && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
            >
              <defs>
                <linearGradient
                  id="bot-active-fill"
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
                <linearGradient id="bot-muted-fill" x1="0" y1="0" x2="0" y2="1">
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
                <mask id="bot-hover-mask" maskContentUnits="objectBoundingBox">
                  <rect x="0" y="0" width="1" height="1" fill="black" />
                  <rect
                    x="0"
                    y="0"
                    width="1"
                    height="1"
                    fill="white"
                    style={{
                      transform: `scaleX(${reveal})`,
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
                tickFormatter={(ts) => fmt(ts, granularity)}
                tick={{ fontSize: 11, fill: CHART.muted }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                domain={[0, headroomTop]}
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
                    label: meta.label,
                    value: p.get(active).toLocaleString(),
                  },
                ]}
              />
              <Area
                type="linear"
                dataKey={active}
                stroke={CHART.muted}
                strokeWidth={2}
                strokeOpacity={0.2}
                fill="url(#bot-muted-fill)"
                tooltipType="none"
                activeDot={false}
                animationDuration={600}
                animationEasing="ease-out"
              />
              <Area
                type="linear"
                dataKey={active}
                stroke={CHART.series}
                strokeWidth={3}
                strokeLinecap="round"
                strokeOpacity={0.3}
                fill="url(#bot-active-fill)"
                mask="url(#bot-hover-mask)"
                activeDot={{
                  r: 4,
                  stroke: CHART.surface,
                  strokeWidth: 2,
                  fill: CHART.series,
                }}
                animationDuration={600}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
