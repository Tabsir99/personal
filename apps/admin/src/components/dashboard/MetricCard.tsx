"use client";

import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MetricNumber } from "@/components/ui/MetricNumber";
import { cn } from "@/lib/utils";

import { ChartTooltipShell } from "./ChartTooltip";

interface MetricCardProps {
  title: string;
  value: string;
  trend: number;
  data: { value: number; date: string }[];
  isLoading: boolean;
  isError: boolean;
  trendHigherIsBad?: boolean;
  staggerIndex?: number;
}

type TrendTone = "success" | "destructive" | "muted";

function trendTone(
  trend: number,
  higherIsBad: boolean | undefined,
): TrendTone {
  if (trend === 0) return "muted";
  const isPositive = trend > 0;
  const isGood = higherIsBad ? !isPositive : isPositive;
  return isGood ? "success" : "destructive";
}

const trendToneClass: Record<TrendTone, string> = {
  success: "text-success",
  destructive: "text-destructive",
  muted: "text-muted-foreground",
};

export function MetricCard({
  title,
  value,
  trend,
  data,
  isLoading,
  isError,
  trendHigherIsBad,
  staggerIndex,
}: MetricCardProps) {
  if (isError) {
    return (
      <Card>
        <CardHeader className="pt-5 pb-2">
          <Eyebrow tone="muted">{title}</Eyebrow>
        </CardHeader>
        <CardContent className="pt-1 pb-5">
          <Eyebrow tone="muted" family="mono">
            Failed to load
          </Eyebrow>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pt-5 pb-2">
          <Eyebrow tone="muted">{title}</Eyebrow>
        </CardHeader>
        <CardContent className="space-y-3 pt-1 pb-5">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  const tone = trendTone(trend, trendHigherIsBad);
  const TrendIcon = trend === 0 ? Minus : trend > 0 ? ArrowUp : ArrowDown;
  const trendText = `${trend > 0 ? "+" : ""}${trend.toFixed(1)}%`;
  const areaColor =
    tone === "success"
      ? "var(--success)"
      : tone === "destructive"
        ? "var(--destructive)"
        : "var(--chart-1)";

  const gradientId = `metric-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pt-5 pb-2">
        <Eyebrow tone="muted">{title}</Eyebrow>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-3 pt-1 pb-5">
        <div className="flex flex-col gap-1">
          <MetricNumber value={value} size="lg" />
          <div
            className={cn(
              "flex items-center gap-1 font-mono text-kbd tabular-nums",
              trendToneClass[tone],
            )}
          >
            <TrendIcon className="h-2.5 w-2.5" aria-hidden="true" />
            <span>{trendText}</span>
            <span className="text-muted-foreground">vs previous</span>
          </div>
        </div>
        {data.length > 0 ? (
          <div className="-mx-2 h-14">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={areaColor} stopOpacity={0.12} />
                    <stop offset="100%" stopColor={areaColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  cursor={{
                    stroke: areaColor,
                    strokeOpacity: 0.4,
                    strokeDasharray: "3 3",
                  }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0].payload as {
                      date: string;
                      value: number;
                    };
                    return (
                      <ChartTooltipShell>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {item.date}
                          </span>
                          <span className="font-mono font-medium tabular-nums">
                            {item.value.toFixed(1)}
                          </span>
                        </div>
                      </ChartTooltipShell>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={areaColor}
                  strokeWidth={1.5}
                  fill={`url(#${gradientId})`}
                  isAnimationActive
                  animationDuration={1100}
                  animationBegin={(staggerIndex ?? 0) * 80}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-14 items-center">
            <Eyebrow tone="muted" family="mono">
              No chart data
            </Eyebrow>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
