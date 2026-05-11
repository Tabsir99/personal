import type {
  DailyStats,
  ReferralSource,
  TrafficSource,
} from "@tabsircg/schemas/dashboard";
import type { Device, GeoStatsDoc, PagePerfDoc, Simulation } from "./types";
import { isoDate, rand, weightedPick } from "./helpers";

// Window of history to synthesize. Doc IDs are `YYYY-MM-DD` so re-running with
// the same window overwrites the same docs.
const DAYS_OF_HISTORY = 28;

// Weight distributions for the synthesized session funnel. Each list sums to 1
// (within rounding) so weightedPick produces realistic-shaped traffic.
const COUNTRIES: Array<[string, number]> = [
  ["United States", 0.32],
  ["India", 0.16],
  ["United Kingdom", 0.1],
  ["Germany", 0.08],
  ["Canada", 0.07],
  ["Australia", 0.05],
  ["France", 0.05],
  ["Brazil", 0.05],
  ["Japan", 0.05],
  ["Netherlands", 0.04],
  ["Bangladesh", 0.03],
];

const DEVICES: Array<[Device, number]> = [
  ["desktop", 0.58],
  ["mobile", 0.36],
  ["tablet", 0.06],
];

const SOURCES: Array<[ReferralSource, number]> = [
  ["organic", 0.38],
  ["direct", 0.24],
  ["twitter", 0.13],
  ["linkedin", 0.1],
  ["reddit", 0.08],
  ["facebook", 0.04],
  ["email", 0.03],
];

const PAGES_PER_SESSION: Array<[number, number]> = [
  [1, 0.42],
  [2, 0.34],
  [3, 0.18],
  [4, 0.06],
];

// Page paths the portfolio app actually exposes (mirrors apps/portfolio/src/app/).
const STATIC_PAGES: Array<[string, number]> = [
  ["/", 0.4],
  ["/blog", 0.18],
  ["/privacy", 0.04],
  ["/terms", 0.04],
  ["/refund-policy", 0.04],
];

// Total weight reserved for blog post pages — split across the seeded slugs
// with the last (most-recent / featured) post taking the largest share.
const BLOG_PAGE_WEIGHTS = [0.07, 0.09, 0.14];

// Pure function: simulate `DAYS_OF_HISTORY` days of traffic against the given
// blog slugs. No I/O. Internally consistent: daily sums equal the sum of
// per-source and per-page values for that date.
export function simulateTraffic(blogSlugs: string[]): Simulation {
  const blogPages: Array<[string, number]> = blogSlugs.map((slug, i) => [
    `/blog/${slug}`,
    BLOG_PAGE_WEIGHTS[i] ?? 0.06,
  ]);
  const pageDistribution: Array<[string, number]> = [
    ...STATIC_PAGES,
    ...blogPages,
  ];

  const daily = new Map<string, DailyStats>();
  const geo = new Map<string, GeoStatsDoc>();
  const pages = new Map<string, PagePerfDoc>();
  const sources = new Map<string, TrafficSource>();
  const slugViews = new Map<string, number>();

  const getDaily = (date: string): DailyStats => {
    let d = daily.get(date);
    if (!d) {
      d = {
        date,
        sessions: 0,
        pageViews: 0,
        uniqueVisits: 0,
        bounces: 0,
        portfolioClicks: 0,
        totalSessionDuration: 0,
      };
      daily.set(date, d);
    }
    return d;
  };
  const getGeo = (date: string, country: string): GeoStatsDoc => {
    const key = `${date}_${country}`;
    let g = geo.get(key);
    if (!g) {
      g = {
        date,
        country,
        sessions: 0,
        pageViews: 0,
        uniqueVisits: 0,
        bounces: 0,
        devices: { mobile: 0, desktop: 0, tablet: 0 },
      };
      geo.set(key, g);
    }
    return g;
  };
  const getPage = (date: string, p: string): PagePerfDoc => {
    const key = `${date}_${encodeURIComponent(p)}`;
    let pg = pages.get(key);
    if (!pg) {
      pg = {
        date,
        path: p,
        views: 0,
        totalTimeOnPage: 0,
        bounces: 0,
        exitCount: 0,
      };
      pages.set(key, pg);
    }
    return pg;
  };
  const getSource = (date: string, source: ReferralSource): TrafficSource => {
    const key = `${date}_${source}`;
    let t = sources.get(key);
    if (!t) {
      t = { date, source, sessions: 0, pageViews: 0, bounces: 0 };
      sources.set(key, t);
    }
    return t;
  };

  const today = new Date();
  for (let offset = DAYS_OF_HISTORY - 1; offset >= 0; offset--) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - offset);
    const date = isoDate(day);
    const isWeekend = day.getUTCDay() === 0 || day.getUTCDay() === 6;
    const sessionCount = rand(4, isWeekend ? 10 : 14);

    for (let s = 0; s < sessionCount; s++) {
      const country = weightedPick(COUNTRIES);
      const device = weightedPick(DEVICES);
      const source = weightedPick(SOURCES);
      const isReturning = Math.random() < 0.22;

      const d = getDaily(date);
      const g = getGeo(date, country);
      const t = getSource(date, source);

      d.sessions += 1;
      g.sessions += 1;
      t.sessions += 1;
      g.devices[device] += 1;
      if (!isReturning) {
        d.uniqueVisits += 1;
        g.uniqueVisits += 1;
      }
      if (Math.random() < 0.14) d.portfolioClicks += 1;

      const pageCount = weightedPick(PAGES_PER_SESSION);
      for (let p = 0; p < pageCount; p++) {
        const pagePath = weightedPick(pageDistribution);
        // Real bounces: short visit on a single-page session.
        const isShort = pageCount === 1 && Math.random() < 0.45;
        const timeOnPage = isShort ? rand(2, 9) : rand(18, 210);

        d.pageViews += 1;
        g.pageViews += 1;
        t.pageViews += 1;

        const pg = getPage(date, pagePath);
        pg.views += 1;
        pg.totalTimeOnPage += timeOnPage;
        pg.exitCount += 1;

        if (pagePath.startsWith("/blog/")) {
          const slug = pagePath.slice("/blog/".length);
          slugViews.set(slug, (slugViews.get(slug) ?? 0) + 1);
        }

        // Production's page_exit handler increments bounces on daily/page/geo
        // when timeOnPage < 10s. Match that here so the counts line up.
        if (timeOnPage < 10) {
          d.bounces += 1;
          pg.bounces += 1;
          g.bounces += 1;
        }

        d.totalSessionDuration += timeOnPage;
      }
    }
  }

  return { daily, geo, pages, sources, slugViews };
}
