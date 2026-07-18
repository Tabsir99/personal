import "server-only";
import { z } from "zod";
import { env } from "@/config/env.server";

const TB_HOST = env.TINYBIRD_HOST;
const TB_TOKEN = env.TINYBIRD_TOKEN;

export const F = {
  engine: "analytics_events",

  websiteId: "website_id",
  type: "type",
  domain: "domain",
  href: "href",
  referrer: "referrer",
  visitorId: "visitor_id",
  sessionId: "session_id",
  language: "language",
  timezone: "timezone",
  eventName: "event_name",
  extraData: "extra_data",
  country: "country",
  region: "region",
  city: "city",
  userAgent: "user_agent",
  ip: "ip",

  viewportW: "viewport_w",
  viewportH: "viewport_h",
  screenW: "screen_w",
  screenH: "screen_h",
  sessionNumber: "session_number",
  timestamp: "timestamp",
} as const;

export interface AEQueryResult<T = Record<string, string | number | null>> {
  data: T[];
  meta: { name: string; type: string }[];
  rows: number;
  rows_before_limit_at_least: number;
}

export async function queryAE<T = Record<string, string | number | null>>(
  sql: string,
): Promise<AEQueryResult<T>> {
  const res = await fetch(`${TB_HOST}/v0/sql`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TB_TOKEN}` },
    body: `${sql} FORMAT JSON`,
    cache: "no-cache",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Tinybird query failed:", text);
    throw new Error(`Analytics query failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  return json;
}

export type Period =
  | "today"
  | "yesterday"
  | "last7d"
  | "last30d"
  | "last90d"
  | `custom:${string}:${string}`;

export type Granularity = "hourly" | "daily" | "weekly" | "monthly";

export function periodToRange(period: Period): { start: number; end: number } {
  const now = Date.now();
  const dayMs = 86_400_000;

  switch (period) {
    case "today": {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      return { start: todayStart.getTime(), end: now };
    }
    case "yesterday": {
      const yStart = new Date();
      yStart.setHours(0, 0, 0, 0);
      yStart.setDate(yStart.getDate() - 1);
      return { start: yStart.getTime(), end: yStart.getTime() + dayMs };
    }
    case "last7d":
      return { start: now - 7 * dayMs, end: now };
    case "last30d":
      return { start: now - 30 * dayMs, end: now };
    case "last90d":
      return { start: now - 90 * dayMs, end: now };
    default: {
      const [, startStr, endStr] = period.split(":");
      return {
        start: new Date(startStr).getTime(),
        end: new Date(endStr).getTime() + dayMs,
      };
    }
  }
}

export function previousPeriodRange(start: number, end: number) {
  const duration = end - start;
  return { start: start - duration, end: start };
}

export function granularityToMs(granularity: Granularity): number {
  switch (granularity) {
    case "hourly":
      return 3_600_000;
    case "daily":
      return 86_400_000;
    case "weekly":
      return 604_800_000;
    case "monthly":
      return 2_592_000_000;
  }
}

const periodSchema = z.union([
  z.enum(["today", "yesterday", "last7d", "last30d", "last90d"]),
  z
    .string()
    .regex(
      /^custom:\d{4}-\d{2}-\d{2}:\d{4}-\d{2}-\d{2}$/,
      "Invalid custom period format",
    ),
]);

const analyticsParamsSchema = z.object({
  websiteId: z
    .string()
    .min(1, "websiteId is required")
    .regex(/^[\w-]+$/, "Invalid websiteId"),
  period: periodSchema.default("last30d"),
  granularity: z
    .enum(["hourly", "daily", "weekly", "monthly"])
    .default("daily"),
});

export interface AnalyticsParams {
  websiteId: string;
  period: Period;
  granularity: Granularity;
}

export function escapeSQL(value: string): string {
  return value.replace(/['\\]/g, "");
}

export function parseAnalyticsParams(
  searchParams: URLSearchParams,
): AnalyticsParams {
  const raw = {
    websiteId: searchParams.get("websiteId") ?? "",
    period: searchParams.get("period") ?? undefined,
    granularity: searchParams.get("granularity") ?? undefined,
  };

  const parsed = analyticsParamsSchema.parse(raw);

  return {
    ...parsed,
    websiteId: escapeSQL(parsed.websiteId),
    period: parsed.period as Period,
  };
}
