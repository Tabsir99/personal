"use client";
import { useState } from "react";
import { useTrafficSources } from "@/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangeSelector } from "./DateRangeSelector";

export function TrafficSourcesBar() {
  const [days, setDays] = useState(7);
  const { data, error, isLoading } = useTrafficSources(days);

  const chartData = data ? data.slice(0, 7) : [];
  const height = chartData.length > 0 ? chartData.length * 40 + 40 : 280;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Traffic Sources</CardTitle>
        <DateRangeSelector value={days} onChange={setDays} />
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            Failed to load
          </div>
        ) : isLoading ? (
          <Skeleton className="h-[280px] w-full rounded-xl" />
        ) : chartData.length > 0 ? (
          <div style={{ height: `${height}px` }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 30, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="traffic-bar-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.95} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="var(--chart-grid)"
                />
                <XAxis
                  type="number"
                  fontSize={12}
                  className="fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="source"
                  type="category"
                  width={80}
                  tick={{ dx: -10 }}
                  fontSize={12}
                  className="fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="rounded-lg border bg-background/80 backdrop-blur-md p-2 shadow-lg text-sm">
                        <span className="font-medium mr-2">
                          {payload[0].payload.source}:
                        </span>
                        <span>{payload[0].value} sessions</span>
                      </div>
                    );
                  }}
                  cursor={{ fill: "var(--chart-1)", opacity: 0.08 }}
                />
                <Bar
                  dataKey="sessions"
                  fill="url(#traffic-bar-gradient)"
                  radius={[0, 4, 4, 0]}
                  label={{
                    position: "right",
                    className: "fill-muted-foreground",
                    fontSize: 12,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            No data
          </div>
        )}
      </CardContent>
    </Card>
  );
}
