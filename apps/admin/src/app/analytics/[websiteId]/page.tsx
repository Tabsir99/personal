"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowsClockwise } from "@phosphor-icons/react";
import { Button } from "premium-ds/button";
import { Select } from "premium-ds/select";
import { Badge } from "premium-ds/badge";
import { getAnalyticsWebsites } from "@/actions/analyticsActions";
import type { AnalyticsWebsite } from "@/actions/analyticsActions";
import {
  MetricsBar,
  MainChart,
  DataPanel,
  RankedList,
  useAnalytics,
} from "@/components/analytics/dashboard";
import type { Period } from "@/components/analytics/dashboard";

const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7d", label: "Last 7 days" },
  { value: "last30d", label: "Last 30 days" },
  { value: "last90d", label: "Last 90 days" },
];

const GRANULARITY_MAP: Record<Period, string> = {
  today: "hourly",
  yesterday: "hourly",
  last7d: "daily",
  last30d: "daily",
  last90d: "weekly",
};

export default function WebsiteDetailPage() {
  const params = useParams<{ websiteId: string }>();
  const router = useRouter();
  const websiteId = params.websiteId;

  const [period, setPeriod] = useState<Period>("last30d");
  const [website, setWebsite] = useState<AnalyticsWebsite | null>(null);
  const [siteLoading, setSiteLoading] = useState(true);

  const { data, loading, refresh } = useAnalytics(websiteId, period);

  const loadSite = useCallback(async () => {
    const res = await getAnalyticsWebsites();
    if (res.status === "success") {
      const found = res.data.find((w) => w.id === websiteId);
      setWebsite(found ?? null);
    }
    setSiteLoading(false);
  }, [websiteId]);

  useEffect(() => {
    loadSite();
  }, [loadSite]);

  if (siteLoading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="space-y-4 pt-2">
          <div className="h-7 w-48 animate-pulse rounded-md bg-foreground/5" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-foreground/4" />
          <div className="mt-6 h-[72px] animate-pulse rounded-lg bg-foreground/3" />
          <div className="mt-4 h-[280px] animate-pulse rounded-lg bg-foreground/3" />
        </div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="mx-auto max-w-6xl pt-12 text-center">
        <p className="text-muted-foreground">Website not found</p>
        <Button variant="ghost" size="sm" onClick={() => router.push("/analytics")} className="mt-4">
          Back to websites
        </Button>
      </div>
    );
  }

  const granularity = GRANULARITY_MAP[period] as "hourly" | "daily" | "weekly" | "monthly";

  return (
    <div className="mx-auto max-w-6xl animate-in duration-300 ease-out fade-in">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6">
        <div className="flex items-center gap-3 min-w-0">
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
              <h1 className="truncate text-lg font-semibold tracking-tight">
                {website.name}
              </h1>
              {data.realtime && data.realtime.count > 0 && (
                <Badge tone="success" size="sm" live>
                  {data.realtime.count} online
                </Badge>
              )}
            </div>
            <p className="text-[12px] text-muted-foreground/70 font-mono truncate mt-0.5">
              {website.origins.filter((o) => o !== "*").join(", ") || website.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="w-[150px]">
            <Select
              value={period}
              onChange={(v) => setPeriod(v as Period)}
              options={PERIOD_OPTIONS}
              ariaLabel="Time period"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refresh}
            aria-label="Refresh"
            className={loading ? "animate-spin" : ""}
          >
            <ArrowsClockwise size={16} />
          </Button>
        </div>
      </header>

      {/* Metrics */}
      {data.main && (
        <div className="stagger-cascade">
          <div style={{ "--stagger-index": 0 } as React.CSSProperties}>
            <MetricsBar
              current={data.main.current}
              previous={data.main.previous}
              realtimeCount={data.realtime?.count ?? null}
            />
          </div>

          {/* Main chart */}
          <div className="mt-5" style={{ "--stagger-index": 1 } as React.CSSProperties}>
            <MainChart data={data.main.timeseries} granularity={granularity} />
          </div>

          {/* Data panels row: Sources + Locations */}
          <div
            className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5"
            style={{ "--stagger-index": 2 } as React.CSSProperties}
          >
            <SourcesPanel referrers={data.sources?.referrers ?? []} />
            <LocationsPanel locations={data.locations} />
          </div>

          {/* Data panels row: Pages + System */}
          <div
            className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5"
            style={{ "--stagger-index": 3 } as React.CSSProperties}
          >
            <PagesPanel pages={data.pages} />
            <SystemPanel system={data.system} />
          </div>

          {/* Placeholder panels: Exit Links + AI Crawlers */}
          <div
            className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5"
            style={{ "--stagger-index": 4 } as React.CSSProperties}
          >
            <ExitLinksPanel exitLinks={data.exitLinks ?? []} />
            <CrawlersPlaceholder />
          </div>
        </div>
      )}

      {/* Full-page loading overlay (first load only) */}
      {loading && !data.main && (
        <div className="space-y-5 mt-2">
          <div className="h-[72px] animate-pulse rounded-lg bg-foreground/3" />
          <div className="h-[280px] animate-pulse rounded-lg bg-foreground/3" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="h-[300px] animate-pulse rounded-lg bg-foreground/3" />
            <div className="h-[300px] animate-pulse rounded-lg bg-foreground/3" />
          </div>
        </div>
      )}
    </div>
  );
}

function SourcesPanel({ referrers }: { referrers: { name: string; uv: number; channel: string }[] }) {
  return (
    <DataPanel
      tabs={[
        { value: "channel", label: "Channel" },
        { value: "referrer", label: "Referrer" },
      ]}
    >
      {(tab) => {
        if (tab === "channel") {
          const channelMap = new Map<string, number>();
          for (const r of referrers) {
            channelMap.set(r.channel, (channelMap.get(r.channel) ?? 0) + r.uv);
          }
          const items = [...channelMap.entries()]
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
          return <RankedList items={items} />;
        }
        return (
          <RankedList items={referrers.map((r) => ({ name: r.name, value: r.uv }))} />
        );
      }}
    </DataPanel>
  );
}

function LocationsPanel({ locations }: { locations: { countries: { name: string; uv: number }[]; regions: { name: string; uv: number }[]; cities: { name: string; uv: number }[] } | null }) {
  return (
    <DataPanel
      tabs={[
        { value: "country", label: "Country" },
        { value: "region", label: "Region" },
        { value: "city", label: "City" },
      ]}
    >
      {(tab) => {
        if (!locations) return <RankedList items={[]} />;
        const map = { country: locations.countries, region: locations.regions, city: locations.cities };
        return <RankedList items={(map[tab as keyof typeof map] ?? []).map((l) => ({ name: l.name, value: l.uv }))} />;
      }}
    </DataPanel>
  );
}

function PagesPanel({ pages }: { pages: { pages: { name: string; uv: number; pageviews: number }[]; entryPages: { name: string; uv: number; pageviews: number }[] } | null }) {
  return (
    <DataPanel
      tabs={[
        { value: "pages", label: "Page" },
        { value: "entry", label: "Entry page" },
      ]}
    >
      {(tab) => {
        if (!pages) return <RankedList items={[]} />;
        const list = tab === "pages" ? pages.pages : pages.entryPages;
        return <RankedList items={list.map((p) => ({ name: p.name, value: p.uv }))} />;
      }}
    </DataPanel>
  );
}

function SystemPanel({ system }: { system: { browsers: { name: string; uv: number }[]; os: { name: string; uv: number }[]; devices: { name: string; uv: number }[] } | null }) {
  return (
    <DataPanel
      tabs={[
        { value: "browser", label: "Browser" },
        { value: "os", label: "OS" },
        { value: "device", label: "Device" },
      ]}
    >
      {(tab) => {
        if (!system) return <RankedList items={[]} />;
        const map = { browser: system.browsers, os: system.os, device: system.devices };
        return <RankedList items={(map[tab as keyof typeof map] ?? []).map((s) => ({ name: s.name, value: s.uv }))} />;
      }}
    </DataPanel>
  );
}

function ExitLinksPanel({ exitLinks }: { exitLinks: { name: string; uv: number; exits: number }[] }) {
  return (
    <DataPanel
      tabs={[
        { value: "hostname", label: "Hostname" },
        { value: "exit", label: "Exit link" },
      ]}
    >
      {(tab) => {
        if (tab === "hostname") {
          const hostMap = new Map<string, number>();
          for (const link of exitLinks) {
            try {
              const host = new URL(link.name).hostname;
              hostMap.set(host, (hostMap.get(host) ?? 0) + link.uv);
            } catch {
              hostMap.set(link.name, (hostMap.get(link.name) ?? 0) + link.uv);
            }
          }
          const items = [...hostMap.entries()]
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
          return <RankedList items={items} />;
        }
        return <RankedList items={exitLinks.map((l) => ({ name: l.name, value: l.uv }))} />;
      }}
    </DataPanel>
  );
}

function CrawlersPlaceholder() {
  return (
    <div className="rounded-lg border border-foreground/6 bg-card overflow-hidden">
      <div className="border-b border-foreground/6 px-4 py-3">
        <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
          AI crawlers
        </span>
      </div>
      <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
        <div className="size-10 rounded-full bg-foreground/[0.03] flex items-center justify-center mb-3">
          <span className="text-muted-foreground/40 text-lg">🤖</span>
        </div>
        <p className="text-[13px] text-muted-foreground/60">
          Bot and crawler analytics coming soon
        </p>
      </div>
    </div>
  );
}
