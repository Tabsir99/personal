import { payloadSchema } from "./schema";
import { validateAccess } from "./requestGuard";
import {
  getEventMetadata,
  toUint16,
  toEventName,
  encodeExtraData,
} from "./utils";
import { sendToTinybirdWithRetry } from "./tinybird";
import { parseUA } from "./parseUA";
import { detectBot } from "./detectBot";
import type { AnalyticsEventRow } from "@tabsircg/schemas/analytics";

interface Env {
  ANALYTICS_DOMAINS_KV: KVNamespace;
  TINYBIRD_TOKEN: string;
  TINYBIRD_HOST: string;
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
        // Static wildcard so the error body is readable cross-origin.
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

      const { country, region, city, ipAddress, timestamp, userAgent } =
        getEventMetadata(
          request,
          accessGuard.ipAddress,
          accessGuard.rawUserAgent,
        );

      const extraDataJson = encodeExtraData(payload.extraData);

      const { browser, os, device } = parseUA(userAgent);
      const { is_bot, bot_category, bot_name } = detectBot(userAgent);

      const tbRow = {
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
        extra_data: extraDataJson,
        country,
        region,
        city,
        browser,
        os,
        device,
        is_bot,
        bot_category,
        bot_name,
        ip: ipAddress,
        viewport_w: toUint16(payload.viewport.width),
        viewport_h: toUint16(payload.viewport.height),
        screen_w: toUint16(payload.screenWidth),
        screen_h: toUint16(payload.screenHeight),
        session_number: toUint16(payload.visitorSessionNumber),
        revenue_cents: 0,
        timestamp,
      } satisfies AnalyticsEventRow;

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
