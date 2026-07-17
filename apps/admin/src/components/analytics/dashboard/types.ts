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

export interface PageMetric {
  name: string;
  uv: number;
  pageviews: number;
}

export interface LocationMetric {
  name: string;
  uv: number;
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

export type Period = "today" | "yesterday" | "last7d" | "last30d" | "last90d";
export type Granularity = "hourly" | "daily" | "weekly" | "monthly";
