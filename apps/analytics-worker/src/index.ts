import { payloadSchema, devPayloadSchema, EventPayload } from "./schema";
import { validateAccess } from "./requestGuard";
import { getEventMetadata } from "./utils";
import { sendToTinybirdWithRetry } from "./tinybird";
import { parseUA } from "./parseUA";
import { detectBot } from "./detectBot";
import type { AnalyticsEventRow } from "@tabsircg/analytics-contract";

interface Env {
  ANALYTICS_DOMAINS_KV: KVNamespace;
  TINYBIRD_TOKEN: string;
  TINYBIRD_HOST: string;
  ENVIRONMENT?: string;
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

      const isDev = env.ENVIRONMENT === "dev";
      const schema = isDev ? devPayloadSchema : payloadSchema;
      const validationResult = schema.safeParse(JSON.parse(rawBody));

      if (!validationResult.success) {
        // Validation failed (we use static wildcard here just so error can be read, or echo origin)
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

      const payload = validationResult.data as EventPayload;

      // KV Edge Validation with In-Memory Caching & Origin Checking
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

      // Extract geo information, IP address, user agent, and timestamp (handling overrides in dev environment)
      const { country, region, city, ipAddress, timestamp, userAgent } =
        getEventMetadata(
          request,
          accessGuard.ipAddress,
          accessGuard.rawUserAgent,
          payload,
          env.ENVIRONMENT,
        );

      const extraDataJson = payload.extraData
        ? JSON.stringify(payload.extraData).slice(0, 4000)
        : "{}";

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
        event_name: (payload.extraData as any)?.eventName || payload.type,
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
        viewport_w: payload.viewport.width,
        viewport_h: payload.viewport.height,
        screen_w: payload.screenWidth,
        screen_h: payload.screenHeight,
        session_number: payload.visitorSessionNumber,
        revenue_cents: 0,
        timestamp,
      } satisfies AnalyticsEventRow;

      const tbPayload = JSON.stringify(tbRow);

      const tbHost =
        env.TINYBIRD_HOST || "https://api.ap-east-1.aws.tinybird.co";
      ctx.waitUntil(
        sendToTinybirdWithRetry(tbHost, env.TINYBIRD_TOKEN, tbPayload),
      );

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: accessGuard.corsHeaders,
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
        },
      });
    }
  },
};
