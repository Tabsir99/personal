"use client";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { useGeoStats } from "@/hooks/useDashboardData";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MetricNumber } from "@/components/ui/MetricNumber";

import { DateRangeSelector } from "./DateRangeSelector";
import { ChartCard } from "./ChartCard";
import { ChartTooltipShell, ChartTooltipRow } from "./ChartTooltip";

interface GeoStat {
  devices?: { mobile?: number; desktop?: number; tablet?: number };
}

const SEGMENTS = [
  { key: "desktop", name: "Desktop", color: "var(--chart-1)" },
  { key: "mobile", name: "Mobile", color: "var(--chart-2)" },
  { key: "tablet", name: "Tablet", color: "var(--chart-3)" },
] as const;

const numberFormat = new Intl.NumberFormat();

export function DeviceDonut() {
  const [days, setDays] = useState(7);
  const { data, error, isLoading } = useGeoStats(days);

  const totals = { mobile: 0, desktop: 0, tablet: 0 };
  if (data) {
    (data as GeoStat[]).forEach((d) => {
      if (!d.devices) return;
      totals.mobile += d.devices.mobile ?? 0;
      totals.desktop += d.devices.desktop ?? 0;
      totals.tablet += d.devices.tablet ?? 0;
    });
  }
  const total = totals.mobile + totals.desktop + totals.tablet;

  const chartData = SEGMENTS.map((seg) => ({
    name: seg.name,
    value: totals[seg.key],
    color: seg.color,
  })).filter((d) => d.value > 0);

  const isEmpty = !error && !isLoading && total === 0;

  return (
    <ChartCard
      title="Devices"
      action={<DateRangeSelector value={days} onChange={setDays} />}
      height={300}
      isLoading={isLoading}
      isError={!!error}
      isEmpty={isEmpty}
    >
      <div className="relative flex h-full flex-col">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
            <MetricNumber value={numberFormat.format(total)} size="lg" />
            <Eyebrow tone="muted" family="mono">
              Total sessions
            </Eyebrow>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={64}
                outerRadius={92}
                paddingAngle={2}
                dataKey="value"
                stroke="var(--card)"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const seg = payload[0];
                  const value = seg.value as number;
                  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
                  return (
                    <ChartTooltipShell>
                      <ChartTooltipRow
                        swatch={seg.payload.color}
                        name={seg.name}
                        value={value}
                        suffix={`(${pct}%)`}
                      />
                    </ChartTooltipShell>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 pt-2">
          {chartData.map((entry) => (
            <div
              key={entry.name}
              className="flex items-center gap-1.5 font-mono text-kbd text-muted-foreground"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
