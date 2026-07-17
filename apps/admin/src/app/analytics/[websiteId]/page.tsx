"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { ArrowLeft, ArrowsClockwise } from "@phosphor-icons/react";
import { Button } from "premium-ds/button";
import { Select } from "premium-ds/select";
import { Badge } from "premium-ds/badge";
import { getAnalyticsWebsites } from "@/actions/analyticsActions";
import type { AnalyticsWebsite } from "@/actions/analyticsActions";
import {
  useAnalyticsStore,
  OverviewCard,
  SourcesPanel,
  LocationsPanel,
  PagesPanel,
  SystemPanel,
} from "@/components/analytics/dashboard";
import type { Period, Granularity } from "@/components/analytics/dashboard";

const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7d", label: "Last 7 days" },
  { value: "last30d", label: "Last 30 days" },
  { value: "last90d", label: "Last 90 days" },
];

const GRANULARITY_OPTIONS = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

export default function WebsiteDetailPage() {
  const params = useParams<{ websiteId: string }>();
  const router = useRouter();
  const websiteId = params.websiteId;

  const [website, setWebsite] = useState<AnalyticsWebsite | null>(null);
  const [siteLoading, setSiteLoading] = useState(true);

  const { period, granularity, setPeriod, setGranularity, fetchAll, refresh, realtimeCount, mainLoading } = useAnalyticsStore(useShallow((s) => ({
    period: s.period,
    granularity: s.granularity,
    setPeriod: s.setPeriod,
    setGranularity: s.setGranularity,
    fetchAll: s.fetchAll,
    refresh: s.refresh,
    realtimeCount: s.realtimeCount,
    mainLoading: s.mainLoading,
  })));

  useEffect(() => {
    let cancelled = false;
    getAnalyticsWebsites().then((res) => {
      if (cancelled) return;
      if (res.status === "success") {
        setWebsite(res.data.find((w) => w.id === websiteId) ?? null);
      }
      setSiteLoading(false);
    });
    return () => { cancelled = true; };
  }, [websiteId]);

  useEffect(() => {
    fetchAll(websiteId, period);
  }, [websiteId, fetchAll, period]);

  if (!siteLoading && !website) {
    return (
      <div className="mx-auto max-w-6xl pt-12 text-center">
        <p className="text-muted-foreground">Website not found</p>
        <Button variant="ghost" size="sm" onClick={() => router.push("/analytics")} className="mt-4">
          Back to websites
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl animate-in duration-300 ease-out fade-in">
      <header className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/analytics")}
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              {siteLoading ? (
                <div className="h-5 w-40 animate-pulse rounded-md bg-foreground/5" />
              ) : (
                <h1 className="truncate text-lg font-semibold tracking-tight">
                  {website!.name}
                </h1>
              )}
              {realtimeCount !== null && realtimeCount > 0 && (
                <Badge tone="success" size="sm" live>
                  {realtimeCount} online
                </Badge>
              )}
            </div>
            {siteLoading ? (
              <div className="mt-1 h-3 w-56 animate-pulse rounded-md bg-foreground/4" />
            ) : (
              <p className="mt-0.5 truncate font-mono text-[12px] text-muted-foreground/70">
                {website!.origins.filter((o) => o !== "*").join(", ") || website!.id}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="w-[150px]">
            <Select
              value={period}
              onChange={(v) => setPeriod(v as Period)}
              options={PERIOD_OPTIONS}
              ariaLabel="Time period"
            />
          </div>
          <div className="w-[110px]">
            <Select
              value={granularity}
              onChange={(v) => setGranularity(v as Granularity)}
              options={GRANULARITY_OPTIONS}
              ariaLabel="Granularity"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refresh}
            aria-label="Refresh"
            className={mainLoading ? "animate-spin" : ""}
          >
            <ArrowsClockwise size={16} />
          </Button>
        </div>
      </header>

      <div className="space-y-5">
        <OverviewCard />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SourcesPanel />
          <LocationsPanel />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <PagesPanel />
          <SystemPanel />
        </div>
      </div>
    </div>
  );
}
