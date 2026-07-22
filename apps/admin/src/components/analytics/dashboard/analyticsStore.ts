import { create } from "zustand";
import type {
  OverviewMetrics,
  TimeseriesPoint,
  SourceMetric,
  ChannelMetric,
  PageMetric,
  EntryPageMetric,
  LocationMetric,
  SystemMetric,
  ExitLinkMetric,
  HostnameMetric,
  CampaignsResponse,
  Period,
  Granularity,
  BotsResponse,
  BotPagesResponse,
} from "@/lib/analyticsTypes";
import { mockFetchEndpoint } from "./analyticsMock";

interface MainData {
  current: OverviewMetrics;
  previous: OverviewMetrics;
  timeseries: TimeseriesPoint[];
}

interface SourcesData {
  referrers: SourceMetric[];
  channels: ChannelMetric[];
  campaigns: CampaignsResponse;
}

interface PagesData {
  pages: PageMetric[];
  entryPages: EntryPageMetric[];
  hostnames: HostnameMetric[];
  exitLinks: ExitLinkMetric[];
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

interface AnalyticsState {
  websiteId: string | null;
  period: Period;
  granularity: Granularity;

  main: MainData | null;
  mainLoading: boolean;

  sources: SourcesData | null;
  sourcesLoading: boolean;

  pages: PagesData | null;
  pagesLoading: boolean;

  locations: LocationsData | null;
  locationsLoading: boolean;

  system: SystemData | null;
  systemLoading: boolean;

  bots: BotsResponse | null;
  botsLoading: boolean;

  realtimeCount: number | null;
  realtimeLoading: boolean;

  setPeriod: (period: Period) => void;
  setGranularity: (granularity: Granularity) => void;
  fetchAll: (websiteId: string, period: Period) => void;
  fetchBotPages: (name: string) => Promise<BotPagesResponse | null>;
  refresh: () => void;
}

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

// Toggle this to test visuals with mock data without calling the server
const USE_MOCKS = true;

async function fetchEndpoint<T>(
  path: string,
  websiteId: string,
  period: Period,
  extra?: Record<string, string>,
): Promise<T | null> {
  if (USE_MOCKS) {
    return mockFetchEndpoint<T>(path, period, extra);
  }

  const params = new URLSearchParams({ websiteId, period, ...extra });
  try {
    const res = await fetch(`/api/analytics/${path}?${params}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.status === "success" ? json.data : null;
  } catch {
    return null;
  }
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  websiteId: null,
  period: "last7d",
  granularity: "daily",

  main: null,
  mainLoading: true,

  sources: null,
  sourcesLoading: true,

  pages: null,
  pagesLoading: true,

  locations: null,
  locationsLoading: true,

  system: null,
  systemLoading: true,

  bots: null,
  botsLoading: true,

  realtimeCount: null,
  realtimeLoading: true,

  setPeriod: (period) => {
    set({ period, granularity: granularityForPeriod(period) });
    const { websiteId } = get();
    if (websiteId) get().fetchAll(websiteId, period);
  },

  setGranularity: (granularity) => {
    set({ granularity });
    const { websiteId, period } = get();
    if (websiteId) {
      set({ mainLoading: true });
      fetchEndpoint<MainData>("main", websiteId, period, { granularity }).then(
        (main) => set({ main, mainLoading: false }),
      );
    }
  },

  refresh: () => {
    const { websiteId, period } = get();
    if (websiteId) get().fetchAll(websiteId, period);
  },

  fetchBotPages: (name) => {
    const { websiteId, period } = get();
    if (!websiteId) return Promise.resolve(null);
    return fetchEndpoint<BotPagesResponse>("bots/pages", websiteId, period, {
      bot: name,
    });
  },

  fetchAll: (websiteId, period) => {
    const state = get();
    const same = state.websiteId === websiteId && state.period === period;

    set({ websiteId, period });

    const granularity = state.granularity;

    if (!same || !state.mainLoading) {
      set({ mainLoading: true });
      fetchEndpoint<MainData>("main", websiteId, period, { granularity }).then(
        (main) => set({ main, mainLoading: false }),
      );
    }

    if (!same || !state.sourcesLoading) {
      set({ sourcesLoading: true });
      fetchEndpoint<SourcesData>("sources", websiteId, period).then((sources) =>
        set({ sources, sourcesLoading: false }),
      );
    }

    if (!same || !state.pagesLoading) {
      set({ pagesLoading: true });
      fetchEndpoint<PagesData>("pages", websiteId, period).then((pages) =>
        set({ pages, pagesLoading: false }),
      );
    }

    if (!same || !state.locationsLoading) {
      set({ locationsLoading: true });
      fetchEndpoint<LocationsData>("locations", websiteId, period).then(
        (locations) => set({ locations, locationsLoading: false }),
      );
    }

    if (!same || !state.systemLoading) {
      set({ systemLoading: true });
      fetchEndpoint<SystemData>("system", websiteId, period).then((system) =>
        set({ system, systemLoading: false }),
      );
    }

    if (!same || !state.botsLoading) {
      set({ botsLoading: true });
      fetchEndpoint<BotsResponse>("bots", websiteId, period, {
        granularity,
      }).then((bots) => set({ bots, botsLoading: false }));
    }

    if (!same || !state.realtimeLoading) {
      set({ realtimeLoading: true });
      fetchEndpoint<{ count: number }>("realtime", websiteId, period).then(
        (data) =>
          set({ realtimeCount: data?.count ?? null, realtimeLoading: false }),
      );
    }
  },
}));
