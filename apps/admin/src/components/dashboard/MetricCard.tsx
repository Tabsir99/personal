"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  title: string;
  value: string;
  trend: number;
  data: { value: number; date: string }[];
  isLoading: boolean;
  isError: boolean;
  trendHigherIsBad?: boolean;
}

export function MetricCard({ title, value, trend, data, isLoading, isError, trendHigherIsBad = false }: MetricCardProps) {
  if (isError) {
    return (
      <Card className="bg-card">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="text-sm font-medium text-muted-foreground">Failed to load</div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-card">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-2 flex-1">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-[60px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data;
  const isPositive = trend > 0;
  const isNegative = trend < 0;
  
  let trendColor = "text-muted-foreground";
  let AreaFillColor = "hsl(var(--muted-foreground))";
  
  if ((isPositive && !trendHigherIsBad) || (isNegative && trendHigherIsBad)) {
    trendColor = "text-primary";
    AreaFillColor = "hsl(var(--primary))";
  } else if ((isNegative && !trendHigherIsBad) || (isPositive && trendHigherIsBad)) {
    trendColor = "text-destructive";
    AreaFillColor = "hsl(var(--destructive))";
  }

  return (
    <Card className="flex flex-col bg-card">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-1 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className={`text-xs ${trendColor}`}>
            {trend > 0 ? "+" : ""}{trend.toFixed(1)}% vs previous
          </div>
        </div>
        {chartData.length > 0 ? (
          <div className="mt-2 h-[60px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-md border bg-background px-2 py-1 text-xs shadow-md">
                        <div className="font-medium">{item.date}</div>
                        <div className="text-muted-foreground">{item.value.toFixed(1)}</div>
                      </div>
                    );
                  }}
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={AreaFillColor}
                  fill={AreaFillColor}
                  fillOpacity={0.2}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-3 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            No chart data
          </div>
        )}
      </CardContent>
    </Card>
  );
}
