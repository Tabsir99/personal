"use client";
import { useState } from "react";
import { useDailyStats } from "@/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangeSelector } from "./DateRangeSelector";

export function SessionsChart() {
  const [days, setDays] = useState(7);
  const { data, error, isLoading } = useDailyStats(days);

  let currentPeriod: any[] = [];
  if (data && Array.isArray(data)) {
    const splitIndex = Math.max(0, data.length - days);
    currentPeriod = data.slice(splitIndex);
  }

  const chartData = currentPeriod.map((d) => {
    const dateObj = new Date(d.date);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return {
      date: formattedDate,
      sessions: d.sessions || 0,
      pageViews: d.pageViews || 0,
    };
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Sessions & Page Views</CardTitle>
        <DateRangeSelector value={days} onChange={setDays} />
      </CardHeader>
      <CardContent className="h-[350px]">
        {error ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Failed to load
          </div>
        ) : isLoading ? (
          <Skeleton className="h-[320px] w-full rounded-xl" />
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
            No graph data available for this range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                fontSize={12}
                className="fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
                className="fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload) return null;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-md">
                      <p className="text-sm font-medium mb-2">{label}</p>
                      {payload.map((entry, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-muted-foreground capitalize">
                            {entry.name}:
                          </span>
                          <span className="font-medium">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Area
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="pageViews"
                name="Page Views"
                stroke="hsl(var(--muted-foreground))"
                fill="hsl(var(--muted-foreground))"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
