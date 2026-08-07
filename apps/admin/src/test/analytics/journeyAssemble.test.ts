import { describe, expect, it } from "vitest";
import {
  assembleVisitor,
  groupByVisitor,
  MAX_ROWS_PER_VISITOR,
  type JourneyRow,
} from "@/app/api/analytics/journey/assemble";
import type {
  JourneyPageviewEntry,
  JourneyReferralEntry,
} from "@/lib/analyticsTypes";

const T0 = 1_700_000_000_000;

function row(over: Partial<JourneyRow> = {}): JourneyRow {
  return {
    visitor_id: "v1",
    timestamp: T0,
    type: "pageview",
    event_name: "pageview",
    href: "https://example.com/",
    referrer: "",
    domain: "example.com",
    channel: "Direct",
    extra_data: "",
    revenue_cents: 0,
    country: "GB",
    city: "Chatham",
    browser: "Chrome",
    os: "Mac OS",
    device: "desktop",
    viewport_w: 1920,
    viewport_h: 929,
    goal_at: 0,
    ...over,
  };
}

const PAYMENT_EXTRA = JSON.stringify({
  kind: "charge",
  customer_name: "Andrew Smith",
  customer_email: "andrew.smith@gmail.com",
  customer_id: "cus_123",
  transaction_id: "pi_456",
});

function paymentRow(over: Partial<JourneyRow> = {}): JourneyRow {
  return row({
    type: "payment",
    event_name: "payment",
    revenue_cents: 29_900,
    extra_data: PAYMENT_EXTRA,
    href: "",
    domain: "",
    channel: "Direct",
    country: "",
    city: "",
    browser: "",
    os: "",
    device: "",
    viewport_w: 0,
    viewport_h: 0,
    ...over,
  });
}

const assemble = (rows: JourneyRow[], goalAt = 0) =>
  assembleVisitor(
    rows.map((r) => ({ ...r, goal_at: goalAt })),
    "payment",
  );

describe("journey assembly", () => {
  it("lifts customer identity off the payment row", () => {
    const visitor = assemble([row(), paymentRow({ timestamp: T0 + 1000 })]);

    expect(visitor.customerName).toBe("Andrew Smith");
    expect(visitor.customerEmail).toBe("andrew.smith@gmail.com");
    expect(visitor.profileMetadata).toEqual({
      kind: "charge",
      customer_name: "Andrew Smith",
      customer_email: "andrew.smith@gmail.com",
      customer_id: "cus_123",
      transaction_id: "pi_456",
    });
  });

  it("promotes eventName out of custom event parameters", () => {
    const visitor = assemble([
      row({
        type: "custom",
        event_name: "scroll_to_pricing",
        extra_data: JSON.stringify({
          eventName: "scroll_to_pricing",
          scroll_percentage: "82",
          threshold: "0.8",
        }),
      }),
    ]);

    const custom = visitor.completeJourney[1];
    expect(custom).toMatchObject({
      eventType: "custom",
      data: {
        eventName: "scroll_to_pricing",
        metadata: { scroll_percentage: "82", threshold: "0.8" },
      },
    });
    expect(
      (custom as { data: { metadata: Record<string, unknown> } }).data.metadata,
    ).not.toHaveProperty("eventName");
  });

  it("collapses only consecutive views of the same path", () => {
    const visitor = assemble([
      row({ href: "https://example.com/course", timestamp: T0 }),
      row({ href: "https://example.com/course", timestamp: T0 + 1000 }),
      row({ href: "https://example.com/course", timestamp: T0 + 2000 }),
      row({ href: "https://example.com/pricing", timestamp: T0 + 3000 }),
      row({ href: "https://example.com/course", timestamp: T0 + 4000 }),
    ]);

    const pageviews = visitor.completeJourney.filter(
      (e) => e.eventType === "pageview",
    ) as JourneyPageviewEntry[];

    expect(pageviews.map((p) => [p.data.path, p.data.count])).toEqual([
      ["/course", 3],
      ["/pricing", 1],
      ["/course", 1],
    ]);
    expect(pageviews[0]!.lastTimestamp).toBe(T0 + 2000);
    expect(visitor.pageviews).toBe(5);
  });

  it("synthesises a referral head entry with tracking params", () => {
    const visitor = assemble([
      row({
        href: "https://example.com/?utm_source=newsletter&ref=producthunt",
        referrer: "https://www.google.com/",
        channel: "Search",
      }),
    ]);

    const referral = visitor.completeJourney[0] as JourneyReferralEntry;
    expect(referral.eventType).toBe("referral");
    expect(referral.data.channel).toBe("Search");
    expect(referral.data.fullReferrer).toBe("https://www.google.com/");
    expect(referral.data.trackingParams).toEqual([
      { type: "utm_source", value: "newsletter" },
      { type: "ref", value: "producthunt" },
    ]);
    expect(visitor.channel).toBe("Search");
    expect(visitor.sourceAttribution.params.utm_medium).toBe("");
  });

  it("measures time to goal from first touch, however old", () => {
    const firstTouch = T0 - 30 * 86_400_000;
    const visitor = assemble(
      [
        row({ timestamp: firstTouch }),
        row({ timestamp: T0 - 5000 }),
        paymentRow({ timestamp: T0 }),
      ],
      T0,
    );

    expect(visitor.goalCompletedAt).toBe(T0);
    expect(visitor.timeBeforeGoal).toBe(T0 - firstTouch);
    expect(visitor.completeJourney[0]!.timestamp).toBe(firstTouch);
  });

  it("reports no goal when the query found no completion", () => {
    const visitor = assemble([
      row({ timestamp: T0 - 5000 }),
      paymentRow({ timestamp: T0 - 1000 }),
    ]);

    expect(visitor.goalCompletedAt).toBeNull();
    expect(visitor.timeBeforeGoal).toBeNull();
    expect(visitor.completeJourney.some((e) => e.isGoal)).toBe(false);
  });

  it("marks only the completion the query chose", () => {
    const visitor = assemble(
      [
        row({ timestamp: T0 - 10_000 }),
        paymentRow({ timestamp: T0 }),
        paymentRow({ timestamp: T0 + 60_000 }),
      ],
      T0,
    );

    expect(visitor.goalCompletedAt).toBe(T0);
    expect(visitor.completeJourney.filter((e) => e.isGoal)).toHaveLength(1);
    expect(visitor.revenue).toEqual({ charge: 598, refund: 0, dispute: 0 });
  });

  it("skips the profile-less payment row when it is the visitor's last event", () => {
    const visitor = assemble([
      row({ timestamp: T0 - 5000, country: "ES", city: "Parla", os: "iOS" }),
      paymentRow({ timestamp: T0 }),
    ]);

    expect(visitor.countryCode).toBe("ES");
    expect(visitor.countryName).toBe("Spain");
    expect(visitor.cityName).toBe("Parla");
    expect(visitor.osName).toBe("iOS");
    expect(visitor.browserName).toBe("Chrome");
    expect(visitor.viewport).toEqual({ width: 1920, height: 929 });
    expect(visitor.lastSeenAt).toBe(T0);
  });

  it("reads profile from the latest row and attribution from the first", () => {
    const visitor = assemble([
      row({ timestamp: T0, referrer: "https://t.co/abc", device: "mobile" }),
      row({
        timestamp: T0 + 5000,
        referrer: "",
        device: "desktop",
        browser: "Firefox",
        country: "ES",
        city: "Parla",
        viewport_w: 1440,
        viewport_h: 900,
      }),
    ]);

    expect(visitor.deviceType).toBe("desktop");
    expect(visitor.browserName).toBe("Firefox");
    expect(visitor.countryCode).toBe("ES");
    expect(visitor.countryName).toBe("Spain");
    expect(visitor.viewport).toEqual({ width: 1440, height: 900 });
    expect(visitor.sourceAttribution.referrer).toBe("https://t.co/abc");
    expect(visitor.sourceAttribution.timestamp).toBe(T0);
  });

  it("converts payment amounts from cents to major units", () => {
    const visitor = assemble([paymentRow({ revenue_cents: 16_900 })], T0);

    expect(visitor.completeJourney[1]).toMatchObject({
      eventType: "payment",
      isGoal: true,
      data: { amount: 169 },
    });
    expect(visitor.revenue).toEqual({ charge: 169, refund: 0, dispute: 0 });
  });

  it("drops the sentinel row and flags truncation past the cap", () => {
    const rows = Array.from({ length: MAX_ROWS_PER_VISITOR + 1 }, (_, i) =>
      row({ href: `https://example.com/p${i}`, timestamp: T0 + i * 1000 }),
    );
    const visitor = assemble(rows);

    expect(visitor.truncated).toBe(true);
    expect(visitor.completeJourney).toHaveLength(MAX_ROWS_PER_VISITOR + 1);
    const firstPage = visitor.completeJourney[1] as JourneyPageviewEntry;
    expect(firstPage.data.path).toBe("/p1");
  });

  it("does not flag truncation at exactly the cap", () => {
    const rows = Array.from({ length: MAX_ROWS_PER_VISITOR }, (_, i) =>
      row({ href: `https://example.com/p${i}`, timestamp: T0 + i * 1000 }),
    );
    const visitor = assemble(rows);

    expect(visitor.truncated).toBe(false);
    expect(visitor.completeJourney).toHaveLength(MAX_ROWS_PER_VISITOR + 1);
  });

  it("skips goal detection entirely for the all-visitors listing", () => {
    const rows = [row({ timestamp: T0 - 5000 }), paymentRow({ timestamp: T0 })];
    const visitor = assembleVisitor(rows, null);

    expect(visitor.goalCompletedAt).toBeNull();
    expect(visitor.timeBeforeGoal).toBeNull();
    expect(visitor.completeJourney.some((e) => e.isGoal)).toBe(false);
    expect(visitor.customerName).toBe("Andrew Smith");
    expect(visitor.revenue).toEqual({ charge: 299, refund: 0, dispute: 0 });
    expect(visitor.lastSeenAt).toBe(T0);
  });

  it("leaves identity blank when a visitor never paid", () => {
    const visitor = assemble([row(), row({ timestamp: T0 + 1000 })]);

    expect(visitor.customerName).toBe("");
    expect(visitor.customerEmail).toBe("");
    expect(visitor.profileMetadata).toEqual({});
    expect(visitor.revenue).toEqual({ charge: 0, refund: 0, dispute: 0 });
  });

  it("splits a visitor's payments by kind and keeps every sign as stored", () => {
    const visitor = assemble([
      row({ timestamp: T0 - 9000 }),
      paymentRow({ timestamp: T0 - 8000, revenue_cents: 10_000 }),
      paymentRow({ timestamp: T0 - 7000, revenue_cents: 25_000 }),
      paymentRow({
        timestamp: T0 - 6000,
        revenue_cents: -4_000,
        extra_data: JSON.stringify({ kind: "refund" }),
      }),
      paymentRow({
        timestamp: T0 - 5000,
        revenue_cents: -1_500,
        extra_data: JSON.stringify({ kind: "dispute" }),
      }),
    ]);

    expect(visitor.revenue).toEqual({
      charge: 350,
      refund: -40,
      dispute: -15,
    });
  });

  it("tags each payment entry with the kind that produced it", () => {
    const visitor = assemble([
      paymentRow({ timestamp: T0, revenue_cents: 10_000 }),
      paymentRow({
        timestamp: T0 + 1000,
        revenue_cents: -10_000,
        extra_data: JSON.stringify({ kind: "refund" }),
      }),
    ]);

    const payments = visitor.completeJourney.filter(
      (e) => e.eventType === "payment",
    );
    expect(payments.map((p) => p.data)).toEqual([
      { amount: 100, kind: "charge" },
      { amount: -100, kind: "refund" },
    ]);
  });

  it("banks no money for a kind it does not recognise", () => {
    const visitor = assemble([
      paymentRow({
        timestamp: T0,
        revenue_cents: 50_000,
        extra_data: JSON.stringify({ kind: "chargeback_reversal" }),
      }),
    ]);

    expect(visitor.revenue).toEqual({ charge: 0, refund: 0, dispute: 0 });
    expect(visitor.completeJourney[1]).toMatchObject({
      eventType: "payment",
      data: { amount: 500, kind: "" },
    });
  });

  it("banks no money for a payment row carrying no kind at all", () => {
    const visitor = assemble([
      paymentRow({
        timestamp: T0,
        revenue_cents: 50_000,
        extra_data: JSON.stringify({ customer_name: "Andrew Smith" }),
      }),
      paymentRow({
        timestamp: T0 + 1000,
        revenue_cents: 50_000,
        extra_data: "not json at all",
      }),
    ]);

    expect(visitor.revenue).toEqual({ charge: 0, refund: 0, dispute: 0 });
  });

  it("reads identity from the charge rather than a later refund", () => {
    const visitor = assemble([
      paymentRow({ timestamp: T0, revenue_cents: 29_900 }),
      paymentRow({
        timestamp: T0 + 60_000,
        revenue_cents: -29_900,
        extra_data: JSON.stringify({ kind: "refund", customer_name: "Wrong" }),
      }),
    ]);

    expect(visitor.customerName).toBe("Andrew Smith");
    expect(visitor.revenue).toEqual({ charge: 299, refund: -299, dispute: 0 });
  });

  it("groups flat rows into per-visitor timelines in arrival order", () => {
    const groups = groupByVisitor([
      row({ visitor_id: "a", timestamp: T0 }),
      row({ visitor_id: "a", timestamp: T0 + 1 }),
      row({ visitor_id: "b", timestamp: T0 + 2 }),
    ]);

    expect([...groups.keys()]).toEqual(["a", "b"]);
    expect(groups.get("a")).toHaveLength(2);
    expect(groups.get("b")).toHaveLength(1);
  });
});
