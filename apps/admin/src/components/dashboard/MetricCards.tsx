"use client";
import { useState } from "react";

import { useDailyStats } from "@/hooks/useDashboardData";
import { Eyebrow } from "@/components/ui/Eyebrow";

import { MetricCard } from "./MetricCard";
import { DateRangeSelector } from "./DateRangeSelector";

interface DailyStat {
  date: string;
  sessions?: number;
  uniqueVisits?: number;
  pageViews?: number;
  bounces?: number;
  totalSessionDuration?: number;
  portfolioClicks?: number;
}

const numberFormat = new Intl.NumberFormat();

function formatNumber(num: number) {
  return numberFormat.format(num);
}

function formatDuration(seconds: number) {
  if (!seconds || isNaN(seconds)) return "0s";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function calcSum<K extends keyof DailyStat>(arr: DailyStat[], key: K): number {
  return arr.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0);
}

function calcTrend(curr: number, prev: number) {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

function formatChartDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function MetricCards() {
  const [days, setDays] = useState(7);
  const { data, error, isLoading } = useDailyStats(days);

  let currentPeriod: DailyStat[] = [];
  let previousPeriod: DailyStat[] = [];

  if (data && Array.isArray(data)) {
    const splitIndex = Math.max(0, data.length - days);
    previousPeriod = data.slice(0, splitIndex);
    currentPeriod = data.slice(splitIndex);
  }

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

  const sparkline = (key: keyof DailyStat) =>
    currentPeriod.map((d) => ({
      value: Number(d[key]) || 0,
      date: formatChartDate(d.date),
    }));

  const bounceRateSparkline = () =>
    currentPeriod.map((d) => ({
      value: (d.sessions ?? 0) > 0 ? ((d.bounces ?? 0) / (d.sessions ?? 0)) * 100 : 0,
      date: formatChartDate(d.date),
    }));

  const avgDurationSparkline = () =>
    currentPeriod.map((d) => ({
      value:
        (d.sessions ?? 0) > 0
          ? (d.totalSessionDuration ?? 0) / (d.sessions ?? 0)
          : 0,
      date: formatChartDate(d.date),
    }));

  const cards = [
    {
      title: "Sessions",
      value: formatNumber(currentSessions),
      trend: calcTrend(currentSessions, previousSessions),
      data: sparkline("sessions"),
    },
    {
      title: "Unique Visitors",
      value: formatNumber(currentUniqueVisits),
      trend: calcTrend(currentUniqueVisits, previousUniqueVisits),
      data: sparkline("uniqueVisits"),
    },
    {
      title: "Page Views",
      value: formatNumber(currentViews),
      trend: calcTrend(currentViews, previousViews),
      data: sparkline("pageViews"),
    },
    {
      title: "Bounce Rate",
      value: `${currentBounceRate.toFixed(1)}%`,
      trend: currentBounceRate - previousBounceRate,
      data: bounceRateSparkline(),
      trendHigherIsBad: true,
    },
    {
      title: "Avg Duration",
      value: formatDuration(currentAvgDuration),
      trend: calcTrend(currentAvgDuration, previousAvgDuration),
      data: avgDurationSparkline(),
    },
    {
      title: "Portfolio Clicks",
      value: formatNumber(currentPortfolioClicks),
      trend: calcTrend(currentPortfolioClicks, previousPortfolioClicks),
      data: sparkline("portfolioClicks"),
    },
  ] as const;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <Eyebrow tone="muted" family="mono">
            Overview
          </Eyebrow>
          <h2 className="text-lg leading-tight font-semibold tracking-tight">
            Key metrics
          </h2>
        </div>
        <DateRangeSelector value={days} onChange={setDays} />
      </div>
      <div className="stagger-cascade-tight grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map((card, index) => (
          <div
            key={card.title}
            style={{ ["--stagger-index" as string]: index }}
          >
            <MetricCard
              title={card.title}
              value={card.value}
              trend={card.trend}
              data={card.data}
              isLoading={isLoading}
              isError={!!error}
              {...("trendHigherIsBad" in card
                ? { trendHigherIsBad: card.trendHigherIsBad }
                : {})}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
