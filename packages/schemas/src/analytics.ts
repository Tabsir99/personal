import { z } from "zod";

export const ANALYTICS_TABLE = "analytics_events";

export const CUSTOM_EVENT_TYPE = "custom";

export const BOT_CATEGORY_NAMES = [
  "search_index",
  "answer_fetch",
  "training",
  "ai_crawler",
  "seo",
  "social",
  "monitoring",
  "tooling",
  "archive",
  "generic",
] as const;

export type BotCategory = (typeof BOT_CATEGORY_NAMES)[number];

export const VISITOR_ID_MAX_LENGTH = 100;

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export const EXTRA_DATA_MAX_PROPERTIES = 10;
export const EXTRA_DATA_MAX_KEY_LENGTH = 32;
export const EXTRA_DATA_MAX_VALUE_LENGTH = 1000;
export const EXTRA_DATA_MAX_BYTES = 4000;
export const EXTRA_DATA_KEY_PATTERN = /^[a-z0-9_-]+$/;
export const EVENT_NAME_KEY = "eventName";

export const extraDataSchema = z
  .record(z.string(), z.string().max(EXTRA_DATA_MAX_VALUE_LENGTH))
  .refine(
    (data) =>
      Object.keys(data).filter((key) => key !== EVENT_NAME_KEY).length <=
      EXTRA_DATA_MAX_PROPERTIES,
    { message: `At most ${EXTRA_DATA_MAX_PROPERTIES} properties are allowed` },
  )
  .refine(
    (data) =>
      Object.keys(data).every(
        (key) =>
          key === EVENT_NAME_KEY ||
          (key.length > 0 &&
            key.length <= EXTRA_DATA_MAX_KEY_LENGTH &&
            EXTRA_DATA_KEY_PATTERN.test(key)),
      ),
    {
      message: `Property names must match ${EXTRA_DATA_KEY_PATTERN.source} and be at most ${EXTRA_DATA_MAX_KEY_LENGTH} characters`,
    },
  )
  .refine((data) => JSON.stringify(data).length <= EXTRA_DATA_MAX_BYTES, {
    message: `Serialised properties must not exceed ${EXTRA_DATA_MAX_BYTES} characters`,
  });

export const COLUMNS = {
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
  browser: "browser",
  os: "os",
  device: "device",
  isBot: "is_bot",
  botCategory: "bot_category",
  botName: "bot_name",
  ip: "ip",
  viewportW: "viewport_w",
  viewportH: "viewport_h",
  screenW: "screen_w",
  screenH: "screen_h",
  sessionNumber: "session_number",
  revenueCents: "revenue_cents",
  timestamp: "timestamp",
} as const;

export interface AnalyticsEventRow {
  website_id: string;
  type: string;
  domain: string;
  href: string;
  referrer: string;
  visitor_id: string;
  session_id: string;
  language: string;
  timezone: string;
  event_name: string;
  extra_data: string;
  country: string;
  region: string;
  city: string;
  browser: string;
  os: string;
  device: string;
  is_bot: 0 | 1;
  bot_category: string;
  bot_name: string;
  ip: string;
  viewport_w: number;
  viewport_h: number;
  screen_w: number;
  screen_h: number;
  session_number: number;
  revenue_cents: number;
  timestamp: number;
}

type Columns<K extends keyof AnalyticsEventRow> = Pick<AnalyticsEventRow, K>;

type Identity = "website_id" | "timestamp";

export type BrowserEventInput = Columns<
  | Identity
  | "type"
  | "domain"
  | "href"
  | "visitor_id"
  | "session_id"
  | "language"
  | "timezone"
  | "event_name"
  | "extra_data"
  | "browser"
  | "os"
  | "device"
  | "ip"
  | "viewport_w"
  | "viewport_h"
  | "screen_w"
  | "screen_h"
  | "session_number"
> &
  Partial<Columns<"referrer" | "country" | "region" | "city">>;

export type CrawlEventInput = Columns<
  Identity | "type" | "domain" | "href" | "bot_category" | "bot_name" | "ip"
> & { is_bot: 1 } & Partial<Columns<"referrer">>;

export type PaymentEventInput = Columns<
  Identity | "visitor_id" | "session_id" | "revenue_cents" | "extra_data"
> & { type: "payment" } & Partial<Columns<"event_name">>;

export type AnalyticsEventInput =
  BrowserEventInput | CrawlEventInput | PaymentEventInput;
