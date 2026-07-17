"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  OverviewMetrics,
  TimeseriesPoint,
  SourceMetric,
  PageMetric,
  LocationMetric,
  SystemMetric,
  ExitLinkMetric,
  HostnameMetric,
  Period,
  Granularity,
} from "./types";

interface MainData {
  current: OverviewMetrics;
  previous: OverviewMetrics;
  timeseries: TimeseriesPoint[];
}

interface SourcesData {
  referrers: SourceMetric[];
}

interface PagesData {
  pages: PageMetric[];
  entryPages: PageMetric[];
}

interface LocationsData {
  countries: LocationMetric[];
  regions: LocationMetric[];
  cities: LocationMetric[];
}

interface SystemData {
  browsers: SystemMetric[];
  os: SystemMetric[];
  devices: SystemMetric[];
}

interface RealtimeData {
  count: number;
}

export interface AnalyticsData {
  main: MainData | null;
  sources: SourcesData | null;
  pages: PagesData | null;
  locations: LocationsData | null;
  system: SystemData | null;
  exitLinks: ExitLinkMetric[] | null;
  hostnames: HostnameMetric[] | null;
  realtime: RealtimeData | null;
}

const EMPTY: AnalyticsData = {
  main: null,
  sources: null,
  pages: null,
  locations: null,
  system: null,
  exitLinks: null,
  hostnames: null,
  realtime: null,
};

function granularityForPeriod(period: Period): Granularity {
  switch (period) {
    case "today":
    case "yesterday":
      return "hourly";
    case "last7d":
      return "daily";
    case "last30d":
      return "daily";
    case "last90d":
      return "weekly";
  }
}

async function fetchEndpoint<T>(
  path: string,
  websiteId: string,
  period: Period,
  extra?: Record<string, string>,
): Promise<T | null> {
  const params = new URLSearchParams({
    websiteId,
    period,
    ...extra,
  });
  try {
    const res = await fetch(`/api/analytics/${path}?${params}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.status === "success" ? json.data : null;
  } catch {
    return null;
  }
}

export function useAnalytics(websiteId: string, period: Period) {
  const [data, setData] = useState<AnalyticsData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);

    const granularity = granularityForPeriod(period);

    const [main, sources, pages, locations, system, exitLinks, hostnames, realtime] =
      await Promise.all([
        fetchEndpoint<MainData>("main", websiteId, period, { granularity }),
        fetchEndpoint<SourcesData>("sources", websiteId, period),
        fetchEndpoint<PagesData>("pages", websiteId, period),
        fetchEndpoint<LocationsData>("locations", websiteId, period),
        fetchEndpoint<SystemData>("system", websiteId, period),
        fetchEndpoint<ExitLinkMetric[]>("exit-links", websiteId, period),
        fetchEndpoint<HostnameMetric[]>("hostnames", websiteId, period),
        fetchEndpoint<RealtimeData>("realtime", websiteId, period),
      ]);

    if (ctrl.signal.aborted) return;

    setData({ main, sources, pages, locations, system, exitLinks, hostnames, realtime });
    setLoading(false);
  }, [websiteId, period]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { data, loading, refresh: load };
}
