import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/requireAuth", () => ({
  requireAuth: vi.fn().mockResolvedValue(undefined),
}));

import {
  TINYBIRD_ENABLED,
  ingestRows,
  waitForRows,
  cleanupRows,
  callRoute,
} from "@/test/support/tinybird";
import { generateSeed } from "@/test/fixtures/analyticsSeed";
import {
  referenceMain,
  referenceSources,
  referencePages,
  referenceLocations,
  referenceSystem,
  referenceGoals,
  referenceBots,
  referenceBotPages,
  type Win,
} from "@/test/fixtures/analyticsReference";
import { CAMPAIGN_DIMENSIONS } from "@/lib/analyticsTypes";

import { GET as mainGET } from "@/app/api/analytics/main/route";
import { GET as sourcesGET } from "@/app/api/analytics/sources/route";
import { GET as pagesGET } from "@/app/api/analytics/pages/route";
import { GET as locationsGET } from "@/app/api/analytics/locations/route";
import { GET as systemGET } from "@/app/api/analytics/system/route";
import { GET as goalsGET } from "@/app/api/analytics/goals/route";
import { GET as botsGET } from "@/app/api/analytics/bots/route";
import { GET as botPagesGET } from "@/app/api/analytics/bots/pages/route";

/**
 * Integration test for every analytics route against a REAL Tinybird workspace.
 * Seeds ≥10k realistic rows (see analyticsSeed) under throwaway website ids,
 * drives each real route handler, and asserts its output equals an independent
 * JS reference (see analyticsReference) computed from the same rows. Lists are
 * compared by key so array order / ties don't matter. Cleans up afterward.
 *
 * Self-skips without Tinybird credentials.
 *
 * Run only this suite:  pnpm -F admin test routes
 * Run the whole suite:  pnpm -F admin test
 */
const describeMaybe = TINYBIRD_ENABLED ? describe : describe.skip;

const DAY = 86_400_000;
const now = Date.now();
const D = Math.floor(now / DAY) * DAY;
const start = D - 14 * DAY;
const end = D;
const prevStart = D - 28 * DAY;
const win: Win = { start, end };
const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const period = `custom:${fmt(start)}:${fmt(end - DAY)}`;

const WID = `itest-${now.toString(36)}`;
const BOT_NAME = "GPTBot";

const rows = generateSeed({
  websiteId: WID,
  seed: 1234,
  minRows: 10_000,
  windowStart: prevStart,
  windowEnd: end,
});

type Rowish = Record<string, unknown>;

function indexBy(
  list: Rowish[],
  key: (r: Rowish) => string,
): Map<string, Rowish> {
  const m = new Map<string, Rowish>();
  for (const r of list) {
    const k = key(r);
    if (m.has(k)) throw new Error(`duplicate key: ${k}`);
    m.set(k, r);
  }
  return m;
}

function expectRows(
  actual: Rowish[],
  expected: Rowish[],
  key: (r: Rowish) => string,
  numFields: string[],
  strFields: string[] = [],
): void {
  const a = indexBy(actual, key);
  const e = indexBy(expected, key);
  expect([...a.keys()].sort()).toEqual([...e.keys()].sort());
  for (const [k, ev] of e) {
    const av = a.get(k)!;
    for (const f of numFields)
      expect(Number(av[f]), `${k}.${f}`).toBeCloseTo(Number(ev[f]), 6);
    for (const f of strFields) expect(av[f], `${k}.${f}`).toBe(ev[f]);
  }
}

function expectMetrics(actual: Rowish, expected: Rowish): void {
  for (const f of [
    "visitors",
    "pageviews",
    "sessions",
    "bounceRate",
    "sessionDuration",
  ])
    expect(Number(actual[f]), f).toBeCloseTo(Number(expected[f]), 6);
}

const q = { websiteId: WID, period, granularity: "daily" };

describeMaybe("analytics routes — real Tinybird, every route", () => {
  beforeAll(async () => {
    await ingestRows(rows);
    await waitForRows([WID], rows.length);
  }, 150_000);

  afterAll(() => cleanupRows([WID]), 90_000);

  it("main: overview + timeseries + revenue", async () => {
    const data = await callRoute<Record<string, Rowish>>(mainGET, q);
    const ref = referenceMain(rows, win, prevStart, DAY);
    expectMetrics(data.current, ref.current);
    expectMetrics(data.previous, ref.previous);
    expectRows(
      data.timeseries as unknown as Rowish[],
      ref.timeseries as unknown as Rowish[],
      (p) => String(p.timestamp),
      [
        "visitors",
        "newVisitors",
        "returningVisitors",
        "pageviews",
        "sessions",
        "bounceRate",
        "sessionDuration",
        "revenue",
        "payingVisitors",
        "conversionRate",
      ],
    );
    for (const b of data.timeseries as unknown as Rowish[]) {
      expect(
        Number(b.newVisitors) + Number(b.returningVisitors),
        `bucket ${b.timestamp}: newVisitors + returningVisitors must equal visitors`,
      ).toBe(Number(b.visitors));
    }

    for (const side of ["current", "previous"] as const) {
      expect(Number(data[side].revenue), `${side}.revenue`).toBe(
        ref[side].revenue,
      );
      expect(Number(data[side].payingVisitors), `${side}.payingVisitors`).toBe(
        ref[side].payingVisitors,
      );
      expect(
        Number(data[side].conversionRate),
        `${side}.conversionRate`,
      ).toBeCloseTo(ref[side].conversionRate, 6);
    }
  });

  it("sources: referrers, channels, campaigns", async () => {
    const data = await callRoute<Record<string, Rowish[] & Rowish>>(
      sourcesGET,
      q,
    );
    const ref = referenceSources(rows, win);
    expectRows(
      data.referrers as Rowish[],
      ref.referrers,
      (r) => String(r.name),
      ["newVisitors", "returningVisitors", "revenue"],
      ["channel"],
    );
    expectRows(data.channels as Rowish[], ref.channels, (r) => String(r.name), [
      "newVisitors",
      "returningVisitors",
      "revenue",
    ]);

    const campaigns = data.campaigns as unknown as {
      dims: Record<string, Rowish[]>;
      totals: Record<string, number>;
      all: Rowish[];
      allTotal: number;
    };
    for (const dim of CAMPAIGN_DIMENSIONS)
      expectRows(
        campaigns.dims[dim],
        ref.campaigns.dims[dim] as unknown as Rowish[],
        (r) => String(r.name),
        ["uv", "revenue"],
      );
    expect(campaigns.totals).toEqual(ref.campaigns.totals);
    expect(Number(campaigns.allTotal)).toBe(ref.campaigns.allTotal);
    expectRows(
      campaigns.all,
      ref.campaigns.all as unknown as Rowish[],
      (r) => String(r.name),
      ["uv", "revenue"],
    );
  });

  it("pages: pages, entry pages, hostnames, exit links", async () => {
    const data = await callRoute<Record<string, Rowish[]>>(pagesGET, q);
    const ref = referencePages(rows, win);
    expectRows(data.pages, ref.pages, (r) => String(r.name), [
      "uv",
      "pageviews",
      "revenue",
    ]);
    expectRows(data.entryPages, ref.entryPages, (r) => String(r.name), [
      "uv",
      "revenue",
    ]);
    expectRows(data.hostnames, ref.hostnames, (r) => String(r.name), [
      "uv",
      "revenue",
    ]);
    expectRows(data.exitLinks, ref.exitLinks, (r) => String(r.name), [
      "uv",
      "exits",
      "revenue",
    ]);
  });

  it("locations: countries, regions, cities", async () => {
    const data = await callRoute<Record<string, Rowish[]>>(locationsGET, q);
    const ref = referenceLocations(rows, win);
    // Keyed by country too: the seed puts London in both GB and CA, so a bare
    // name is not unique below the country level. Asserting `country` as a
    // string field is what catches an arbitrary `any()` winner.
    const geoKey = (r: Rowish) => `${String(r.country)}/${String(r.name)}`;
    expectRows(data.countries, ref.countries, (r) => String(r.name), [
      "uv",
      "revenue",
    ]);
    expectRows(
      data.regions,
      ref.regions,
      geoKey,
      ["uv", "revenue"],
      ["country"],
    );
    expectRows(data.cities, ref.cities, geoKey, ["uv", "revenue"], ["country"]);
  });

  it("locations: same city name in two countries stays two rows", async () => {
    const data = await callRoute<Record<string, Rowish[]>>(locationsGET, q);
    const londons = data.cities.filter((c) => c.name === "London");
    expect(londons.map((c) => String(c.country)).sort()).toEqual(["CA", "GB"]);
  });

  it("system: browsers, os, devices (revenue dedup across a fan-out)", async () => {
    const data = await callRoute<Record<string, Rowish[]>>(systemGET, q);
    const ref = referenceSystem(rows, win);
    expectRows(data.browsers, ref.browsers, (r) => String(r.name), [
      "uv",
      "revenue",
    ]);
    expectRows(data.os, ref.os, (r) => String(r.name), ["uv", "revenue"]);
    expectRows(data.devices, ref.devices, (r) => String(r.name), [
      "uv",
      "revenue",
    ]);
  });

  it("goals: metrics, series, catalog + conversion", async () => {
    const data = await callRoute<{
      goals: Rowish[];
      series: Rowish[];
      catalog: string[];
      totalVisitors: number;
    }>(goalsGET, q);
    const ref = referenceGoals(rows, win, DAY);

    expect(Number(data.totalVisitors)).toBe(ref.totalVisitors);
    expectRows(data.goals, ref.goals, (r) => String(r.name), [
      "uv",
      "total",
      "conversionRate",
    ]);

    expect(data.goals.map((g) => String(g.name))).toEqual(
      ref.goals.map((g) => g.name),
    );
    expect(data.catalog).toEqual(ref.catalog);

    expect(data.series.map((p) => Number(p.timestamp))).toEqual(
      ref.series.map((p) => p.timestamp),
    );
    expectRows(data.series, ref.series, (r) => String(r.timestamp), [
      ...ref.goals.map((g) => g.name),
    ]);
  });

  it("bots: totals, categories, per-bot, timeseries", async () => {
    const data = await callRoute<{
      total: number;
      categories: Rowish[];
      bots: Rowish[];
      timeseries: Rowish[];
    }>(botsGET, q);
    const ref = referenceBots(rows, win, DAY);

    expect(Number(data.total)).toBe(ref.total);
    expectRows(data.categories, ref.categories, (r) => String(r.category), [
      "count",
    ]);
    expectRows(
      data.bots,
      ref.bots,
      (r) => String(r.name),
      ["count"],
      ["category"],
    );

    const at = indexBy(data.timeseries, (p) => String(p.timestamp));
    const et = indexBy(ref.timeseries, (p) => String(p.timestamp));
    expect([...at.keys()].sort()).toEqual([...et.keys()].sort());
    for (const [k, ep] of et) {
      const ap = at.get(k)!;
      for (const cat of ref.activeCats)
        expect(Number(ap[cat] ?? 0), `${k}.${cat}`).toBe(Number(ep[cat] ?? 0));
    }
  });

  it("bots/pages: one bot's page hits", async () => {
    const ref = referenceBotPages(rows, win, BOT_NAME);
    expect(ref.total).toBeGreaterThan(0);
    const data = await callRoute<{
      bot: string;
      category: string;
      total: number;
      pages: Rowish[];
    }>(botPagesGET, { websiteId: WID, period, bot: BOT_NAME });
    expect(data.bot).toBe(ref.bot);
    expect(data.category).toBe(ref.category);
    expect(Number(data.total)).toBe(ref.total);
    expectRows(data.pages, ref.pages, (r) => String(r.name), ["count"]);
  });
});

describe.skipIf(TINYBIRD_ENABLED)(
  "analytics routes — skipped without Tinybird creds",
  () => {
    it("is skipped because TINYBIRD_HOST/TINYBIRD_TOKEN are unset", () => {
      expect(true).toBe(true);
    });
  },
);
