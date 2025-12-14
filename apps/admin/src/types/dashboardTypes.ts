import type { UAParser } from "ua-parser-js";

export type EventType =
  | "session_start"
  | "page_view"
  | "page_exit"
  | "portfolio_view";

export type ReferralSource =
  | "organic"
  | "facebook"
  | "reddit"
  | "linkedin"
  | "twitter"
  | "email"
  | "direct";

export interface BaseEvent {
  sessionId: string;
  type: EventType;
  timestamp: number; // UNIX Milliseconds
  path: string;
}

/**
 * Session start event - fired once per session
 */
export interface SessionStartEvent extends BaseEvent {
  type: "session_start";
  country: string;
  device: ReturnType<typeof UAParser>["device"]["type"];
  ip: string;
  data: {
    isReturning: boolean;
    referralSource: ReferralSource;
  };
}

/**
 * Page view event - fired on every route change
 */
export interface PageViewEvent extends BaseEvent {
  type: "page_view";
  data: {
    referrer?: string; // Previous page in SPA
    loadTime?: number; // Page load time in ms
  };
}

/**
 * Page exit event - fired when leaving a page
 */
export interface PageExitEvent extends BaseEvent {
  type: "page_exit";
  data: {
    timeOnPage: number; // Seconds spent on page
  };
}

/**
 * Portfolio view event - fired when clicked on link to portfolio site
 */
export interface PortfolioViewEvent extends BaseEvent {
  type: "portfolio_view";
}

/**
 * Union type of all possible events
 */
export type AnalyticsEvent =
  | SessionStartEvent
  | PageViewEvent
  | PageExitEvent
  | PortfolioViewEvent;

export interface DailyStats {
  date: string; // YYYY-MM-DD
  sessions: number;
  pageViews: number;
  uniqueVisits: number;
  bounces: number;
  portfolioClicks: number;
  totalSessionDuration: number;
}

export interface PagePerformance {
  path: string;
  date: string; // YYYY-MM-DD
  views: number;
  avgTimeOnPage: number; // seconds
  bounces: number; // sessions that bounced from this page
  bounceRate: number; // percentage
}

export interface TrafficSource {
  source: ReferralSource;
  date: string; // YYYY-MM-DD
  sessions: number;
  pageViews: number;
  bounces: number;
}

export interface GeoStats {
  country: string;
  date: string; // YYYY-MM-DD
  sessions: number;
  pageViews: number;
  uniqueVisits: number;
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}
