export interface OverviewMetrics {
  visitors: number;
  pageviews: number;
  sessions: number;
  bounceRate: number;
  sessionDuration: number;
}

export interface TimeseriesPoint {
  timestamp: number;
  visitors: number;
  pageviews: number;
  sessions: number;
}

export interface SourceMetric {
  name: string;
  uv: number;
  channel: string;
}

export interface ChannelMetric {
  name: string;
  uv: number;
}

export interface PageMetric {
  name: string;
  uv: number;
  pageviews: number;
}

export interface LocationMetric {
  name: string;
  uv: number;
  country?: string;
}

export interface SystemMetric {
  name: string;
  uv: number;
}

export interface ExitLinkMetric {
  name: string;
  uv: number;
  exits: number;
}

export interface HostnameMetric {
  name: string;
  uv: number;
}

export interface GoalMetric {
  name: string;
  uv: number;
  total: number;
  conversionRate: number;
}

export type Period = "today" | "yesterday" | "last7d" | "last30d" | "last90d";
export type Granularity = "hourly" | "daily" | "weekly" | "monthly";

export interface MainResponse {
  current: OverviewMetrics;
  previous: OverviewMetrics;
  timeseries: TimeseriesPoint[];
}

export interface SourcesResponse {
  referrers: SourceMetric[];
  channels: ChannelMetric[];
}

export interface PagesResponse {
  pages: PageMetric[];
  entryPages: PageMetric[];
  hostnames: HostnameMetric[];
  exitLinks: ExitLinkMetric[];
}

export interface LocationsResponse {
  countries: LocationMetric[];
  regions: LocationMetric[];
  cities: LocationMetric[];
}

export interface SystemResponse {
  browsers: SystemMetric[];
  os: SystemMetric[];
  devices: SystemMetric[];
}

export interface EventsResponse {
  goals: GoalMetric[];
  totalVisitors: number;
}

export interface RealtimeResponse {
  count: number;
}
