import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/requireAuth", () => ({
  requireAuth: vi.fn().mockResolvedValue(undefined),
}));

import { NextRequest } from "next/server";
import type { AnalyticsEventRow } from "@tabsircg/analytics-contract";
import { generateSeed } from "@/lib/__fixtures__/analyticsSeed";
import {
  referenceMain,
  referenceSources,
  referencePages,
  referenceLocations,
  referenceSystem,
  referenceEvents,
  referenceBots,
  referenceBotPages,
  type Win,
} from "@/lib/__fixtures__/analyticsReference";
import { CAMPAIGN_DIMENSIONS } from "@/lib/analyticsTypes";

import { GET as mainGET } from "@/app/api/analytics/main/route";
import { GET as sourcesGET } from "@/app/api/analytics/sources/route";
import { GET as pagesGET } from "@/app/api/analytics/pages/route";
import { GET as locationsGET } from "@/app/api/analytics/locations/route";
import { GET as systemGET } from "@/app/api/analytics/system/route";
import { GET as eventsGET } from "@/app/api/analytics/events/route";
import { GET as realtimeGET } from "@/app/api/analytics/realtime/route";
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
 * Run: pnpm -F admin exec vitest run src/lib/analyticsRoutes.integration.test.ts
 */
const HOST = process.env.TINYBIRD_HOST;
const TOKEN = process.env.TINYBIRD_TOKEN;
const RUN = Boolean(HOST && TOKEN);
const describeMaybe = RUN ? describe : describe.skip;

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
const WID_RT = `${WID}-rt`;
const BOT_NAME = "GPTBot";

const rows = generateSeed({
  websiteId: WID,
  seed: 1234,
  minRows: 10_000,
  windowStart: prevStart,
  windowEnd: end,
});
const realtimeRows = buildRealtimeRows();
const allRows = [...rows, ...realtimeRows];

function rtRow(over: Partial<AnalyticsEventRow>): AnalyticsEventRow {
  return {
    website_id: WID_RT,
    type: "pageview",
    domain: "tabsircg.com",
    href: "https://tabsircg.com/",
    referrer: "",
    visitor_id: "",
    session_id: "",
    language: "en-US",
    timezone: "UTC",
    event_name: "pageview",
    extra_data: "{}",
    country: "US",
    region: "NY",
    city: "New York",
    browser: "Chrome",
    os: "Windows",
    device: "desktop",
    is_bot: 0,
    bot_category: "",
    bot_name: "",
    ip: "1.2.3.4",
    viewport_w: 0,
    viewport_h: 0,
    screen_w: 0,
    screen_h: 0,
    session_number: 1,
    revenue_cents: 0,
    timestamp: now - 2 * 60 * 1000,
    ...over,
  };
}

// Three distinct human visitors (one repeated) + a bot, all within the last
// 10 minutes → realtime must count exactly 3.
function buildRealtimeRows(): AnalyticsEventRow[] {
  return [
    rtRow({ visitor_id: "rt1", session_id: "rt1" }),
    rtRow({ visitor_id: "rt1", session_id: "rt1" }),
    rtRow({ visitor_id: "rt2", session_id: "rt2" }),
    rtRow({ visitor_id: "rt3", session_id: "rt3" }),
    rtRow({
      visitor_id: "rtbot",
      session_id: "rtbot",
      is_bot: 1,
      bot_name: "GPTBot",
      bot_category: "training",
    }),
  ];
}

async function ingest(batch: AnalyticsEventRow[]): Promise<void> {
  const res = await fetch(`${HOST}/v0/events?name=analytics_events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/x-ndjson",
    },
    body: batch.map((r) => JSON.stringify(r)).join("\n"),
  });
  const body = (await res.json()) as { quarantined_rows?: number };
  if (!res.ok) throw new Error(`ingest failed (${res.status})`);
  if (body.quarantined_rows)
    throw new Error(`ingest quarantined ${body.quarantined_rows} rows`);
}

async function waitForRows(expected: number): Promise<void> {
  const deadline = Date.now() + 90_000;
  // Async ingest isn't queryable for a few seconds; skip the polls that would
  // always see 0 rows.
  await new Promise((r) => setTimeout(r, 5000));
  for (;;) {
    const res = await fetch(`${HOST}/v0/sql`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: `SELECT count() AS c FROM analytics_events WHERE website_id IN ('${WID}', '${WID_RT}') FORMAT JSON`,
    });
    const c = Number(
      ((await res.json()) as { data: { c: number }[] }).data[0]?.c ?? 0,
    );
    if (c >= expected) return;
    if (Date.now() > deadline)
      throw new Error(`only ${c}/${expected} rows visible after 90s`);
    await new Promise((r) => setTimeout(r, 2000));
  }
}

async function waitForJob(jobUrl: string): Promise<void> {
  const deadline = Date.now() + 60_000;
  for (;;) {
    const job = (await (
      await fetch(jobUrl, { headers: { Authorization: `Bearer ${TOKEN}` } })
    ).json()) as { status?: string };
    if (job.status === "done" || job.status === "error") return;
    if (Date.now() > deadline) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

// Delete the run's rows and WAIT for the async delete job to finish, so nothing
// lingers in the datasource after the process exits. Best-effort: a failed
// cleanup never fails the suite, and the throwaway ids keep leftovers harmless.
async function cleanup(): Promise<void> {
  try {
    const res = await fetch(`${HOST}/v0/datasources/analytics_events/delete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `delete_condition=${encodeURIComponent(
        `website_id IN ('${WID}', '${WID_RT}')`,
      )}`,
    });
    const job = (await res.json()) as { job_url?: string };
    if (res.ok && job.job_url) await waitForJob(job.job_url);
  } catch {
    // cleanup is best-effort
  }
}

type Handler = (req: NextRequest, ctx: unknown) => Promise<Response>;

async function call<T>(
  handler: Handler,
  qs: Record<string, string>,
): Promise<T> {
  const url = `http://localhost/api/analytics?${new URLSearchParams(qs)}`;
  const res = await handler(new NextRequest(url), {});
  const body = (await res.json()) as
    { status: "success"; data: T } | { status: "error"; message: string };
  if (body.status !== "success")
    throw new Error(`route error: ${body.message}`);
  return body.data;
}

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
    for (let i = 0; i < allRows.length; i += 1000)
      await ingest(allRows.slice(i, i + 1000));
    await waitForRows(allRows.length);
  }, 150_000);

  afterAll(cleanup, 90_000);

  it("main: overview + timeseries + revenue", async () => {
    const data = await call<Record<string, Rowish>>(mainGET as Handler, q);
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
      ],
    );
  });

  it("sources: referrers, channels, campaigns", async () => {
    const data = await call<Record<string, Rowish[] & Rowish>>(
      sourcesGET as Handler,
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
    const data = await call<Record<string, Rowish[]>>(pagesGET as Handler, q);
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
    const data = await call<Record<string, Rowish[]>>(
      locationsGET as Handler,
      q,
    );
    const ref = referenceLocations(rows, win);
    expectRows(data.countries, ref.countries, (r) => String(r.name), [
      "uv",
      "revenue",
    ]);
    expectRows(data.regions, ref.regions, (r) => String(r.name), [
      "uv",
      "revenue",
    ]);
    expectRows(data.cities, ref.cities, (r) => String(r.name), [
      "uv",
      "revenue",
    ]);
  });

  it("system: browsers, os, devices (revenue dedup across a fan-out)", async () => {
    const data = await call<Record<string, Rowish[]>>(systemGET as Handler, q);
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

  it("events: goals + conversion", async () => {
    const data = await call<{ goals: Rowish[]; totalVisitors: number }>(
      eventsGET as Handler,
      q,
    );
    const ref = referenceEvents(rows, win);
    expect(Number(data.totalVisitors)).toBe(ref.totalVisitors);
    expectRows(data.goals, ref.goals, (r) => String(r.name), [
      "uv",
      "total",
      "conversionRate",
    ]);
  });

  it("bots: totals, categories, per-bot, timeseries", async () => {
    const data = await call<{
      total: number;
      categories: Rowish[];
      bots: Rowish[];
      timeseries: Rowish[];
    }>(botsGET as Handler, q);
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
    const data = await call<{
      bot: string;
      category: string;
      total: number;
      pages: Rowish[];
    }>(botPagesGET as Handler, { websiteId: WID, period, bot: BOT_NAME });
    expect(data.bot).toBe(ref.bot);
    expect(data.category).toBe(ref.category);
    expect(Number(data.total)).toBe(ref.total);
    expectRows(data.pages, ref.pages, (r) => String(r.name), ["count"]);
  });

  it("realtime: distinct human visitors in the last 10 minutes", async () => {
    const data = await call<{ count: number }>(realtimeGET as Handler, {
      websiteId: WID_RT,
    });
    expect(Number(data.count)).toBe(3);
  });
});

describe.skipIf(RUN)(
  "analytics routes — skipped without Tinybird creds",
  () => {
    it("is skipped because TINYBIRD_HOST/TINYBIRD_TOKEN are unset", () => {
      expect(true).toBe(true);
    });
  },
);
