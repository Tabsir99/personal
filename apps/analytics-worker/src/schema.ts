import { z } from "zod";

const basePayloadSchema = z.object({
  websiteId: z.string().min(1).max(96), // Max 96 bytes for index id limit
  domain: z.string().nullable(),
  href: z.string().max(2000),
  referrer: z.string().nullable(),
  viewport: z.object({
    width: z.number(),
    height: z.number(),
  }),
  visitorId: z.string().max(100),
  sessionId: z.string().max(100),
  visitorFirstSeenAt: z.string().max(100),
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
        extraData: z.record(z.string(), z.any()).optional(),
      }),
      z.object({
        type: z.literal("identify"),
        extraData: z
          .object({
            user_id: z.string().min(1),
            name: z.string().optional(),
            image: z.string().optional(),
          })
          .catchall(z.any()),
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
        extraData: z.record(z.string(), z.any()).optional(),
      }),
    ),
);

export type EventPayload = z.infer<typeof payloadSchema>;
