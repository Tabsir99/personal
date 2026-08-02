import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type {
  FunnelDefinition,
  FunnelDetailResponse,
  FunnelStep,
} from "@/lib/analyticsTypes";

vi.mock("@/lib/requireAuth", () => ({
  requireAuth: vi.fn().mockResolvedValue(undefined),
}));

// getFunnel() reads Firestore; a hoisted stub keeps this on Tinybird compute.
const { WID, FUNNEL } = vi.hoisted(() => {
  const wid = `ftest-${Date.now().toString(36)}`;
  const iso = new Date().toISOString();
  const steps: FunnelStep[] = [
    {
      id: "s1",
      name: "Landing",
      type: "pageview",
      url: "https://tabsircg.com/",
      urlMatchType: "startsWith",
      goalCompletionType: "completed",
    },
    {
      id: "s2",
      name: "Read an article",
      type: "goal",
      goalName: "article_read",
      goalCompletionType: "completed",
    },
    {
      id: "s3",
      name: "Any blog page",
      type: "pageview",
      url: "/blog",
      urlMatchType: "contains",
      goalCompletionType: "completed",
    },
    {
      id: "s4",
      name: "Projects page",
      type: "pageview",
      url: "/projects",
      urlMatchType: "endsWith",
      goalCompletionType: "completed",
    },
    {
      id: "s5",
      name: "Success page",
      type: "pageview",
      url: "https://tabsircg.com/success",
      urlMatchType: "equals",
      goalCompletionType: "completed",
    },
    {
      id: "s6",
      name: "Clicked coffee",
      type: "goal",
      goalName: "coffee_click",
      goalCompletionType: "completed",
    },
    {
      id: "s7",
      name: "Paid",
      type: "goal",
      goalName: "payment",
      goalCompletionType: "completed",
    },
  ];
  const funnel: FunnelDefinition = {
    id: `funnel-${wid}`,
    websiteId: wid,
    name: "Landing to payment",
    slug: "landing-to-payment",
    steps,
    isActive: true,
    createdAt: iso,
    updatedAt: iso,
  };
  return { WID: wid, FUNNEL: funnel };
});

vi.mock("@/actions/funnelActions", () => ({
  getFunnel: vi.fn(async () => FUNNEL),
}));

import { generateSeed } from "@/test/fixtures/analyticsSeed";
import { referenceFunnel, type Win } from "@/test/fixtures/funnelReference";
import {
  TINYBIRD_ENABLED,
  ingestRows,
  waitForRows,
  cleanupRows,
  callRoute,
} from "@/test/support/tinybird";
import { GET as funnelGET } from "@/app/api/analytics/funnel/route";

// Funnel route vs an independent JS oracle over the same rows, on real
// Tinybird. Skips without creds. `pnpm -F admin test funnel`
const DAY = 86_400_000;
const now = Date.now();
const D = Math.floor(now / DAY) * DAY;
const start = D - 14 * DAY;
const end = D;
const prevStart = D - 28 * DAY;
const win: Win = { start, end };
const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const period = `custom:${fmt(start)}:${fmt(end - DAY)}`;

// Seed the previous window too so the `timestamp >= start` filter is genuinely exercised.
const rows = generateSeed({
  websiteId: WID,
  seed: 4242,
  minRows: 8000,
  windowStart: prevStart,
  windowEnd: end,
});

const describeMaybe = TINYBIRD_ENABLED ? describe : describe.skip;

describeMaybe("analytics funnel route — real Tinybird", () => {
  beforeAll(async () => {
    await ingestRows(rows);
    await waitForRows([WID], rows.length);
  }, 150_000);

  afterAll(() => cleanupRows([WID]), 90_000);

  it("computes independent per-step unique visitors, conversion + drop-off", async () => {
    const data = await callRoute<FunnelDetailResponse>(funnelGET, {
      websiteId: WID,
      period,
      funnelId: FUNNEL.id,
    });
    const ref = referenceFunnel(FUNNEL, rows, win);

    expect(data.funnel).toEqual(FUNNEL);

    expect(ref.data.every((d) => d.value > 0)).toBe(true);
    expect(
      ref.data.some((d, i) => i > 0 && d.value > ref.data[i - 1].value),
    ).toBe(true);
    expect(ref.data.some((d) => d.revenue > 0)).toBe(true);
    expect(ref.data[0].topReferrers.length).toBeGreaterThan(0);
    expect(ref.data[0].topCountries.length).toBeGreaterThan(0);

    expect(data.data.length).toBe(FUNNEL.steps.length);
    data.data.forEach((step, i) => {
      const r = ref.data[i];
      expect(step.value, `step ${i} value`).toBe(r.value); // uniqExact — exact
      expect(step.stepIndex, `step ${i} stepIndex`).toBe(i);
      expect(step.stepType, `step ${i} stepType`).toBe(r.stepType);
      expect(step.conversionRate, `step ${i} conversionRate`).toBeCloseTo(
        r.conversionRate,
        6,
      );
      expect(step.dropoffFromPrevious, `step ${i} dropoff`).toBeCloseTo(
        r.dropoffFromPrevious,
        6,
      );
      expect(step.revenue, `step ${i} revenue`).toBeCloseTo(r.revenue, 4);
      expect(step.topReferrers, `step ${i} topReferrers`).toEqual(
        r.topReferrers,
      );
      expect(step.topCountries, `step ${i} topCountries`).toEqual(
        r.topCountries,
      );
    });

    expect(data.metrics.totalVisitors).toBe(ref.metrics.totalVisitors);
    expect(data.metrics.completions).toBe(ref.metrics.completions);
    expect(data.metrics.overallConversionRate).toBeCloseTo(
      ref.metrics.overallConversionRate,
      6,
    );
    expect(data.metrics.overallRevenuePerVisitor).toBeCloseTo(
      ref.metrics.overallRevenuePerVisitor,
      6,
    );
  });
});

describe.skipIf(TINYBIRD_ENABLED)(
  "analytics funnel route — skipped without Tinybird creds",
  () => {
    it("is skipped because TINYBIRD_HOST/TINYBIRD_TOKEN are unset", () => {
      expect(true).toBe(true);
    });
  },
);
