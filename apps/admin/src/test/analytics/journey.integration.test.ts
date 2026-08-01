import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/requireAuth", () => ({
  requireAuth: vi.fn().mockResolvedValue(undefined),
}));

import type { AnalyticsEventRow } from "@tabsircg/schemas/analytics";
import {
  TINYBIRD_ENABLED,
  ingestRows,
  waitForRows,
  cleanupRows,
  callRoute,
} from "@/test/support/tinybird";
import type {
  JourneyResponse,
  JourneyPageviewEntry,
  JourneyReferralEntry,
} from "@/lib/analyticsTypes";

import { GET as journeyGET } from "@/app/api/analytics/journey/route";

const describeMaybe = TINYBIRD_ENABLED ? describe : describe.skip;

const DAY = 86_400_000;
const now = Date.now();
const WID = `jtest-${now.toString(36)}`;
const DOMAIN = "tabsircg.com";

const periodStart = now - 7 * DAY;
const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const period = `custom:${fmt(periodStart)}:${fmt(now)}`;

const PAYER = "v-payer";
const SIGNER = "v-signer";
const BROWSER = "v-browser";

const FIRST_TOUCH = now - 20 * DAY;
const PAID_AT = now - 2 * DAY;

function base(over: Partial<AnalyticsEventRow>): AnalyticsEventRow {
  return {
    website_id: WID,
    type: "pageview",
    domain: DOMAIN,
    href: `https://${DOMAIN}/`,
    referrer: "",
    visitor_id: "",
    session_id: "s1",
    language: "en-US",
    timezone: "UTC",
    event_name: "pageview",
    extra_data: "{}",
    country: "ES",
    region: "MD",
    city: "Parla",
    browser: "Mobile Safari",
    os: "iOS",
    device: "mobile",
    is_bot: 0,
    bot_category: "",
    bot_name: "",
    ip: "1.2.3.4",
    viewport_w: 393,
    viewport_h: 695,
    screen_w: 393,
    screen_h: 852,
    session_number: 1,
    revenue_cents: 0,
    timestamp: now,
    ...over,
  };
}

function paymentRow(over: Partial<AnalyticsEventRow>): AnalyticsEventRow {
  return base({
    type: "payment",
    event_name: "payment",
    domain: "",
    href: "",
    referrer: "",
    language: "",
    timezone: "",
    country: "",
    region: "",
    city: "",
    browser: "",
    os: "",
    device: "",
    ip: "",
    viewport_w: 0,
    viewport_h: 0,
    screen_w: 0,
    screen_h: 0,
    session_number: 0,
    ...over,
  });
}

const rows: AnalyticsEventRow[] = [
  base({
    visitor_id: PAYER,
    timestamp: FIRST_TOUCH,
    referrer: "https://www.google.com/",
    href: `https://${DOMAIN}/?utm_source=newsletter&ref=producthunt`,
  }),
  base({
    visitor_id: PAYER,
    timestamp: FIRST_TOUCH + 1000,
    href: `https://${DOMAIN}/pricing`,
  }),
  base({
    visitor_id: PAYER,
    timestamp: FIRST_TOUCH + 2000,
    href: `https://${DOMAIN}/pricing`,
  }),
  base({
    visitor_id: PAYER,
    timestamp: PAID_AT - 5000,
    type: "custom",
    event_name: "coffee_click",
    extra_data: JSON.stringify({ eventName: "coffee_click", location: "nav" }),
  }),
  paymentRow({
    visitor_id: PAYER,
    timestamp: PAID_AT,
    revenue_cents: 16_900,
    extra_data: JSON.stringify({
      stripe_event_id: "evt_1",
      kind: "charge",
      customer_name: "Andrew Smith",
      customer_email: "andrew.smith@example.com",
      customer_id: "cus_1",
      transaction_id: "pi_1",
    }),
  }),

  base({ visitor_id: SIGNER, timestamp: now - 4 * DAY }),
  base({
    visitor_id: SIGNER,
    timestamp: now - 4 * DAY + 1000,
    type: "custom",
    event_name: "newsletter_signup",
    extra_data: JSON.stringify({
      eventName: "newsletter_signup",
      source: "blog",
    }),
  }),

  base({ visitor_id: BROWSER, timestamp: now - 3 * DAY }),
  base({
    visitor_id: BROWSER,
    timestamp: now - 3 * DAY + 1000,
    href: `https://${DOMAIN}/about`,
  }),
];

const q = (over: Record<string, string> = {}) => ({
  websiteId: WID,
  period,
  granularity: "daily",
  ...over,
});

describeMaybe("journey route — real Tinybird", () => {
  beforeAll(async () => {
    await ingestRows(rows);
    await waitForRows([WID], rows.length);
  }, 120_000);

  afterAll(() => cleanupRows([WID]), 90_000);

  it("returns only visitors who completed the payment goal", async () => {
    const data = await callRoute<JourneyResponse>(journeyGET, q());

    expect(data.goal).toBe("payment");
    expect(data.visitors.map((v) => v.visitorId)).toEqual([PAYER]);
    expect(data.uv).toBe(1);
    expect(data.pagination.totalCount).toBe(1);
    expect(data.pagination.hasMore).toBe(false);
  });

  it("returns the visitor's whole lifetime, not just the period", async () => {
    const data = await callRoute<JourneyResponse>(journeyGET, q());
    const payer = data.visitors[0]!;

    const timestamps = payer.completeJourney.map((e) => e.timestamp);
    expect(Math.min(...timestamps)).toBe(FIRST_TOUCH);
    expect(FIRST_TOUCH).toBeLessThan(periodStart);

    expect(payer.goalCompletedAt).toBe(PAID_AT);
    expect(payer.timeBeforeGoal).toBe(PAID_AT - FIRST_TOUCH);
    expect(payer.amount).toBe(169);
    expect(payer.customerName).toBe("Andrew Smith");
    expect(payer.customerEmail).toBe("andrew.smith@example.com");
  });

  it("keeps the profile even when the newest row is the payment", async () => {
    const data = await callRoute<JourneyResponse>(journeyGET, q());
    const payer = data.visitors[0]!;

    expect(payer.countryCode).toBe("ES");
    expect(payer.cityName).toBe("Parla");
    expect(payer.browserName).toBe("Mobile Safari");
    expect(payer.osName).toBe("iOS");
    expect(payer.deviceType).toBe("mobile");
    expect(payer.viewport).toEqual({ width: 393, height: 695 });
    expect(payer.lastSeenAt).toBe(PAID_AT);
  });

  it("builds the referral head and collapses repeat pageviews", async () => {
    const data = await callRoute<JourneyResponse>(journeyGET, q());
    const journey = data.visitors[0]!.completeJourney;

    const referral = journey[0] as JourneyReferralEntry;
    expect(referral.eventType).toBe("referral");
    expect(referral.data.channel).toBe("Search");
    expect(referral.data.trackingParams).toEqual([
      { type: "utm_source", value: "newsletter" },
      { type: "ref", value: "producthunt" },
    ]);

    const pricing = journey.find(
      (e) => e.eventType === "pageview" && e.data.path === "/pricing",
    ) as JourneyPageviewEntry;
    expect(pricing.data.count).toBe(2);
    expect(pricing.lastTimestamp).toBe(FIRST_TOUCH + 2000);

    expect(journey.filter((e) => e.isGoal)).toHaveLength(1);
    expect(journey.find((e) => e.isGoal)!.eventType).toBe("payment");
  });

  it("scopes to a custom-event goal", async () => {
    const data = await callRoute<JourneyResponse>(
      journeyGET,
      q({ goal: "newsletter_signup" }),
    );

    expect(data.visitors.map((v) => v.visitorId)).toEqual([SIGNER]);
    const signer = data.visitors[0]!;
    expect(signer.goalCompletedAt).toBe(now - 4 * DAY + 1000);
    expect(signer.amount).toBe(0);
    expect(signer.customerName).toBe("");
  });

  it("lists every visitor for goal=all, including non-converters", async () => {
    const data = await callRoute<JourneyResponse>(
      journeyGET,
      q({ goal: "all" }),
    );

    expect(data.visitors.map((v) => v.visitorId).sort()).toEqual(
      [BROWSER, PAYER, SIGNER].sort(),
    );
    const seen = data.visitors.map((v) => v.lastSeenAt);
    expect([...seen]).toEqual([...seen].sort((a, b) => b - a));

    for (const v of data.visitors) {
      expect(v.goalCompletedAt).toBeNull();
      expect(v.timeBeforeGoal).toBeNull();
    }
  });

  it("pages through completers with limit and skip", async () => {
    const all = await callRoute<JourneyResponse>(
      journeyGET,
      q({ goal: "all" }),
    );
    const firstPage = await callRoute<JourneyResponse>(
      journeyGET,
      q({ goal: "all", limit: "2", skip: "0" }),
    );
    const secondPage = await callRoute<JourneyResponse>(
      journeyGET,
      q({ goal: "all", limit: "2", skip: "2" }),
    );

    expect(firstPage.visitors).toHaveLength(2);
    expect(firstPage.pagination.hasMore).toBe(true);
    expect(secondPage.visitors).toHaveLength(1);
    expect(secondPage.pagination.hasMore).toBe(false);
    expect(
      [...firstPage.visitors, ...secondPage.visitors].map((v) => v.visitorId),
    ).toEqual(all.visitors.map((v) => v.visitorId));
  });

  it("returns nothing for a goal no one completed", async () => {
    const data = await callRoute<JourneyResponse>(
      journeyGET,
      q({ goal: "never_fired" }),
    );

    expect(data.visitors).toEqual([]);
    expect(data.uv).toBe(0);
    expect(data.pagination.hasMore).toBe(false);
  });
});
