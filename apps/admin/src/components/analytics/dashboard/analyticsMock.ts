import type {
  OverviewMetrics,
  TimeseriesPoint,
  SourceMetric,
  ChannelMetric,
  PageMetric,
  EntryPageMetric,
  LocationMetric,
  SystemMetric,
  ExitLinkMetric,
  HostnameMetric,
  Period,
  BotCategory,
  BotCategoryTotal,
  BotMetric,
  BotTimeseriesPoint,
  BotPageMetric,
} from "@/lib/analyticsTypes";
import { rollupCampaigns } from "@/lib/analyticsTypes";

interface GoalMetric {
  name: string;
  uv: number;
  total: number;
  conversionRate: number;
}

export async function mockFetchEndpoint<T>(
  path: string,
  period: Period,
  extra?: Record<string, string>,
): Promise<T | null> {
  // Simulate network delay for realistic feel
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (path === "main") {
    const now = Date.now();
    const pointsCount =
      period === "today" || period === "yesterday"
        ? 24
        : period === "last7d"
          ? 7
          : 30;
    const step =
      period === "today" || period === "yesterday"
        ? 3600 * 1000
        : 24 * 3600 * 1000;
    const start = now - pointsCount * step;

    const timeseries: TimeseriesPoint[] = [];
    for (let i = 0; i < pointsCount; i++) {
      const ts = start + i * step;
      const visitors = Math.floor(500 + Math.random() * 1500);
      const newVisitors = Math.floor(visitors * (0.55 + Math.random() * 0.2));
      const pageviews = Math.floor(visitors * (1.2 + Math.random() * 0.8));
      const sessions = Math.floor(visitors * (0.8 + Math.random() * 0.2));
      const payingVisitors = Math.floor(
        visitors * (0.003 + Math.random() * 0.007),
      );
      timeseries.push({
        timestamp: ts,
        visitors,
        newVisitors,
        returningVisitors: visitors - newVisitors,
        pageviews,
        sessions,
        bounceRate: 0.35 + Math.random() * 0.25,
        sessionDuration: Math.floor(90 + Math.random() * 150),
        revenue: Math.floor(Math.random() * 600),
        payingVisitors,
        conversionRate: visitors > 0 ? payingVisitors / visitors : 0,
      });
    }

    const sum = (f: (p: TimeseriesPoint) => number) =>
      timeseries.reduce((acc, p) => acc + f(p), 0);
    const curVisitors = sum((p) => p.visitors);
    const curPaying = sum((p) => p.payingVisitors);
    const current: OverviewMetrics = {
      visitors: curVisitors,
      pageviews: sum((p) => p.pageviews),
      sessions: sum((p) => p.sessions),
      bounceRate: 0.425,
      sessionDuration: 182,
      revenue: sum((p) => p.revenue),
      payingVisitors: curPaying,
      conversionRate: curVisitors > 0 ? curPaying / curVisitors : 0,
    };

    const prevVisitors = Math.floor(curVisitors * 0.9);
    const prevPaying = Math.floor(curPaying * 0.82);
    const previous: OverviewMetrics = {
      visitors: prevVisitors,
      pageviews: Math.floor(current.pageviews * 0.88),
      sessions: Math.floor(current.sessions * 0.91),
      bounceRate: 0.452,
      sessionDuration: 165,
      revenue: Math.floor(current.revenue * 0.85),
      payingVisitors: prevPaying,
      conversionRate: prevVisitors > 0 ? prevPaying / prevVisitors : 0,
    };

    return { current, previous, timeseries } as unknown as T;
  }

  if (path === "locations") {
    const countries: LocationMetric[] = [
      { name: "US", uv: 14200, country: "US", revenue: 8600 },
      { name: "GB", uv: 8500, country: "GB", revenue: 5100 },
      { name: "DE", uv: 6200, country: "DE", revenue: 2900 },
      { name: "CA", uv: 4100, country: "CA", revenue: 3400 },
      { name: "FR", uv: 3800, country: "FR", revenue: 1500 },
      { name: "IN", uv: 3200, country: "IN", revenue: 700 },
      { name: "AU", uv: 2100, country: "AU", revenue: 1900 },
    ];

    const regions: LocationMetric[] = [
      { name: "California", uv: 5200, country: "US", revenue: 4200 },
      { name: "England", uv: 4300, country: "GB", revenue: 2600 },
      { name: "Texas", uv: 3800, country: "US", revenue: 1900 },
      { name: "New York", uv: 3100, country: "US", revenue: 3300 },
      { name: "Ontario", uv: 2900, country: "CA", revenue: 1200 },
      { name: "Île-de-France", uv: 2100, country: "FR", revenue: 1600 },
      { name: "New South Wales", uv: 1200, country: "AU", revenue: 500 },
    ];

    const cities: LocationMetric[] = [
      { name: "London", uv: 3200, country: "GB", revenue: 2400 },
      { name: "New York", uv: 2900, country: "US", revenue: 3100 },
      { name: "Los Angeles", uv: 2100, country: "US", revenue: 1200 },
      { name: "San Francisco", uv: 1800, country: "US", revenue: 2600 },
      { name: "Paris", uv: 1700, country: "FR", revenue: 900 },
      { name: "Toronto", uv: 1500, country: "CA", revenue: 1100 },
      { name: "Sydney", uv: 900, country: "AU", revenue: 700 },
    ];

    return { countries, regions, cities } as unknown as T;
  }

  if (path === "sources") {
    const campaigns = rollupCampaigns({
      utm_source: [
        { name: "newsletter", uv: 11514, revenue: 4200 },
        { name: "google", uv: 5175, revenue: 3100 },
        { name: "twitter", uv: 4362, revenue: 2600 },
        { name: "reddit", uv: 2062, revenue: 900 },
        { name: "producthunt", uv: 1712, revenue: 1200 },
      ],
      utm_medium: [
        { name: "email", uv: 11514, revenue: 4200 },
        { name: "cpc", uv: 7237, revenue: 4000 },
        { name: "paid_social", uv: 4362, revenue: 2600 },
      ],
      utm_campaign: [
        { name: "weekly_digest", uv: 11514, revenue: 4200 },
        { name: "blog_promo", uv: 5175, revenue: 3100 },
        { name: "launch_2026", uv: 4362, revenue: 2600 },
        { name: "devtools", uv: 2062, revenue: 900 },
      ],
      utm_content: [
        { name: "hero_cta", uv: 3210, revenue: 1800 },
        { name: "sidebar", uv: 1940, revenue: 700 },
        { name: "footer_link", uv: 880, revenue: 300 },
      ],
      utm_term: [
        { name: "self hosted analytics", uv: 2610, revenue: 1400 },
        { name: "privacy analytics", uv: 1720, revenue: 800 },
        { name: "plausible alternative", uv: 1130, revenue: 600 },
      ],
      ref: [
        { name: "producthunt", uv: 3391, revenue: 2100 },
        { name: "indiehackers", uv: 2313, revenue: 900 },
      ],
    });
    const referrers: SourceMetric[] = [
      {
        name: "https://www.google.com/",
        newVisitors: 9000,
        returningVisitors: 3000,
        channel: "Search",
        revenue: 2400,
      },
      {
        name: "Direct / None",
        newVisitors: 2500,
        returningVisitors: 6000,
        channel: "Direct / None",
        revenue: 5200,
      },
      {
        name: "https://github.com/",
        newVisitors: 3200,
        returningVisitors: 900,
        channel: "Referral",
        revenue: 900,
      },
      {
        name: "https://t.co/",
        newVisitors: 2600,
        returningVisitors: 600,
        channel: "Social",
        revenue: 3100,
      },
      {
        name: "https://www.linkedin.com/",
        newVisitors: 1100,
        returningVisitors: 400,
        channel: "Social",
        revenue: 400,
      },
    ];
    const channels: ChannelMetric[] = [
      {
        name: "Search",
        newVisitors: 9000,
        returningVisitors: 3000,
        revenue: 2400,
      },
      {
        name: "Direct / None",
        newVisitors: 2500,
        returningVisitors: 6000,
        revenue: 5200,
      },
      {
        name: "Social",
        newVisitors: 3700,
        returningVisitors: 1000,
        revenue: 3500,
      },
      {
        name: "Referral",
        newVisitors: 3200,
        returningVisitors: 900,
        revenue: 900,
      },
    ];
    return { referrers, channels, campaigns } as unknown as T;
  }

  if (path === "pages") {
    const pages: PageMetric[] = [
      {
        name: "https://tabsircg.com/",
        uv: 15000,
        pageviews: 22000,
        revenue: 3200,
      },
      {
        name: "https://tabsircg.com/about",
        uv: 8200,
        pageviews: 11000,
        revenue: 1800,
      },
      {
        name: "https://tabsircg.com/projects",
        uv: 4200,
        pageviews: 5500,
        revenue: 4600,
      },
      {
        name: "https://tabsircg.com/blog/my-first-post",
        uv: 3100,
        pageviews: 3800,
        revenue: 600,
      },
      {
        name: "https://tabsircg.com/contact",
        uv: 1500,
        pageviews: 1800,
        revenue: 5400,
      },
    ];
    const entryPages: EntryPageMetric[] = [
      { name: "https://tabsircg.com/", uv: 12000, revenue: 2600 },
      { name: "https://tabsircg.com/about", uv: 4100, revenue: 3400 },
      {
        name: "https://tabsircg.com/blog/my-first-post",
        uv: 2500,
        revenue: 800,
      },
    ];
    const hostnames: HostnameMetric[] = [
      { name: "tabsircg.com", uv: 32000, revenue: 18600 },
      { name: "admin.tabsircg.com", uv: 1200, revenue: 200 },
      { name: "localhost:3000", uv: 50, revenue: 0 },
    ];
    const exitLinks: ExitLinkMetric[] = [
      {
        name: "https://github.com/tabsircg",
        uv: 1800,
        exits: 1800,
        revenue: 400,
      },
      {
        name: "https://linkedin.com/in/tabsircg",
        uv: 1200,
        exits: 1200,
        revenue: 900,
      },
      {
        name: "https://twitter.com/tabsircg",
        uv: 900,
        exits: 900,
        revenue: 300,
      },
    ];
    return { pages, entryPages, hostnames, exitLinks } as unknown as T;
  }

  if (path === "system") {
    const browsers: SystemMetric[] = [
      { name: "Chrome", uv: 18500, revenue: 9200 },
      { name: "Safari", uv: 9200, revenue: 7600 },
      { name: "Firefox", uv: 3400, revenue: 1100 },
      { name: "Edge", uv: 2100, revenue: 1400 },
    ];
    const os: SystemMetric[] = [
      { name: "macOS", uv: 14500, revenue: 9800 },
      { name: "Windows", uv: 9800, revenue: 5200 },
      { name: "Linux", uv: 4200, revenue: 1300 },
      { name: "iOS", uv: 3100, revenue: 2600 },
      { name: "Android", uv: 1600, revenue: 900 },
    ];
    const devices: SystemMetric[] = [
      { name: "Desktop", uv: 28500, revenue: 16200 },
      { name: "Mobile", uv: 4700, revenue: 3800 },
      { name: "Tablet", uv: 900, revenue: 600 },
    ];
    return { browsers, os, devices } as unknown as T;
  }

  if (path === "events") {
    const goals: GoalMetric[] = [
      { name: "payment", uv: 850, total: 910, conversionRate: 0.02 },
      { name: "identify", uv: 1200, total: 1250, conversionRate: 0.028 },
      { name: "external_link", uv: 3200, total: 4100, conversionRate: 0.075 },
      {
        name: "signup_button_clicked",
        uv: 1500,
        total: 1800,
        conversionRate: 0.035,
      },
    ];
    return { goals, totalVisitors: 42500 } as unknown as T;
  }

  if (path === "bots") {
    const pointsCount =
      period === "today" || period === "yesterday"
        ? 24
        : period === "last7d"
          ? 7
          : 30;
    const step =
      period === "today" || period === "yesterday"
        ? 3600 * 1000
        : 24 * 3600 * 1000;
    const start = Date.now() - pointsCount * step;

    const bots: BotMetric[] = [
      { name: "ChatGPT-User", category: "answer_fetch", count: 747 },
      { name: "Gemini", category: "answer_fetch", count: 80 },
      { name: "Claude-User", category: "answer_fetch", count: 23 },
      { name: "PerplexityBot", category: "search_index", count: 412 },
      { name: "Googlebot", category: "search_index", count: 388 },
      { name: "Bingbot", category: "search_index", count: 151 },
      { name: "DuckDuckBot", category: "search_index", count: 9 },
      { name: "GPTBot", category: "training", count: 296 },
      { name: "ClaudeBot", category: "training", count: 142 },
      { name: "CCBot", category: "training", count: 70 },
      { name: "Bytespider", category: "training", count: 44 },
      { name: "Amazonbot", category: "ai_crawler", count: 63 },
      { name: "Applebot", category: "ai_crawler", count: 18 },
    ];

    const totals = new Map<BotCategory, number>();
    for (const b of bots) {
      totals.set(b.category, (totals.get(b.category) ?? 0) + b.count);
    }
    const categories: BotCategoryTotal[] = [...totals.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Spread a category's total across buckets with a spiky (low-biased) shape.
    const distribute = (total: number): number[] => {
      const weights = Array.from(
        { length: pointsCount },
        () => Math.random() ** 2,
      );
      const sum = weights.reduce((a, b) => a + b, 0) || 1;
      let acc = 0;
      return weights.map((w, i) => {
        if (i === pointsCount - 1) return Math.max(0, total - acc);
        const v = Math.round((total * w) / sum);
        acc += v;
        return v;
      });
    };
    const perCat = new Map<BotCategory, number[]>();
    for (const { category, count } of categories) {
      perCat.set(category, distribute(count));
    }

    const timeseries: BotTimeseriesPoint[] = [];
    for (let i = 0; i < pointsCount; i++) {
      const point: BotTimeseriesPoint = { timestamp: start + i * step };
      for (const { category } of categories) {
        point[category] = perCat.get(category)![i];
      }
      timeseries.push(point);
    }

    const total = bots.reduce((sum, b) => sum + b.count, 0);
    return { total, categories, timeseries, bots } as unknown as T;
  }

  if (path === "bots/pages") {
    const bot = extra?.bot || "Unknown";
    const training = /bot$|bytespider|ccbot/i.test(bot);
    const category: BotCategory = training ? "training" : "answer_fetch";
    // Vary counts per bot so different rows don't look identical.
    const seed = [...bot].reduce((a, c) => a + c.charCodeAt(0), 0);
    const scale = 0.4 + (seed % 7) / 4;
    const base: [string, number][] = [
      ["/", 589],
      ["/review", 43],
      ["/roadmap", 40],
      ["/?ref=indiepage", 28],
      ["/affiliates", 17],
      ["/tos", 13],
      ["/privacy-policy", 8],
      ["/course", 2],
      ["/?ref=trustmrr", 1],
      ["/?utm_campaign=how-i-would-learn-to-code", 1],
    ];
    const pages: BotPageMetric[] = base
      .map(([name, count]) => ({
        name,
        count: Math.max(1, Math.round(count * scale)),
      }))
      .sort((a, b) => b.count - a.count);
    const total = pages.reduce((sum, p) => sum + p.count, 0);
    return { bot, category, total, pages } as unknown as T;
  }

  if (path === "realtime") {
    return { count: Math.floor(15 + Math.random() * 40) } as unknown as T;
  }

  return null;
}
