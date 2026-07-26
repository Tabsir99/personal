export interface OverviewMetrics {
  visitors: number;
  pageviews: number;
  sessions: number;
  bounceRate: number;
  sessionDuration: number;
  revenue: number;
  payingVisitors: number;
  conversionRate: number;
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
  payingVisitors: number;
  conversionRate: number;
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

export type PresetPeriod =
  "today" | "yesterday" | "last7d" | "last30d" | "last90d";
export type Period = PresetPeriod | `custom:${string}:${string}`;
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

/** `allTotal` is a per-value sum, not unique visitors: a visitor tagged on two
 * params counts in each. */
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

/** Wide per-bucket series: one numeric key per goal name, plus the bucket ts. */
export type GoalSeriesPoint = { timestamp: number } & Record<string, number>;

export interface GoalsResponse {
  goals: GoalMetric[];
  series: GoalSeriesPoint[];
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

// ── Funnels ──────────────────────────────────────────────────────────────
// A funnel is an ordered chain of goals. Each step is an independent count for
// the period, sized against the max across steps — nothing forces a decrease.

export type FunnelStepMatch = "equals" | "contains" | "startsWith" | "endsWith";
export type GoalCompletion = "completed";

interface FunnelStepBase {
  id: string;
  name: string;
  goalCompletionType: GoalCompletion;
}

export interface FunnelPageviewStep extends FunnelStepBase {
  type: "pageview";
  url: string;
  urlMatchType: FunnelStepMatch;
}

export interface FunnelGoalStep extends FunnelStepBase {
  type: "goal";
  goalName: string;
}

export type FunnelStep = FunnelPageviewStep | FunnelGoalStep;

export interface FunnelDefinition {
  id: string;
  websiteId: string;
  name: string;
  slug: string;
  steps: FunnelStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FunnelStepReferrer {
  referrer: string;
  visitors: number;
  percentage: number;
}

export interface FunnelStepCountry {
  countryCode: string;
  visitors: number;
  percentage: number;
}

export interface FunnelStepData {
  id: string;
  label: string;
  value: number;
  revenue: number;
  stepIndex: number;
  stepType: FunnelStep["type"];
  conversionRate: number;
  dropoffFromPrevious: number;
  topReferrers: FunnelStepReferrer[];
  topCountries: FunnelStepCountry[];
}

export interface FunnelMetrics {
  totalVisitors: number;
  completions: number;
  overallConversionRate: number;
  overallRevenuePerVisitor: number;
  period: string;
  timezone: string;
  lastUpdated: string;
}

export interface FunnelsListResponse {
  funnels: FunnelDefinition[];
}

export interface FunnelDetailResponse {
  funnel: FunnelDefinition;
  data: FunnelStepData[];
  metrics: FunnelMetrics;
}


export type JourneyEventType = "referral" | "pageview" | "custom" | "payment";

export interface JourneyTrackingParam {
  type: string;
  value: string;
}

export interface JourneyReferralData {
  domainName: string;
  channel: string;
  fullReferrer: string;
  trackingParams: JourneyTrackingParam[];
}

export interface JourneyPageviewData {
  path: string;
  hostname: string;
  count: number;
}

export interface JourneyCustomData {
  eventName: string;
  metadata: Record<string, unknown>;
}

export interface JourneyPaymentData {
  amount: number;
}

interface JourneyEntryBase {
  timestamp: number;
  isGoal: boolean;
}

export interface JourneyReferralEntry extends JourneyEntryBase {
  eventType: "referral";
  data: JourneyReferralData;
}

export interface JourneyPageviewEntry extends JourneyEntryBase {
  eventType: "pageview";
  data: JourneyPageviewData;
  lastTimestamp: number;
}

export interface JourneyCustomEntry extends JourneyEntryBase {
  eventType: "custom";
  data: JourneyCustomData;
}

export interface JourneyPaymentEntry extends JourneyEntryBase {
  eventType: "payment";
  data: JourneyPaymentData;
}

export type JourneyEntry =
  | JourneyReferralEntry
  | JourneyPageviewEntry
  | JourneyCustomEntry
  | JourneyPaymentEntry;

export interface JourneySourceAttribution {
  timestamp: number;
  referrer: string;
  params: Record<string, string>;
}

export interface JourneyVisitor {
  visitorId: string;
  customerName: string;
  customerEmail: string;
  profileMetadata: Record<string, unknown>;
  amount: number;
  channel: string;
  sourceAttribution: JourneySourceAttribution;
  countryCode: string;
  countryName: string;
  cityName: string;
  browserName: string;
  osName: string;
  deviceType: string;
  viewport: { width: number; height: number };
  pageviews: number;
  timeBeforeGoal: number | null;
  goalCompletedAt: number | null;
  lastSeenAt: number;
  completeJourney: JourneyEntry[];
  truncated: boolean;
}

export interface JourneyPagination {
  limit: number;
  skip: number;
  totalCount: number;
  hasMore: boolean;
}

export interface JourneyResponse {
  goal: string;
  visitors: JourneyVisitor[];
  uv: number;
  pagination: JourneyPagination;
}
