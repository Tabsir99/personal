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
  newVisitors: number;
  returningVisitors: number;
  pageviews: number;
  sessions: number;
  bounceRate: number;
  sessionDuration: number;
  revenue: number;
}

// New-vs-returning split. Carried only on sources, where it's an acquisition
// signal (which channels bring new vs returning traffic). Every other breakdown
// carries a single `uv` total; uv = newVisitors + returningVisitors.
interface VisitorSplit {
  newVisitors: number;
  returningVisitors: number;
}

export interface SourceMetric extends VisitorSplit {
  name: string;
  channel: string;
  revenue: number;
}

export interface ChannelMetric extends VisitorSplit {
  name: string;
  revenue: number;
}

export const CAMPAIGN_DIMENSIONS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ref",
] as const;
export type CampaignDimension = (typeof CAMPAIGN_DIMENSIONS)[number];

export interface CampaignMetric {
  name: string;
  uv: number;
  revenue: number;
}

export interface PageMetric {
  name: string;
  uv: number;
  pageviews: number;
  revenue: number;
}

export interface EntryPageMetric {
  name: string;
  uv: number;
  revenue: number;
}

export interface LocationMetric {
  name: string;
  uv: number;
  revenue: number;
  country?: string;
}

export interface SystemMetric {
  name: string;
  uv: number;
  revenue: number;
}

export interface ExitLinkMetric {
  name: string;
  uv: number;
  exits: number;
  revenue: number;
}

export interface HostnameMetric {
  name: string;
  uv: number;
  revenue: number;
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
  campaigns: CampaignsResponse;
}

export interface CampaignsResponse {
  dims: Record<CampaignDimension, CampaignMetric[]>;
  totals: Record<CampaignDimension, number>;
  all: CampaignMetric[];
  allTotal: number;
}

/**
 * Roll per-dimension campaign breakdowns into the wire shape: per-dim visitor
 * totals, plus a flat "All" list where each row is one `?param=value` across
 * every parameter, ranked by visitors. `allTotal` sums every parameter's
 * visitors — a per-value sum, not a unique-visitor count (a visitor tagged on
 * two params counts in each).
 */
export function rollupCampaigns(
  dims: Record<CampaignDimension, CampaignMetric[]>,
): CampaignsResponse {
  const totals = Object.fromEntries(
    CAMPAIGN_DIMENSIONS.map((d) => [d, dims[d].reduce((s, c) => s + c.uv, 0)]),
  ) as Record<CampaignDimension, number>;

  const all = CAMPAIGN_DIMENSIONS.flatMap((d) =>
    dims[d].map((c) => ({
      name: `?${d}=${c.name}`,
      uv: c.uv,
      revenue: c.revenue,
    })),
  )
    .sort((a, b) => b.uv - a.uv)
    .slice(0, 50);

  const allTotal = Object.values(totals).reduce((s, n) => s + n, 0);

  return { dims, totals, all, allTotal };
}

export interface PagesResponse {
  pages: PageMetric[];
  entryPages: EntryPageMetric[];
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

export type BotCategory =
  "answer_fetch" | "search_index" | "training" | "ai_crawler" | "generic";

/** One time bucket; carries a visit count per category present in the range. */
export type BotTimeseriesPoint = { timestamp: number } & Partial<
  Record<BotCategory, number>
>;

export interface BotCategoryTotal {
  category: BotCategory;
  count: number;
}

export interface BotMetric {
  /** bot_name / agent as stored, e.g. "GPTBot", "ChatGPT-User", "Googlebot". */
  name: string;
  category: BotCategory;
  count: number;
}

export interface BotsResponse {
  total: number;
  categories: BotCategoryTotal[];
  timeseries: BotTimeseriesPoint[];
  bots: BotMetric[];
}

export interface BotPageMetric {
  /** Path + search the bot hit, e.g. "/", "/?ref=indiepage". */
  name: string;
  count: number;
}

export interface BotPagesResponse {
  bot: string;
  category: BotCategory;
  total: number;
  pages: BotPageMetric[];
}
