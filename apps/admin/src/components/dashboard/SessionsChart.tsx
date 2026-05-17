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

import { useDailyStats } from "@/hooks/useDashboardData";
import { StatusDot } from "@/components/ui/StatusDot";

import { DateRangeSelector } from "./DateRangeSelector";
import { ChartCard } from "./ChartCard";
import { ChartTooltipShell, ChartTooltipRow } from "./ChartTooltip";

interface DailyStat {
  date: string;
  sessions?: number;
  pageViews?: number;
}

const SERIES = [
  { key: "sessions", name: "Sessions", color: "var(--chart-1)" },
  { key: "pageViews", name: "Page Views", color: "var(--chart-2)" },
] as const;

export function SessionsChart() {
  const [days, setDays] = useState(7);
  const { data, error, isLoading } = useDailyStats(days);

  let currentPeriod: DailyStat[] = [];
  if (data && Array.isArray(data)) {
    const splitIndex = Math.max(0, data.length - days);
    currentPeriod = data.slice(splitIndex);
  }

  const chartData = currentPeriod.map((d) => {
    const dateObj = new Date(d.date);
    return {
      date: dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      sessions: d.sessions ?? 0,
      pageViews: d.pageViews ?? 0,
    };
  });

  return (
    <ChartCard
      title="Sessions & Page Views"
      action={
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 sm:flex">
            {SERIES.map((s) => (
              <span key={s.key} className="flex items-center gap-1.5">
                <StatusDot
                  tone={s.key === "sessions" ? "primary" : "muted"}
                  size="sm"
                  style={{ backgroundColor: s.color }}
                />
                <span className="font-mono text-[11px] text-muted-foreground">
                  {s.name}
                </span>
              </span>
            ))}
          </div>
          <DateRangeSelector value={days} onChange={setDays} />
        </div>
      }
      height={320}
      isLoading={isLoading}
      isError={!!error}
      isEmpty={!error && !isLoading && chartData.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            {SERIES.map((s) => (
              <linearGradient
                key={s.key}
                id={`sessions-grad-${s.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.12} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--chart-grid)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            fontSize={11}
            className="fill-muted-foreground"
            style={{ fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            fontSize={11}
            className="fill-muted-foreground"
            style={{ fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            cursor={{
              stroke: "var(--chart-1)",
              strokeOpacity: 0.4,
              strokeDasharray: "3 3",
            }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <ChartTooltipShell>
                  <div className="mb-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                    {label}
                  </div>
                  <div className="flex flex-col gap-1">
                    {payload.map((entry, i) => (
                      <ChartTooltipRow
                        key={i}
                        swatch={entry.color}
                        name={entry.name}
                        value={entry.value}
                      />
                    ))}
                  </div>
                </ChartTooltipShell>
              );
            }}
          />
          {SERIES.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={1.5}
              fill={`url(#sessions-grad-${s.key})`}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
