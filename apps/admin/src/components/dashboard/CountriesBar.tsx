"use client";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useGeoStats } from "@/hooks/useDashboardData";

import { DateRangeSelector } from "./DateRangeSelector";
import { ChartCard } from "./ChartCard";
import { ChartTooltipShell, ChartTooltipRow } from "./ChartTooltip";

export function CountriesBar() {
  const [days, setDays] = useState(7);
  const { data, error, isLoading } = useGeoStats(days);

  const chartData = data ? data.slice(0, 7) : [];
  const isEmpty = !error && !isLoading && chartData.length === 0;
  const height = chartData.length > 0 ? chartData.length * 36 + 24 : 280;

  return (
    <ChartCard
      eyebrow="Geo"
      title="Top countries"
      action={<DateRangeSelector value={days} onChange={setDays} />}
      height={height}
      isLoading={isLoading}
      isError={!!error}
      isEmpty={isEmpty}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 32, left: -8, bottom: 0 }}
          barSize={16}
        >
          <XAxis type="number" hide />
          <YAxis
            dataKey="country"
            type="category"
            width={80}
            tick={{ dx: -8 }}
            fontSize={11}
            className="fill-muted-foreground"
            style={{ fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--chart-3)", opacity: 0.06 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <ChartTooltipShell>
                  <ChartTooltipRow
                    name={payload[0].payload.country}
                    value={payload[0].value}
                    suffix="sessions"
                  />
                </ChartTooltipShell>
              );
            }}
          />
          <Bar
            dataKey="sessions"
            fill="var(--chart-3)"
            radius={[0, 2, 2, 0]}
            label={{
              position: "right",
              className: "fill-muted-foreground",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
