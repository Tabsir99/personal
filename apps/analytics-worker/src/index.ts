import {
  payloadSchema,
  isCrawlPayload,
  type BrowserPayload,
  type CrawlPayload,
} from "./schema";
import { validateAccess } from "./requestGuard";
import {
  getEventMetadata,
  toUint16,
  toEventName,
  encodeExtraData,
} from "./utils";
import { sendToTinybirdWithRetry } from "./tinybird";
import { parseUA } from "./parseUA";
import type { AnalyticsEventRow } from "@tabsircg/schemas/analytics";

interface Env {
  ANALYTICS_DOMAINS_KV: KVNamespace;
  TINYBIRD_TOKEN: string;
  TINYBIRD_HOST: string;
  INGEST_TOKEN?: string;
}

const INGEST_TOKEN_HEADER = "x-ingest-token";

const NIL_UUID = "00000000-0000-0000-0000-000000000000";
const UNKNOWN_GEO = "Unknown";

function crawlRow(payload: CrawlPayload, timestamp: number): AnalyticsEventRow {
  return {
    website_id: payload.websiteId,
    type: payload.type,
    domain: payload.domain || "unknown",
    href: payload.href,
    referrer: payload.referrer || "",
    visitor_id: NIL_UUID,
    session_id: NIL_UUID,
    language: "",
    timezone: "",
    event_name: payload.type,
    extra_data: "{}",
    country: UNKNOWN_GEO,
    region: UNKNOWN_GEO,
    city: UNKNOWN_GEO,
    browser: "",
    os: "",
    device: "",
    is_bot: 1,
    bot_category: payload.bot.category,
    bot_name: payload.bot.name,
    ip: payload.bot.ip,
    viewport_w: 0,
    viewport_h: 0,
    screen_w: 0,
    screen_h: 0,
    session_number: 0,
    revenue_cents: 0,
    timestamp,
  };
}

function browserRow(
  payload: BrowserPayload,
  request: Request,
  ipAddress: string,
  rawUserAgent: string,
): AnalyticsEventRow {
  const { country, region, city, timestamp, userAgent } = getEventMetadata(
    request,
    ipAddress,
    rawUserAgent,
  );
  const { browser, os, device } = parseUA(userAgent);

  return {
    website_id: payload.websiteId,
    type: payload.type,
    domain: payload.domain || "unknown",
    href: payload.href,
    referrer: payload.referrer || "",
    visitor_id: payload.visitorId,
    session_id: payload.sessionId,
    language: payload.language,
    timezone: payload.timezone,
    event_name: toEventName(payload.extraData, payload.type),
    extra_data: encodeExtraData(payload.extraData),
    country,
    region,
    city,
    browser,
    os,
    device,
    is_bot: 0,
    bot_category: "",
    bot_name: "",
    ip: ipAddress,
    viewport_w: toUint16(payload.viewport.width),
    viewport_h: toUint16(payload.viewport.height),
    screen_w: toUint16(payload.screenWidth),
    screen_h: toUint16(payload.screenHeight),
    session_number: toUint16(payload.visitorSessionNumber),
    revenue_cents: 0,
    timestamp,
  };
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const rawBody = await request.text();

      const validationResult = payloadSchema.safeParse(JSON.parse(rawBody));

      if (!validationResult.success) {
        return new Response(
          JSON.stringify({
            error: "Validation failed",
            details: validationResult.error.issues,
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin":
                request.headers.get("Origin") || "*",
            },
          },
        );
      }

      const payload = validationResult.data;

      const accessGuard = await validateAccess(
        request,
        payload.websiteId,
        env.ANALYTICS_DOMAINS_KV,
      );

      if (!accessGuard.isAuthorized) {
        return new Response(
          JSON.stringify({ error: "Unauthorized or Origin not permitted" }),
          {
            status: 403,
            headers: accessGuard.corsHeaders,
          },
        );
      }

      const isCrawl = isCrawlPayload(payload);

      if (
        isCrawl &&
        (!env.INGEST_TOKEN ||
          request.headers.get(INGEST_TOKEN_HEADER) !== env.INGEST_TOKEN)
      ) {
        return new Response(
          JSON.stringify({ error: "Crawl events require a valid ingest token" }),
          { status: 403, headers: accessGuard.corsHeaders },
        );
      }

      const tbRow = isCrawl
        ? crawlRow(payload, Date.now())
        : browserRow(
            payload,
            request,
            accessGuard.ipAddress,
            accessGuard.rawUserAgent,
          );

      const tbPayload = JSON.stringify(tbRow);

      const tbHost =
        env.TINYBIRD_HOST || "https://api.ap-east-1.aws.tinybird.co";
      ctx.waitUntil(
        sendToTinybirdWithRetry(tbHost, env.TINYBIRD_TOKEN, tbPayload).catch(
          (err: unknown) => {
            console.error("Tinybird ingest dropped after retries", {
              websiteId: payload.websiteId,
              type: payload.type,
              error: err instanceof Error ? err.message : String(err),
            });
          },
        ),
      );

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: accessGuard.corsHeaders,
      });
    } catch (err: unknown) {
      console.error("Ingest request failed", err);
      return new Response(JSON.stringify({ error: "Internal error" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
        },
      });
    }
  },
};
