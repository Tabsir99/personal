import "server-only";
import { z } from "zod";
import type { Period, Granularity } from "./analyticsTypes";
import { env } from "@/config/env.server";
import {
  COLUMNS,
  ANALYTICS_TABLE,
  type AnalyticsEventRow,
} from "@tabsircg/schemas/analytics";
import { mkdirSync, writeFileSync } from "node:fs";
import { logQuery, logQueryError, type QueryStats } from "./queryLog";

const TB_HOST = env.TINYBIRD_HOST;
const TB_TOKEN = env.TINYBIRD_TOKEN;

export const F = {
  engine: ANALYTICS_TABLE,
  ...COLUMNS,
} as const;

export interface TinybirdQueryResult<
  T = Record<string, string | number | null>,
> {
  data: T[];
  meta: { name: string; type: string }[];
  rows: number;
  statistics?: QueryStats;
}

/** `label` names the query in the server-side diagnostic log; none of that
 * logging reaches the client. */
export async function queryTinybird<T = Record<string, string | number | null>>(
  sql: string,
  label = "query",
): Promise<TinybirdQueryResult<T>> {
  const sqlFile = dumpSql(label, sql);
  const startedAt = performance.now();
  const res = await fetch(`${TB_HOST}/v0/sql`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TB_TOKEN}` },
    body: `${sql} FORMAT JSON`,
    cache: "no-cache",
  });
  const wallMs = performance.now() - startedAt;

  if (!res.ok) {
    const text = await res.text();
    logQueryError(label, wallMs, res.status, text, sqlFile);
    throw new Error(`Analytics query failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as TinybirdQueryResult<T>;
  logQuery(label, wallMs, json, sqlFile);
  return json;
}

const LOG_DIR = "logs";

/** Dev-only: dumps SQL to `logs/<label>.sql` for pasting into Tinybird.
 * Best-effort, never throws. */
function dumpSql(label: string, sql: string): string | undefined {
  if (process.env.NODE_ENV === "production") return undefined;
  try {
    mkdirSync(LOG_DIR, { recursive: true });
    const file = `${LOG_DIR}/${label.replace(/[^\w.-]/g, "_")}.sql`;
    writeFileSync(file, `${sql}\n`);
    return file;
  } catch {
    return undefined;
  }
}

export async function writePaymentEvent(row: {
  websiteId: string;
  visitorId: string;
  sessionId: string;
  revenueCents: number;
  eventName?: string;
  extra?: Record<string, unknown>;
  timestamp: number;
}): Promise<void> {
  const payload: Partial<AnalyticsEventRow> = {
    website_id: row.websiteId,
    type: "payment",
    visitor_id: row.visitorId,
    session_id: row.sessionId,
    revenue_cents: row.revenueCents,
    event_name: row.eventName ?? "payment",
    extra_data: JSON.stringify(row.extra ?? {}),
    timestamp: row.timestamp,
  };
  const body = JSON.stringify(payload);

  const res = await fetch(`${TB_HOST}/v0/events?name=${ANALYTICS_TABLE}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tinybird payment ingest failed (${res.status}): ${text}`);
  }
}

export type { Period, Granularity } from "./analyticsTypes";

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

export function parseHref(
  href: string,
  keepQuery = false,
): { path: string; params: URLSearchParams } {
  try {
    const url = new URL(href);
    return {
      path: (keepQuery ? url.pathname + url.search : url.pathname) || "/",
      params: url.searchParams,
    };
  } catch {
    const [path = "", query = ""] = href.split("?");
    return {
      path: (keepQuery ? href : path) || "/",
      params: new URLSearchParams(query),
    };
  }
}

export function partitionByLevel<T extends { level: string }>(
  rows: T[],
  levels: readonly T["level"][],
): Record<T["level"], Omit<T, "level">[]> {
  const result = Object.fromEntries(
    levels.map((level) => [level, [] as Omit<T, "level">[]]),
  ) as Record<T["level"], Omit<T, "level">[]>;
  for (const { level, ...rest } of rows) {
    result[level]?.push(rest as Omit<T, "level">);
  }
  return result;
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
