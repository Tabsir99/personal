"use client";
import { useState } from "react";
import { useDailyStats } from "@/lib/hooks/useDashboardData";
import { MetricCard } from "./MetricCard";
import { DateRangeSelector } from "./DateRangeSelector";

export function MetricCards() {
  const [days, setDays] = useState(7);
  const { data, error, isLoading } = useDailyStats(days);

  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);
  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0s";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  let currentPeriod: any[] = [];
  let previousPeriod: any[] = [];

  if (data && Array.isArray(data)) {
    const splitIndex = Math.max(0, data.length - days);
    previousPeriod = data.slice(0, splitIndex);
    currentPeriod = data.slice(splitIndex);
  }

  const calcSum = (arr: any[], key: string) =>
    arr.reduce((acc, curr) => acc + (curr[key] || 0), 0);

  const currentSessions = calcSum(currentPeriod, "sessions");
  const currentUniqueVisits = calcSum(currentPeriod, "uniqueVisits");
  const currentViews = calcSum(currentPeriod, "pageViews");
  const currentBounces = calcSum(currentPeriod, "bounces");
  const currentSessionDuration = calcSum(currentPeriod, "totalSessionDuration");
  const currentPortfolioClicks = calcSum(currentPeriod, "portfolioClicks");

  const currentBounceRate =
    currentSessions > 0 ? (currentBounces / currentSessions) * 100 : 0;
  const currentAvgDuration =
    currentSessions > 0 ? currentSessionDuration / currentSessions : 0;

  const previousSessions = calcSum(previousPeriod, "sessions");
  const previousUniqueVisits = calcSum(previousPeriod, "uniqueVisits");
  const previousViews = calcSum(previousPeriod, "pageViews");
  const previousBounces = calcSum(previousPeriod, "bounces");
  const previousSessionDuration = calcSum(
    previousPeriod,
    "totalSessionDuration",
  );
  const previousPortfolioClicks = calcSum(previousPeriod, "portfolioClicks");

  const previousBounceRate =
    previousSessions > 0 ? (previousBounces / previousSessions) * 100 : 0;
  const previousAvgDuration =
    previousSessions > 0 ? previousSessionDuration / previousSessions : 0;

  const calcTrend = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  const formatChartDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getSparklineData = (key: string) =>
    currentPeriod.map((d) => ({
      value: d[key] || 0,
      date: formatChartDate(d.date),
    }));
  const getBounceRateSparkline = () =>
    currentPeriod.map((d) => ({
      value: d.sessions > 0 ? ((d.bounces || 0) / d.sessions) * 100 : 0,
      date: formatChartDate(d.date),
    }));
  const getAvgDurationSparkline = () =>
    currentPeriod.map((d) => ({
      value: d.sessions > 0 ? (d.totalSessionDuration || 0) / d.sessions : 0,
      date: formatChartDate(d.date),
    }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold tracking-tight">Key Metrics</h2>
        <DateRangeSelector value={days} onChange={setDays} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Sessions"
          value={formatNumber(currentSessions)}
          trend={calcTrend(currentSessions, previousSessions)}
          data={getSparklineData("sessions")}
          isLoading={isLoading}
          isError={!!error}
        />
        <MetricCard
          title="Unique Visitors"
          value={formatNumber(currentUniqueVisits)}
          trend={calcTrend(currentUniqueVisits, previousUniqueVisits)}
          data={getSparklineData("uniqueVisits")}
          isLoading={isLoading}
          isError={!!error}
        />
        <MetricCard
          title="Page Views"
          value={formatNumber(currentViews)}
          trend={calcTrend(currentViews, previousViews)}
          data={getSparklineData("pageViews")}
          isLoading={isLoading}
          isError={!!error}
        />
        <MetricCard
          title="Bounce Rate"
          value={`${currentBounceRate.toFixed(1)}%`}
          trend={currentBounceRate - previousBounceRate}
          data={getBounceRateSparkline()}
          isLoading={isLoading}
          isError={!!error}
          trendHigherIsBad={true}
        />
        <MetricCard
          title="Avg Duration"
          value={formatDuration(currentAvgDuration)}
          trend={calcTrend(currentAvgDuration, previousAvgDuration)}
          data={getAvgDurationSparkline()}
          isLoading={isLoading}
          isError={!!error}
        />
        <MetricCard
          title="Portfolio Clicks"
          value={formatNumber(currentPortfolioClicks)}
          trend={calcTrend(currentPortfolioClicks, previousPortfolioClicks)}
          data={getSparklineData("portfolioClicks")}
          isLoading={isLoading}
          isError={!!error}
        />
      </div>
    </div>
  );
}
