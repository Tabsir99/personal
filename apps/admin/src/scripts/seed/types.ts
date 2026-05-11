import type {
  DailyStats,
  TrafficSource,
} from "@tabsircg/schemas/dashboard";

// Local types for raw analytics docs that match what the production event
// handler writes — not the schemas/dashboard view-types. Two reasons:
//   - page_performance docs hold raw counters; the dashboard API derives
//     averages from them.
//   - geo_stats docs actually have a `bounces` field that the schema in
//     @tabsircg/schemas omits.
export type GeoStatsDoc = {
  date: string;
  country: string;
  sessions: number;
  pageViews: number;
  uniqueVisits: number;
  bounces: number;
  devices: { mobile: number; desktop: number; tablet: number };
};

export type Device = keyof GeoStatsDoc["devices"];

export type PagePerfDoc = {
  date: string;
  path: string;
  views: number;
  totalTimeOnPage: number;
  bounces: number;
  exitCount: number;
};

// Output of the traffic simulator. Keys are the Firestore doc IDs the
// production handlers use (`YYYY-MM-DD` for daily; `${date}_${suffix}` for
// the rest). `slugViews` is per-blog-slug view totals across the whole window
// — consumed by `seedBlogs` to backfill `stats.views`.
export type Simulation = {
  daily: Map<string, DailyStats>;
  geo: Map<string, GeoStatsDoc>;
  pages: Map<string, PagePerfDoc>;
  sources: Map<string, TrafficSource>;
  slugViews: Map<string, number>;
};
