import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { AnalyticsEventRow } from "@tabsircg/schemas/analytics";
import type {
  FunnelDefinition,
  FunnelDetailResponse,
  FunnelStep,
} from "@/lib/analyticsTypes";

vi.mock("@/lib/requireAuth", () => ({
  requireAuth: vi.fn().mockResolvedValue(undefined),
}));

const { WID, FUNNEL } = vi.hoisted(() => {
  const wid = `rktest-${Date.now().toString(36)}`;
  const iso = new Date().toISOString();
  const steps: FunnelStep[] = [
    {
      id: "s1",
      name: "Any page",
      type: "pageview",
      url: "https://revtest.example/",
      urlMatchType: "startsWith",
      goalCompletionType: "completed",
    },
    {
      id: "s2",
      name: "Page E",
      type: "pageview",
      url: "/e",
      urlMatchType: "endsWith",
      goalCompletionType: "completed",
    },
    {
      id: "s3",
      name: "Page C",
      type: "pageview",
      url: "/c",
      urlMatchType: "contains",
      goalCompletionType: "completed",
    },
    {
      id: "s4",
      name: "Paid",
      type: "goal",
      goalName: "payment",
      goalCompletionType: "completed",
    },
  ];
  const funnel: FunnelDefinition = {
    id: `funnel-${wid}`,
    websiteId: wid,
    name: "Revenue kinds",
    slug: "revenue-kinds",
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

import {
  TINYBIRD_ENABLED,
  ingestRows,
  waitForRows,
  cleanupRows,
  callRoute,
} from "@/test/support/tinybird";
import { GET as mainGET } from "@/app/api/analytics/main/route";
import { GET as pagesGET } from "@/app/api/analytics/pages/route";
import { GET as sourcesGET } from "@/app/api/analytics/sources/route";
import { GET as locationsGET } from "@/app/api/analytics/locations/route";
import { GET as systemGET } from "@/app/api/analytics/system/route";
import { GET as funnelGET } from "@/app/api/analytics/funnel/route";

const DAY = 86_400_000;
const HOUR = 3_600_000;

const D = Math.floor(Date.now() / DAY) * DAY;
const D0 = D - 3 * DAY;
const D1 = D - 2 * DAY;
const D2 = D - 1 * DAY;
const WINDOW_END = D;

const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const period = `custom:${fmt(D0)}:${fmt(D2)}`;
const q = { websiteId: WID, period, granularity: "daily" };

const HOST = "revtest.example";
const url = (path: string) => `https://${HOST}${path}`;
const GOOGLE = "https://www.google.com/";
const HN = "https://news.ycombinator.com/";
const EXIT_URL = "https://github.com/tabsircg";

const uid = (n: number) =>
  `${`${n}`.repeat(8)}-${`${n}`.repeat(4)}-4${`${n}`.repeat(3)}-8${`${n}`.repeat(3)}-${`${n}`.repeat(12)}`;
const sid = (n: number) =>
  `${`${n}`.repeat(8)}-aaaa-4aaa-8aaa-${`${n}`.repeat(12)}`;

type BrowserName = "Chrome" | "Firefox" | "Safari";

const AGENTS: Record<BrowserName, { os: string; device: string }> = {
  Chrome: { os: "Windows", device: "desktop" },
  Firefox: { os: "macOS", device: "desktop" },
  Safari: { os: "iOS", device: "mobile" },
};

const PLACES: Record<string, { region: string; city: string }> = {
  US: { region: "California", city: "San Francisco" },
  GB: { region: "England", city: "London" },
  DE: { region: "Berlin", city: "Berlin" },
};

interface View {
  path: string;
  at: number;
  browser: BrowserName;
}

interface Pay {
  cents: number;
  at: number;
  extra: Record<string, string>;
}

interface Spec {
  n: number;
  country: string;
  referrer: string;
  sessionNumber: number;
  views: View[];
  pays: Pay[];
  exitAt?: number;
}

const of = (kind: string) => ({ kind, stripe_event_id: `evt_${kind}` });

const SPECS: Spec[] = [
  {
    n: 1,
    country: "US",
    referrer: GOOGLE,
    sessionNumber: 1,
    views: [
      { path: "/a", at: D0 + 1 * HOUR, browser: "Chrome" },
      { path: "/a", at: D0 + 2 * HOUR, browser: "Chrome" },
      { path: "/b", at: D0 + 3 * HOUR, browser: "Firefox" },
    ],
    pays: [
      { cents: 100, at: D0 + 4 * HOUR, extra: of("charge") },
      { cents: -100, at: D2 + 1 * HOUR, extra: of("refund") },
    ],
    exitAt: D0 + 3 * HOUR + 1_800_000,
  },
  {
    n: 2,
    country: "US",
    referrer: "",
    sessionNumber: 1,
    views: [
      { path: "/a", at: D0 + 5 * HOUR, browser: "Chrome" },
      { path: "/e", at: D0 + 6 * HOUR, browser: "Chrome" },
    ],
    pays: [{ cents: 200, at: D0 + 7 * HOUR, extra: of("charge") }],
  },
  {
    n: 3,
    country: "GB",
    referrer: GOOGLE,
    sessionNumber: 1,
    views: [{ path: "/b", at: D1 + 1 * HOUR, browser: "Firefox" }],
    pays: [
      { cents: 400, at: D1 + 2 * HOUR, extra: of("charge") },
      { cents: -200, at: D1 + 3 * HOUR, extra: of("refund") },
    ],
  },
  {
    n: 4,
    country: "GB",
    referrer: "",
    sessionNumber: 3,
    views: [{ path: "/c", at: D1 + 4 * HOUR, browser: "Safari" }],
    pays: [
      { cents: 800, at: D1 + 5 * HOUR, extra: of("charge") },
      { cents: -400, at: D2 + 2 * HOUR, extra: of("dispute") },
    ],
  },
  {
    n: 5,
    country: "DE",
    referrer: HN,
    sessionNumber: 1,
    views: [
      { path: "/c", at: D2 + 3 * HOUR, browser: "Chrome" },
      { path: "/d", at: D2 + 4 * HOUR, browser: "Chrome" },
    ],
    pays: [],
  },
  {
    n: 6,
    country: "US",
    referrer: "",
    sessionNumber: 1,
    views: [{ path: "/a", at: D0 + 8 * HOUR, browser: "Chrome" }],
    pays: [
      { cents: 1600, at: D0 - 1 * HOUR, extra: of("charge") },
      { cents: 3200, at: WINDOW_END, extra: of("charge") },
    ],
  },
  {
    n: 7,
    country: "DE",
    referrer: "",
    sessionNumber: 1,
    views: [{ path: "/d", at: D2 + 5 * HOUR, browser: "Safari" }],
    pays: [
      { cents: 6400, at: D2 + 6 * HOUR, extra: of("chargeback_reversal") },
    ],
  },
  {
    n: 8,
    country: "DE",
    referrer: "",
    sessionNumber: 1,
    views: [{ path: "/d", at: D2 + 7 * HOUR, browser: "Safari" }],
    pays: [{ cents: 12800, at: D2 + 8 * HOUR, extra: {} }],
  },
  {
    n: 9,
    country: "US",
    referrer: GOOGLE,
    sessionNumber: 1,
    views: [{ path: "/e", at: D0 + 9 * HOUR, browser: "Chrome" }],
    pays: [{ cents: 200, at: D0 + 10 * HOUR, extra: of("charge") }],
  },
];

function toRows(spec: Spec): AnalyticsEventRow[] {
  const place = PLACES[spec.country]!;
  const shell = (browser: BrowserName, at: number): AnalyticsEventRow => ({
    website_id: WID,
    type: "pageview",
    domain: HOST,
    href: url("/"),
    referrer: spec.referrer,
    visitor_id: uid(spec.n),
    session_id: sid(spec.n),
    language: "en-US",
    timezone: "UTC",
    event_name: "pageview",
    extra_data: "{}",
    country: spec.country,
    region: place.region,
    city: place.city,
    browser,
    os: AGENTS[browser].os,
    device: AGENTS[browser].device,
    is_bot: 0,
    bot_category: "",
    bot_name: "",
    ip: "1.2.3.4",
    viewport_w: 1440,
    viewport_h: 900,
    screen_w: 1440,
    screen_h: 900,
    session_number: spec.sessionNumber,
    revenue_cents: 0,
    timestamp: at,
  });

  const views = spec.views.map((v) => ({
    ...shell(v.browser, v.at),
    href: url(v.path),
  }));

  const pays = spec.pays.map((p) => ({
    ...shell("Chrome", p.at),
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
    revenue_cents: p.cents,
    extra_data: JSON.stringify(p.extra),
  }));

  const exits =
    spec.exitAt === undefined
      ? []
      : [
          {
            ...shell("Firefox", spec.exitAt),
            type: "external_link",
            event_name: "external_link",
            extra_data: JSON.stringify({ url: EXIT_URL, text: "GitHub" }),
          },
        ];

  return [...views, ...pays, ...exits];
}

const rows = SPECS.flatMap(toRows);

interface Split {
  charge: number;
  refund: number;
  dispute: number;
}

const rev = (charge: number, refund: number, dispute: number): Split => ({
  charge,
  refund,
  dispute,
});

const ZERO = rev(0, 0, 0);
const HEADLINE = rev(17, -3, -4);

function expectRevenue(actual: unknown, expected: Split, label: string): void {
  const split = actual as Partial<Record<keyof Split, unknown>> | undefined;
  expect(split, `${label} has a revenue object`).toBeTypeOf("object");
  for (const kind of ["charge", "refund", "dispute"] as const)
    expect(Number(split?.[kind]), `${label}.${kind}`).toBeCloseTo(
      expected[kind],
      9,
    );
}

type Rowish = Record<string, unknown>;

function pick(list: Rowish[], name: string): Rowish {
  const found = list.filter((r) => String(r.name) === name);
  expect(found, `exactly one row named ${name}`).toHaveLength(1);
  return found[0]!;
}

const sumCharge = (list: Rowish[]) =>
  list.reduce((total, r) => total + Number((r.revenue as Split).charge), 0);

const describeMaybe = TINYBIRD_ENABLED ? describe : describe.skip;

describeMaybe(
  "revenue by kind — hand-computed fixture on real Tinybird",
  () => {
    beforeAll(async () => {
      await ingestRows(rows);
      await waitForRows([WID], rows.length);
    }, 150_000);

    afterAll(() => cleanupRows([WID]), 90_000);

    it("keeps the three kinds separate and signed, never netted", async () => {
      const data = await callRoute<Record<string, Rowish>>(mainGET, q);

      expect(Number(data.current.visitors)).toBe(9);
      expect(Number(data.current.pageviews)).toBe(13);
      expectRevenue(data.current.revenue, HEADLINE, "current");
    });

    it("counts only visitors who were actually charged as paying", async () => {
      const data = await callRoute<Record<string, Rowish>>(mainGET, q);

      expectRevenue(data.current.revenue, HEADLINE, "current");
      expect(Number(data.current.payingVisitors)).toBe(5);
    });

    it("excludes a payment landing exactly on the window's exclusive end", async () => {
      const data = await callRoute<Record<string, Rowish>>(mainGET, q);

      expectRevenue(data.current.revenue, HEADLINE, "current");
      expectRevenue(data.previous.revenue, rev(16, 0, 0), "previous");
      expect(Number(data.previous.visitors)).toBe(0);
      expect(Number(data.previous.payingVisitors)).toBe(1);
    });

    it("buckets a refund on the day it happened, not the day of its charge", async () => {
      const data = await callRoute<{ timeseries: Rowish[] }>(mainGET, q);
      const byDay = new Map(
        data.timeseries.map((p) => [Number(p.timestamp), p] as const),
      );

      expect([...byDay.keys()].sort((a, b) => a - b)).toEqual([D0, D1, D2]);
      expectRevenue(byDay.get(D0)!.revenue, rev(5, 0, 0), "day 0");
      expectRevenue(byDay.get(D1)!.revenue, rev(12, -2, 0), "day 1");
      expectRevenue(byDay.get(D2)!.revenue, rev(0, -1, -4), "day 2");
    });

    it("does not treat a refund-only day as a conversion", async () => {
      const data = await callRoute<{ timeseries: Rowish[] }>(mainGET, q);
      const byDay = new Map(
        data.timeseries.map((p) => [Number(p.timestamp), p] as const),
      );

      expect(Number(byDay.get(D0)!.payingVisitors)).toBe(3);
      expect(Number(byDay.get(D1)!.payingVisitors)).toBe(2);
      expect(Number(byDay.get(D2)!.payingVisitors)).toBe(0);
      expect(Number(byDay.get(D2)!.conversionRate)).toBe(0);
    });

    it("credits a visitor's whole revenue to every page they viewed", async () => {
      const data = await callRoute<Record<string, Rowish[]>>(pagesGET, q);

      expectRevenue(pick(data.pages, url("/a")).revenue, rev(3, -1, 0), "/a");
      expectRevenue(pick(data.pages, url("/b")).revenue, rev(5, -3, 0), "/b");
      expectRevenue(pick(data.pages, url("/c")).revenue, rev(8, 0, -4), "/c");
      expectRevenue(pick(data.pages, url("/d")).revenue, ZERO, "/d");
      expectRevenue(pick(data.pages, url("/e")).revenue, rev(4, 0, 0), "/e");

      expect(sumCharge(data.pages)).toBeCloseTo(20, 9);
    });

    it("partitions visitors across entry pages, so they sum back to the headline", async () => {
      const data = await callRoute<Record<string, Rowish[]>>(pagesGET, q);

      expectRevenue(
        pick(data.entryPages, url("/a")).revenue,
        rev(3, -1, 0),
        "/a",
      );
      expectRevenue(
        pick(data.entryPages, url("/b")).revenue,
        rev(4, -2, 0),
        "/b",
      );
      expectRevenue(
        pick(data.entryPages, url("/c")).revenue,
        rev(8, 0, -4),
        "/c",
      );
      expectRevenue(pick(data.entryPages, url("/d")).revenue, ZERO, "/d");
      expectRevenue(
        pick(data.entryPages, url("/e")).revenue,
        rev(2, 0, 0),
        "/e",
      );

      expect(sumCharge(data.entryPages)).toBeCloseTo(17, 9);
    });

    it("counts a visitor once on the hostname despite their many pages", async () => {
      const data = await callRoute<Record<string, Rowish[]>>(pagesGET, q);

      expect(data.hostnames).toHaveLength(1);
      expectRevenue(data.hostnames[0]!.revenue, HEADLINE, "hostname");
    });

    it("never attributes revenue to an exit link the payer clicked", async () => {
      const data = await callRoute<Record<string, Rowish[]>>(pagesGET, q);

      const exit = pick(data.exitLinks, EXIT_URL);
      expect(Number(exit.uv)).toBe(1);
      expect(Number(exit.exits)).toBe(1);
      expectRevenue(exit.revenue, ZERO, "exit link");
    });

    it("dedups a visitor across two browsers on the device row but not the browser rows", async () => {
      const data = await callRoute<Record<string, Rowish[]>>(systemGET, q);

      expectRevenue(
        pick(data.browsers, "Chrome").revenue,
        rev(5, -1, 0),
        "Chrome",
      );
      expectRevenue(
        pick(data.browsers, "Firefox").revenue,
        rev(5, -3, 0),
        "Firefox",
      );
      expectRevenue(
        pick(data.browsers, "Safari").revenue,
        rev(8, 0, -4),
        "Safari",
      );
      expect(sumCharge(data.browsers)).toBeCloseTo(18, 9);

      expectRevenue(
        pick(data.devices, "desktop").revenue,
        rev(9, -3, 0),
        "desktop",
      );
      expectRevenue(
        pick(data.devices, "mobile").revenue,
        rev(8, 0, -4),
        "mobile",
      );
      expect(sumCharge(data.devices)).toBeCloseTo(17, 9);
    });

    it("splits revenue by country", async () => {
      const data = await callRoute<Record<string, Rowish[]>>(locationsGET, q);

      expectRevenue(pick(data.countries, "US").revenue, rev(5, -1, 0), "US");
      expectRevenue(pick(data.countries, "GB").revenue, rev(12, -2, -4), "GB");
      expectRevenue(pick(data.countries, "DE").revenue, ZERO, "DE");
      expect(sumCharge(data.countries)).toBeCloseTo(17, 9);
    });

    it("splits revenue by referrer alongside the new/returning counts", async () => {
      const data = await callRoute<Record<string, Rowish[]>>(sourcesGET, q);

      const google = pick(data.referrers, GOOGLE);
      expectRevenue(google.revenue, rev(7, -3, 0), "google");
      expect(Number(google.newVisitors)).toBe(3);
      expect(Number(google.returningVisitors)).toBe(0);

      const direct = pick(data.referrers, "");
      expectRevenue(direct.revenue, rev(10, 0, -4), "direct");
      expect(Number(direct.newVisitors)).toBe(4);
      expect(Number(direct.returningVisitors)).toBe(1);

      expectRevenue(pick(data.referrers, HN).revenue, ZERO, "hn");
      expect(sumCharge(data.referrers)).toBeCloseTo(17, 9);
    });

    it("gives every funnel step its own kind split", async () => {
      const data = await callRoute<FunnelDetailResponse>(funnelGET, {
        websiteId: WID,
        period,
        funnelId: FUNNEL.id,
      });

      expect(data.data.map((s) => s.value)).toEqual([9, 2, 2, 7]);
      expectRevenue(data.data[0]!.revenue, HEADLINE, "step 0");
      expectRevenue(data.data[1]!.revenue, rev(4, 0, 0), "step 1");
      expectRevenue(data.data[2]!.revenue, rev(8, 0, -4), "step 2");
      expectRevenue(data.data[3]!.revenue, HEADLINE, "step 3");

      expect(data.metrics.totalVisitors).toBe(9);
      expect(data.metrics.completions).toBe(7);
      expectRevenue(data.metrics.revenue, HEADLINE, "metrics");
    });
  },
);

describe.skipIf(TINYBIRD_ENABLED)(
  "revenue by kind — skipped without Tinybird creds",
  () => {
    it("is skipped because TINYBIRD_HOST/TINYBIRD_TOKEN are unset", () => {
      expect(true).toBe(true);
    });
  },
);
