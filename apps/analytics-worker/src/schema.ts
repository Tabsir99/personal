import { z } from "zod";
import {
  BOT_CATEGORY_NAMES,
  extraDataSchema,
  UUID_PATTERN,
  VISITOR_ID_MAX_LENGTH,
} from "@tabsircg/schemas/analytics";

const basePayloadSchema = z.object({
  websiteId: z.string().min(1).max(96),
  domain: z.string().min(1).max(253),
  href: z.string().max(2000),
  referrer: z.string().optional(),
  viewport: z.object({
    width: z.number(),
    height: z.number(),
  }),

  visitorId: z.string().max(VISITOR_ID_MAX_LENGTH).regex(UUID_PATTERN),
  sessionId: z.string().max(VISITOR_ID_MAX_LENGTH).regex(UUID_PATTERN),
  visitorSessionNumber: z.number(),
  language: z.string().max(50),
  timezone: z.string().max(100),
  screenWidth: z.number(),
  screenHeight: z.number(),
});

export const browserPayloadSchema = z.intersection(
  basePayloadSchema,
  z
    .discriminatedUnion("type", [
      z.object({
        type: z.literal("pageview"),
        extraData: extraDataSchema.optional(),
      }),
      z.object({
        type: z.literal("identify"),
        extraData: extraDataSchema.refine(
          (data) => typeof data.user_id === "string" && data.user_id.length > 0,
          { message: "identify requires a non-empty user_id" },
        ),
      }),
    ])
    .or(
      z.object({
        type: z
          .string()
          .min(1)
          .max(64)
          .refine((t) => !["pageview", "payment", "identify"].includes(t), {
            message: "Reserved event type used as custom",
          }),
        extraData: extraDataSchema.optional(),
      }),
    ),
);

export const crawlPayloadSchema = z.object({
  websiteId: z.string().min(1).max(96),
  domain: z.string().min(1).max(253),
  href: z.string().max(2000),
  referrer: z.string().optional(),
  type: z.literal("pageview"),
  bot: z.object({
    name: z.string().min(1).max(64),
    category: z.enum(BOT_CATEGORY_NAMES),
    userAgent: z.string().max(500),
    ip: z.string().max(64),
  }),
});

export const payloadSchema = z.union([
  crawlPayloadSchema,
  browserPayloadSchema,
]);

export type BrowserPayload = z.infer<typeof browserPayloadSchema>;
export type CrawlPayload = z.infer<typeof crawlPayloadSchema>;
export type EventPayload = z.infer<typeof payloadSchema>;

export function isCrawlPayload(payload: EventPayload): payload is CrawlPayload {
  return "bot" in payload;
}
