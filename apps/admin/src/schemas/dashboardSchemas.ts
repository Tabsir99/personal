import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export const eventTypeSchema = z.enum([
  "session_start",
  "page_view",
  "page_exit",
  "portfolio_view",
]);
export type EventType = z.infer<typeof eventTypeSchema>;
export const EventType = eventTypeSchema.enum;

export const referralSourceSchema = z.enum([
  "organic",
  "facebook",
  "reddit",
  "linkedin",
  "twitter",
  "email",
  "direct",
]);
export type ReferralSource = z.infer<typeof referralSourceSchema>;
export const ReferralSource = referralSourceSchema.enum;

// ============================================================================
// EVENT SCHEMAS
// ============================================================================

const baseEventSchema = z.object({
  sessionId: z.string().min(1),
  timestamp: z.number(),
  path: z.string(),
});

export const sessionStartEventSchema = z.object({
  ...baseEventSchema.shape,
  type: z.literal("session_start"),
  // country/device/ip are populated server-side from request headers; accept loose input.
  country: z.string().default("unknown"),
  device: z.string().optional(),
  ip: z.string().default("unknown"),
  data: z.object({
    isReturning: z.boolean(),
    referralSource: referralSourceSchema,
  }),
});
export type SessionStartEvent = z.infer<typeof sessionStartEventSchema>;

export const pageViewEventSchema = z.object({
  ...baseEventSchema.shape,
  type: z.literal("page_view"),
  data: z.object({
    referrer: z.string().optional(),
    loadTime: z.number().optional(),
  }),
});
export type PageViewEvent = z.infer<typeof pageViewEventSchema>;

export const pageExitEventSchema = z.object({
  ...baseEventSchema.shape,
  type: z.literal("page_exit"),
  data: z.object({
    timeOnPage: z.number(),
  }),
});
export type PageExitEvent = z.infer<typeof pageExitEventSchema>;

export const portfolioViewEventSchema = z.object({
  ...baseEventSchema.shape,
  type: z.literal("portfolio_view"),
});
export type PortfolioViewEvent = z.infer<typeof portfolioViewEventSchema>;

export const analyticsEventSchema = z.discriminatedUnion("type", [
  sessionStartEventSchema,
  pageViewEventSchema,
  pageExitEventSchema,
  portfolioViewEventSchema,
]);
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;

// ============================================================================
// AGGREGATE STATS
// ============================================================================

export const dailyStatsSchema = z.object({
  date: z.string(),
  sessions: z.number().default(0),
  pageViews: z.number().default(0),
  uniqueVisits: z.number().default(0),
  bounces: z.number().default(0),
  portfolioClicks: z.number().default(0),
  totalSessionDuration: z.number().default(0),
});
export type DailyStats = z.infer<typeof dailyStatsSchema>;

export const pagePerformanceSchema = z.object({
  path: z.string(),
  date: z.string(),
  views: z.number().default(0),
  avgTimeOnPage: z.number().default(0),
  bounces: z.number().default(0),
  bounceRate: z.number().default(0),
});
export type PagePerformance = z.infer<typeof pagePerformanceSchema>;

export const trafficSourceSchema = z.object({
  source: referralSourceSchema,
  date: z.string(),
  sessions: z.number().default(0),
  pageViews: z.number().default(0),
  bounces: z.number().default(0),
});
export type TrafficSource = z.infer<typeof trafficSourceSchema>;

export const geoStatsSchema = z.object({
  country: z.string(),
  date: z.string(),
  sessions: z.number().default(0),
  pageViews: z.number().default(0),
  uniqueVisits: z.number().default(0),
  devices: z.object({
    mobile: z.number().default(0),
    desktop: z.number().default(0),
    tablet: z.number().default(0),
  }),
});
export type GeoStats = z.infer<typeof geoStatsSchema>;
