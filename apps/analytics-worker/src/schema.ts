import { z } from "zod";
import {
  extraDataSchema,
  UUID_PATTERN,
  VISITOR_ID_MAX_LENGTH,
} from "@tabsircg/schemas/analytics";

const basePayloadSchema = z.object({
  websiteId: z.string().min(1).max(96), // Max 96 bytes for index id limit
  domain: z.string().nullable(),
  href: z.string().max(2000),
  referrer: z.string().nullable(),
  viewport: z.object({
    width: z.number(),
    height: z.number(),
  }),
  // visitor_id is a UUID column. ClickHouse quarantines a row it cannot parse
  // and says nothing, so a malformed id has to fail loudly here instead — the
  // SDK only ever sends generateUUID() output, so anything else is a tampered
  // cookie, a hand-written _cgd_vid param, or a direct POST.
  visitorId: z.string().max(VISITOR_ID_MAX_LENGTH).regex(UUID_PATTERN),
  // session_id stays a String column: getSessionId builds 's' + uuid.slice(1).
  sessionId: z.string().max(VISITOR_ID_MAX_LENGTH),
  visitorSessionNumber: z.number(),
  language: z.string().max(50),
  timezone: z.string().max(100),
  screenWidth: z.number(),
  screenHeight: z.number(),
});

export const payloadSchema = z.intersection(
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

export type EventPayload = z.infer<typeof payloadSchema>;
