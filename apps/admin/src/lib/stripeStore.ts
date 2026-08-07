import "server-only";
import { z } from "zod";
import Stripe from "stripe";
import { db, Collections } from "@/config/firebaseAdmin";
import { env } from "@/config/env.server";

export interface StripeSecret {
  webhookSecret: string;
  webhookEndpointId: string;
  restrictedKey: string;
}

const eventsCol = db.collection("analyticsStripeEvents");

const stripeConfigSchema = z.object({
  restrictedKey: z
    .string()
    .trim()
    .startsWith("rk_", "Must be a Stripe restricted key (rk_...)"),
});

const STRIPE_WEBHOOK_EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] =
  [
    "payment_intent.succeeded",
    "refund.created",
    "charge.dispute.funds_withdrawn",
    "charge.dispute.funds_reinstated",
  ];

export async function setupStripe(websiteId: string, rawKey: string) {
  const { restrictedKey } = stripeConfigSchema.parse({ restrictedKey: rawKey });

  const stripe = new Stripe(restrictedKey);
  const endpoint = await stripe.webhookEndpoints.create({
    url: `${env.ADMIN_ORIGIN}/api/stripe/webhook?website=${websiteId}`,
    enabled_events: STRIPE_WEBHOOK_EVENTS,
    metadata: { website: websiteId },
  });

  if (!endpoint.secret) {
    throw new Error("Stripe did not return a webhook signing secret");
  }

  return {
    marker: {
      configured: true as const,
      restrictedKeyLast4: restrictedKey.slice(-4),
    },
    secret: {
      webhookSecret: endpoint.secret,
      webhookEndpointId: endpoint.id,
      restrictedKey,
    },
  };
}

export async function readStripeSecret(
  websiteId: string,
): Promise<StripeSecret | null> {
  const snap = await db.collection(Collections.CONFIG).doc("analytics").get();
  const secrets = snap.data()?.stripeSecrets as
    Record<string, StripeSecret> | undefined;
  return secrets?.[websiteId] ?? null;
}

export async function claimStripeEvent(eventId: string): Promise<boolean> {
  try {
    await eventsCol.doc(eventId).create({ processedAt: Date.now() });
    return true;
  } catch {
    return false;
  }
}

export async function releaseStripeEvent(eventId: string) {
  await eventsCol.doc(eventId).delete();
}
