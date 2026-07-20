import "server-only";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  readStripeSecret,
  claimStripeEvent,
  releaseStripeEvent,
} from "@/lib/stripeStore";
import { writePaymentEvent } from "@/lib/tinybird";

export const runtime = "nodejs";

interface ExtractedPayment {
  visitorId: string;
  sessionId: string;
  revenueCents: number;
  kind: string;
}

function fromMetadata(
  metadata: Stripe.Metadata | null | undefined,
  amountCents: number,
  kind: string,
): ExtractedPayment | null {
  const visitorId = metadata?.visitor_id ?? "";
  const sessionId = metadata?.session_id ?? "";
  if (!visitorId) return null;
  return { visitorId, sessionId, revenueCents: amountCents, kind };
}

async function paymentIntentMetadata(
  stripe: Stripe,
  ref: string | Stripe.PaymentIntent | null,
  fallback: Stripe.Metadata | null | undefined,
): Promise<Stripe.Metadata | null | undefined> {
  if (ref && typeof ref === "object") return ref.metadata;
  if (typeof ref === "string") {
    try {
      const pi = await stripe.paymentIntents.retrieve(ref);
      return pi.metadata;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

async function extractPayment(
  stripe: Stripe,
  event: Stripe.Event,
): Promise<ExtractedPayment | null> {
  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      return fromMetadata(pi.metadata, pi.amount_received ?? 0, "charge");
    }
    case "refund.created": {
      const refund = event.data.object as Stripe.Refund;
      const metadata = await paymentIntentMetadata(
        stripe,
        refund.payment_intent,
        refund.metadata,
      );
      return fromMetadata(metadata, -(refund.amount ?? 0), "refund");
    }
    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute;
      const metadata = await paymentIntentMetadata(
        stripe,
        dispute.payment_intent,
        dispute.metadata,
      );
      return fromMetadata(metadata, -(dispute.amount ?? 0), "dispute");
    }
    default:
      return null;
  }
}

export async function POST(req: NextRequest) {
  const websiteId = req.nextUrl.searchParams.get("website");
  if (!websiteId) {
    return NextResponse.json({ error: "Missing website" }, { status: 400 });
  }

  const secret = await readStripeSecret(websiteId);
  if (!secret) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 404 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  const stripe = new Stripe(secret.restrictedKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      secret.webhookSecret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (!(await claimStripeEvent(event.id))) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    const payment = await extractPayment(stripe, event);
    if (payment) {
      await writePaymentEvent({
        websiteId,
        visitorId: payment.visitorId,
        sessionId: payment.sessionId,
        revenueCents: payment.revenueCents,
        extra: { stripe_event_id: event.id, kind: payment.kind },
        timestamp: event.created * 1000,
      });
    }
  } catch {
    await releaseStripeEvent(event.id);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
