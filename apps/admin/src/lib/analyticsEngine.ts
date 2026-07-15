import "server-only";
import { z } from "zod";
import { env } from "@/config/env.server";

const CF_AE_ENDPOINT = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/analytics_engine/sql`;
const CF_API_TOKEN = env.CF_API_TOKEN;

export const F = {
  websiteId: "blob1",
  type: "blob2",
  domain: "blob3",
  href: "blob4",
  referrer: "blob5",
  visitorId: "blob6",
  sessionId: "blob7",
  language: "blob8",
  timezone: "blob9",
  eventName: "blob10",
  extraData: "blob11",
  country: "blob12",
  region: "blob13",
  city: "blob14",
  userAgent: "blob15",
  ip: "blob16",

  viewportW: "double1",
  viewportH: "double2",
  screenW: "double3",
  screenH: "double4",
  sessionNumber: "double5",
  timestamp: "double6",
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
  const res = await fetch(CF_AE_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    body: sql,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AE query failed (${res.status}): ${text}`);
  }

  return res.json();
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
  z.string().regex(/^custom:\d{4}-\d{2}-\d{2}:\d{4}-\d{2}-\d{2}$/, "Invalid custom period format"),
]);

const analyticsParamsSchema = z.object({
  websiteId: z.string().min(1, "websiteId is required").regex(/^[\w-]+$/, "Invalid websiteId"),
  period: periodSchema.default("last30d"),
  granularity: z.enum(["hourly", "daily", "weekly", "monthly"]).default("daily"),
});

export interface AnalyticsParams {
  websiteId: string;
  period: Period;
  granularity: Granularity;
}

export function escapeSQL(value: string): string {
  return value.replace(/['\\]/g, "");
}

export function parseAnalyticsParams(searchParams: URLSearchParams): AnalyticsParams {
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
