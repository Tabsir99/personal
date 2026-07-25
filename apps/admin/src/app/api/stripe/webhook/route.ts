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

interface PaymentIdentity {
  customer_name: string;
  customer_email: string;
  customer_id: string;
  transaction_id: string;
}

interface ExtractedPayment {
  visitorId: string;
  sessionId: string;
  revenueCents: number;
  kind: string;
  identity: PaymentIdentity;
}

function fromMetadata(
  metadata: Stripe.Metadata | null | undefined,
  amountCents: number,
  kind: string,
  identity: PaymentIdentity,
): ExtractedPayment | null {
  const visitorId = metadata?.visitor_id ?? "";
  const sessionId = metadata?.session_id ?? "";
  if (!visitorId) return null;
  return { visitorId, sessionId, revenueCents: amountCents, kind, identity };
}

async function retrievePaymentIntent(
  stripe: Stripe,
  ref: string | Stripe.PaymentIntent | null,
): Promise<Stripe.PaymentIntent | null> {
  const id = typeof ref === "string" ? ref : ref?.id;
  if (!id) return null;
  try {
    return await stripe.paymentIntents.retrieve(id, {
      expand: ["latest_charge"],
    });
  } catch {
    return typeof ref === "object" ? ref : null;
  }
}

function identityFrom(pi: Stripe.PaymentIntent | null): PaymentIdentity {
  const charge =
    pi?.latest_charge && typeof pi.latest_charge === "object"
      ? pi.latest_charge
      : null;

  return {
    customer_name: charge?.billing_details?.name ?? "",
    customer_email: charge?.billing_details?.email ?? pi?.receipt_email ?? "",
    customer_id: typeof pi?.customer === "string" ? pi.customer : "",
    transaction_id: pi?.id ?? "",
  };
}

async function extractPayment(
  stripe: Stripe,
  event: Stripe.Event,
): Promise<ExtractedPayment | null> {
  switch (event.type) {
    case "payment_intent.succeeded": {
      const inline = event.data.object as Stripe.PaymentIntent;
      const pi = (await retrievePaymentIntent(stripe, inline)) ?? inline;
      return fromMetadata(
        pi.metadata,
        pi.amount_received ?? 0,
        "charge",
        identityFrom(pi),
      );
    }
    case "refund.created": {
      const refund = event.data.object as Stripe.Refund;
      const pi = await retrievePaymentIntent(stripe, refund.payment_intent);
      return fromMetadata(
        pi?.metadata ?? refund.metadata,
        -(refund.amount ?? 0),
        "refund",
        identityFrom(pi),
      );
    }
    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute;
      const pi = await retrievePaymentIntent(stripe, dispute.payment_intent);
      return fromMetadata(
        pi?.metadata ?? dispute.metadata,
        -(dispute.amount ?? 0),
        "dispute",
        identityFrom(pi),
      );
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
        extra: {
          stripe_event_id: event.id,
          kind: payment.kind,
          ...payment.identity,
        },
        timestamp: event.created * 1000,
      });
    }
  } catch {
    await releaseStripeEvent(event.id);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
