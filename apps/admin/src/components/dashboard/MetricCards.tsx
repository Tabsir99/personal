"use client";
import { useDailyStats } from "@/lib/hooks/useDashboardData";
import { MetricCard } from "./MetricCard";

export function MetricCards({ days }: { days: number }) {
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

  const calcSum = (arr: any[], key: string) => arr.reduce((acc, curr) => acc + (curr[key] || 0), 0);

  const currentSessions = calcSum(currentPeriod, "sessions");
  const currentUniqueVisits = calcSum(currentPeriod, "uniqueVisits");
  const currentViews = calcSum(currentPeriod, "pageViews");
  const currentBounces = calcSum(currentPeriod, "bounces");
  const currentSessionDuration = calcSum(currentPeriod, "totalSessionDuration");
  const currentPortfolioClicks = calcSum(currentPeriod, "portfolioClicks");

  const currentBounceRate = currentSessions > 0 ? (currentBounces / currentSessions) * 100 : 0;
  const currentAvgDuration = currentSessions > 0 ? currentSessionDuration / currentSessions : 0;

  const previousSessions = calcSum(previousPeriod, "sessions");
  const previousUniqueVisits = calcSum(previousPeriod, "uniqueVisits");
  const previousViews = calcSum(previousPeriod, "pageViews");
  const previousBounces = calcSum(previousPeriod, "bounces");
  const previousSessionDuration = calcSum(previousPeriod, "totalSessionDuration");
  const previousPortfolioClicks = calcSum(previousPeriod, "portfolioClicks");

  const previousBounceRate = previousSessions > 0 ? (previousBounces / previousSessions) * 100 : 0;
  const previousAvgDuration = previousSessions > 0 ? previousSessionDuration / previousSessions : 0;

  const calcTrend = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  const getSparklineData = (key: string) => currentPeriod.map(d => d[key] || 0);
  const getBounceRateSparkline = () => currentPeriod.map(d => (d.sessions > 0 ? (d.bounces || 0) / d.sessions * 100 : 0));
  const getAvgDurationSparkline = () => currentPeriod.map(d => (d.sessions > 0 ? (d.totalSessionDuration || 0) / d.sessions : 0));

  return (
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
  );
}
