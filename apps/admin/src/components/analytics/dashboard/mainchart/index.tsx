"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "premium-ds/button";
import { useAnalyticsStore } from "../../../../stores/analyticsStore";
import { MetricsBar } from "./MetricsBar";
import { MainChart } from "./MainChartGraph";
import { PERIOD_LABEL } from "../shared/chartFormat";
import type { ChartMetric } from "./MetricsBar";
import { NO_REVENUE } from "../shared/revenue";
import type { OverviewMetrics } from "@/lib/analyticsTypes";

const EMPTY_METRICS: OverviewMetrics = {
  visitors: 0,
  pageviews: 0,
  sessions: 0,
  bounceRate: 0,
  sessionDuration: 0,
  revenue: NO_REVENUE,
  payingVisitors: 0,
  conversionRate: 0,
};

export function OverviewCard() {
  const [chartMetric, setChartMetric] = useState<ChartMetric | null>(null);
  const { main, mainLoading, granularity, period, refresh } = useAnalyticsStore(
    useShallow((s) => ({
      main: s.main,
      mainLoading: s.mainLoading,
      granularity: s.granularity,
      period: s.period,
      refresh: s.refresh,
    })),
  );

  const selectMetric = (m: ChartMetric) =>
    setChartMetric((cur) => (cur === m ? null : m));

  if (mainLoading) {
    return <div className="h-135 animate-pulse rounded-lg bg-foreground/3" />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-foreground/6 bg-card">
      <MetricsBar
        current={main?.current ?? EMPTY_METRICS}
        previous={main?.previous ?? EMPTY_METRICS}
        activeMetric={chartMetric}
        onMetricChange={selectMetric}
      />
      <div className="border-t border-foreground/6">
        {main ? (
          <MainChart
            data={main.timeseries}
            granularity={granularity}
            metric={chartMetric}
            periodLabel={PERIOD_LABEL[period] ?? period}
          />
        ) : (
          <div className="flex h-100 flex-col items-center justify-center gap-2">
            <p className="text-sm text-muted-foreground">
              Failed to load chart data
            </p>
            <Button variant="link" size="sm" onClick={refresh}>
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
