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
  JourneyEntry,
  JourneyVisitor,
  JourneyResponse,
} from "@/lib/analyticsTypes";
import { rollupCampaigns } from "@/lib/analyticsTypes";
import { formatCountryName } from "@/lib/countryUtils";

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

  if (path === "goals") {
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
    const totalVisitors = 7500;

    const GOAL_DEFS: [string, number][] = [
      ["scroll_to_problem", 6300],
      ["scroll_to_solution", 4300],
      ["scroll_to_jainil_review", 3400],
      ["scroll_to_pricing", 3300],
      ["scroll_to_what_you_will_get", 3000],
      ["scroll_to_adsy_review", 2600],
      ["scroll_to_matthieu_review", 2300],
      ["scroll_to_andrei_review", 1900],
      ["scroll_to_faq", 1700],
      ["scroll_to_is_this_possible", 1600],
      ["scroll_to_story", 1300],
      ["clicked_pricing_cta", 1100],
      ["signup_button_clicked", 900],
      ["clicked_get_started", 720],
      ["newsletter_signup", 540],
      ["clicked_demo_video", 410],
    ];

    const shape = Array.from({ length: pointsCount }, (_, i) => {
      const x = pointsCount <= 1 ? 0 : i / (pointsCount - 1);
      return Math.max(
        0.08,
        0.55 +
          0.32 * Math.sin(x * Math.PI * 3 + 0.7) +
          0.15 * Math.sin(x * Math.PI * 6.3 + 1.1),
      );
    });
    const shapeSum = shape.reduce((a, b) => a + b, 0) || 1;

    const series: ({ timestamp: number } & Record<string, number>)[] =
      Array.from({ length: pointsCount }, (_, i) => ({
        timestamp: start + i * step,
      }));

    const goals: GoalMetric[] = [];
    for (const [name, target] of GOAL_DEFS) {
      let acc = 0;
      for (let i = 0; i < pointsCount; i++) {
        const noise = 0.82 + Math.random() * 0.36;
        const v = Math.max(
          0,
          Math.round(target * (shape[i] / shapeSum) * noise),
        );
        series[i][name] = v;
        acc += v;
      }
      const total = Math.round(acc * (1.05 + Math.random() * 0.12));
      goals.push({
        name,
        uv: acc,
        total,
        conversionRate: Math.min(1, acc / totalVisitors),
      });
    }
    goals.sort((a, b) => b.uv - a.uv);

    return { goals, series, totalVisitors } as unknown as T;
  }

  if (path === "funnels" || path === "funnel") {
    const steps = [
      {
        id: "fs1",
        name: "👋 Visit landing page",
        type: "pageview",
        url: "/",
        urlMatchType: "equals",
        goalCompletionType: "completed",
      },
      {
        id: "fs2",
        name: "🔽 Problem",
        type: "goal",
        goalName: "scroll_to_problem",
        goalCompletionType: "completed",
      },
      {
        id: "fs3",
        name: "🔽 Solution",
        type: "goal",
        goalName: "scroll_to_solution",
        goalCompletionType: "completed",
      },
      {
        id: "fs4",
        name: "🔽 What You Will Get",
        type: "goal",
        goalName: "scroll_to_what_you_will_get",
        goalCompletionType: "completed",
      },
      {
        id: "fs5",
        name: "🔽 Is This Possible",
        type: "goal",
        goalName: "scroll_to_is_this_possible",
        goalCompletionType: "completed",
      },
      {
        id: "fs6",
        name: "🔽 Story",
        type: "goal",
        goalName: "scroll_to_story",
        goalCompletionType: "completed",
      },
      {
        id: "fs7",
        name: "🔽 Pricing",
        type: "goal",
        goalName: "scroll_to_pricing",
        goalCompletionType: "completed",
      },
    ];
    const funnel = {
      id: "mock-funnel-lp-scroll",
      websiteId: "mock",
      name: "📜 LP Scroll",
      slug: "-lp-scroll",
      steps,
      isActive: true,
      createdAt: "2025-09-01T10:26:37.942Z",
      updatedAt: "2025-09-01T10:39:14.694Z",
    };
    if (path === "funnels") return { funnels: [funnel] } as unknown as T;

    const values = [7419, 4655, 3153, 2155, 992, 563, 430];
    const revenues = [6292, 4589, 4251, 3276, 2769, 2600, 2600];
    const total = values[0];
    const round1 = (n: number) => Math.round(n * 10) / 10;
    const flag = (cc: string) =>
      `https://purecatamphetamine.github.io/country-flag-icons/3x2/${cc}.svg`;
    const refTpl: [string, number, string][] = [
      ["marclou.com", 0.25, "https://icons.duckduckgo.com/ip3/marclou.com.ico"],
      [
        "trustmrr.com",
        0.2,
        "https://icons.duckduckgo.com/ip3/trustmrr.com.ico",
      ],
      ["X", 0.13, "https://icons.duckduckgo.com/ip3/x.com.ico"],
    ];
    const countryTpl: [string, string, number][] = [
      ["US", "United States", 0.18],
      ["FR", "France", 0.1],
      ["DE", "Germany", 0.05],
    ];

    const data = values.map((value, i) => ({
      id: `step${i + 1}`,
      label: `Step ${i + 1}`,
      value,
      revenue: revenues[i],
      stepIndex: i,
      stepType: steps[i].type,
      conversionRate: round1((value / total) * 100),
      dropoffFromPrevious:
        i === 0 ? 0 : round1(((values[i - 1] - value) / values[i - 1]) * 100),
      topReferrers: refTpl.map(([referrer, pct, imageUrl]) => ({
        referrer,
        imageUrl,
        visitors: Math.round(value * pct),
        percentage: Math.round(pct * 100),
      })),
      topCountries: countryTpl.map(([countryCode, countryName, pct]) => ({
        countryCode,
        countryName,
        imageUrl: flag(countryCode),
        visitors: Math.round(value * pct),
        percentage: round1(pct * 100),
      })),
    }));

    return {
      funnel,
      data,
      metrics: {
        totalVisitors: total,
        completions: values[values.length - 1],
        overallConversionRate: round1(
          (values[values.length - 1] / total) * 100,
        ),
        overallRevenuePerVisitor: 0.35,
        period,
        timezone: "Europe/Paris",
        lastUpdated: new Date().toISOString(),
      },
    } as unknown as T;
  }

  if (path === "journey") {
    return mockJourney(extra) as unknown as T;
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

interface MockPerson {
  first: string;
  last: string;
  country: string;
  city: string;
  device: string;
  os: string;
  browser: string;
  width: number;
  height: number;
}

const MOCK_PEOPLE: MockPerson[] = [
  {
    first: "Alejandra",
    last: "Ruiz",
    country: "ES",
    city: "Parla",
    device: "mobile",
    os: "iOS",
    browser: "Mobile Safari",
    width: 393,
    height: 695,
  },
  {
    first: "Mykolas",
    last: "Petrauskas",
    country: "LT",
    city: "Vilnius",
    device: "mobile",
    os: "iOS",
    browser: "GSA",
    width: 390,
    height: 844,
  },
  {
    first: "Fadi",
    last: "Haddad",
    country: "US",
    city: "Austin",
    device: "mobile",
    os: "iOS",
    browser: "Mobile Safari",
    width: 428,
    height: 926,
  },
  {
    first: "Dorthe",
    last: "Nilsen",
    country: "NO",
    city: "Bergen",
    device: "desktop",
    os: "macOS",
    browser: "Opera",
    width: 1512,
    height: 982,
  },
  {
    first: "Johan",
    last: "Bakker",
    country: "US",
    city: "Seattle",
    device: "mobile",
    os: "iOS",
    browser: "Mobile Safari",
    width: 393,
    height: 852,
  },
  {
    first: "Priya",
    last: "Nair",
    country: "IN",
    city: "Bengaluru",
    device: "desktop",
    os: "Windows",
    browser: "Chrome",
    width: 1920,
    height: 1080,
  },
  {
    first: "Tomás",
    last: "Ferreira",
    country: "BR",
    city: "São Paulo",
    device: "mobile",
    os: "Android",
    browser: "Chrome",
    width: 412,
    height: 915,
  },
  {
    first: "Anke",
    last: "Schneider",
    country: "DE",
    city: "Leipzig",
    device: "desktop",
    os: "macOS",
    browser: "Safari",
    width: 1440,
    height: 900,
  },
  {
    first: "Yuki",
    last: "Tanaka",
    country: "JP",
    city: "Osaka",
    device: "tablet",
    os: "iPadOS",
    browser: "Mobile Safari",
    width: 1024,
    height: 1366,
  },
  {
    first: "Marc",
    last: "Lemoine",
    country: "FR",
    city: "Lyon",
    device: "desktop",
    os: "Linux",
    browser: "Firefox",
    width: 1680,
    height: 1050,
  },
  {
    first: "Sofia",
    last: "Rossi",
    country: "IT",
    city: "Bologna",
    device: "mobile",
    os: "iOS",
    browser: "Mobile Safari",
    width: 390,
    height: 844,
  },
  {
    first: "Liam",
    last: "O'Connor",
    country: "IE",
    city: "Cork",
    device: "desktop",
    os: "Windows",
    browser: "Edge",
    width: 1536,
    height: 864,
  },
  {
    first: "Nadia",
    last: "Haqq",
    country: "AE",
    city: "Dubai",
    device: "mobile",
    os: "Android",
    browser: "Samsung Internet",
    width: 384,
    height: 854,
  },
  {
    first: "Kwame",
    last: "Mensah",
    country: "GH",
    city: "Accra",
    device: "mobile",
    os: "Android",
    browser: "Chrome",
    width: 360,
    height: 800,
  },
  {
    first: "Elena",
    last: "Volkova",
    country: "PL",
    city: "Kraków",
    device: "desktop",
    os: "Windows",
    browser: "Chrome",
    width: 1920,
    height: 1080,
  },
  {
    first: "Diego",
    last: "Morales",
    country: "MX",
    city: "Guadalajara",
    device: "mobile",
    os: "iOS",
    browser: "Mobile Safari",
    width: 375,
    height: 812,
  },
  {
    first: "Ingrid",
    last: "Larsen",
    country: "SE",
    city: "Malmö",
    device: "desktop",
    os: "macOS",
    browser: "Chrome",
    width: 1728,
    height: 1117,
  },
  {
    first: "Hassan",
    last: "Karim",
    country: "PK",
    city: "Lahore",
    device: "mobile",
    os: "Android",
    browser: "Chrome",
    width: 393,
    height: 873,
  },
  {
    first: "Chloe",
    last: "Dubois",
    country: "CA",
    city: "Montréal",
    device: "desktop",
    os: "macOS",
    browser: "Safari",
    width: 1512,
    height: 982,
  },
  {
    first: "Ravi",
    last: "Deshmukh",
    country: "IN",
    city: "Pune",
    device: "desktop",
    os: "Linux",
    browser: "Chrome",
    width: 1600,
    height: 900,
  },
  {
    first: "Amara",
    last: "Okafor",
    country: "NG",
    city: "Lagos",
    device: "mobile",
    os: "Android",
    browser: "Opera",
    width: 360,
    height: 780,
  },
  {
    first: "Jonas",
    last: "Weber",
    country: "AT",
    city: "Graz",
    device: "desktop",
    os: "Windows",
    browser: "Firefox",
    width: 1920,
    height: 1200,
  },
  {
    first: "Mei",
    last: "Lin",
    country: "SG",
    city: "Singapore",
    device: "mobile",
    os: "iOS",
    browser: "Mobile Safari",
    width: 390,
    height: 844,
  },
  {
    first: "Oliver",
    last: "Brandt",
    country: "GB",
    city: "Bristol",
    device: "desktop",
    os: "macOS",
    browser: "Arc",
    width: 1512,
    height: 945,
  },
  {
    first: "Zeynep",
    last: "Aydın",
    country: "TR",
    city: "İzmir",
    device: "mobile",
    os: "Android",
    browser: "Chrome",
    width: 412,
    height: 892,
  },
  {
    first: "Lucas",
    last: "Silva",
    country: "PT",
    city: "Porto",
    device: "desktop",
    os: "Windows",
    browser: "Chrome",
    width: 1366,
    height: 768,
  },
  {
    first: "Hana",
    last: "Kim",
    country: "KR",
    city: "Busan",
    device: "mobile",
    os: "Android",
    browser: "Samsung Internet",
    width: 384,
    height: 854,
  },
  {
    first: "Noah",
    last: "Fischer",
    country: "CH",
    city: "Bern",
    device: "desktop",
    os: "macOS",
    browser: "Safari",
    width: 1440,
    height: 900,
  },
  {
    first: "Isabel",
    last: "Castro",
    country: "CL",
    city: "Valparaíso",
    device: "mobile",
    os: "iOS",
    browser: "Mobile Safari",
    width: 375,
    height: 667,
  },
  {
    first: "Emil",
    last: "Sørensen",
    country: "DK",
    city: "Aarhus",
    device: "desktop",
    os: "Linux",
    browser: "Firefox",
    width: 1920,
    height: 1080,
  },
  {
    first: "Farida",
    last: "Zayed",
    country: "EG",
    city: "Alexandria",
    device: "mobile",
    os: "Android",
    browser: "Chrome",
    width: 393,
    height: 851,
  },
  {
    first: "Peter",
    last: "Novak",
    country: "CZ",
    city: "Brno",
    device: "desktop",
    os: "Windows",
    browser: "Edge",
    width: 1600,
    height: 900,
  },
  {
    first: "Aroha",
    last: "Ngata",
    country: "NZ",
    city: "Wellington",
    device: "tablet",
    os: "iPadOS",
    browser: "Mobile Safari",
    width: 834,
    height: 1194,
  },
  {
    first: "Sven",
    last: "Janssen",
    country: "NL",
    city: "Utrecht",
    device: "desktop",
    os: "macOS",
    browser: "Chrome",
    width: 1728,
    height: 1117,
  },
  {
    first: "Camila",
    last: "Reyes",
    country: "AR",
    city: "Rosario",
    device: "mobile",
    os: "Android",
    browser: "Chrome",
    width: 360,
    height: 800,
  },
  {
    first: "Arthur",
    last: "Blake",
    country: "AU",
    city: "Adelaide",
    device: "desktop",
    os: "Windows",
    browser: "Chrome",
    width: 2560,
    height: 1440,
  },
];

const MOCK_SOURCES = [
  {
    domain: "www.google.com",
    channel: "Search",
    referrer: "https://www.google.com/",
    params: {},
  },
  { domain: "", channel: "Direct / None", referrer: "", params: {} },
  {
    domain: "marclou.com",
    channel: "Referral",
    referrer: "https://marclou.com/blog/ship-fast",
    params: {},
  },
  {
    domain: "t.co",
    channel: "Social",
    referrer: "https://t.co/",
    params: {
      utm_source: "twitter",
      utm_medium: "paid_social",
      utm_campaign: "launch_2026",
    },
  },
  {
    domain: "www.producthunt.com",
    channel: "Referral",
    referrer: "https://www.producthunt.com/posts/tabsir",
    params: { ref: "producthunt" },
  },
  {
    domain: "news.ycombinator.com",
    channel: "Referral",
    referrer: "https://news.ycombinator.com/item?id=41231",
    params: {},
  },
  {
    domain: "",
    channel: "Email",
    referrer: "",
    params: {
      utm_source: "newsletter",
      utm_medium: "email",
      utm_campaign: "weekly_digest",
    },
  },
];

const MOCK_PATHS = [
  "/",
  "/pricing",
  "/features",
  "/blog/ship-fast",
  "/docs/quickstart",
  "/changelog",
];

const MOCK_EVENT_NAMES = [
  "scroll_to_problem",
  "scroll_to_solution",
  "scroll_to_pricing",
  "scroll_to_story",
  "scroll_to_faq",
  "clicked_pricing_cta",
  "newsletter_signup",
  "clicked_demo_video",
];

const MOCK_AMOUNTS = [169, 299, 169, 89, 169, 499, 299, 169];

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

function seededRandom(seed: number): () => number {
  let state = seed + 0x6d2b79f5;
  return () => {
    state = Math.imul(state ^ (state >>> 15), state | 1);
    state ^= state + Math.imul(state ^ (state >>> 7), state | 61);
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMockVisitor(index: number, paying: boolean, now: number) {
  const rng = seededRandom(index * 977);
  const person = MOCK_PEOPLE[index % MOCK_PEOPLE.length];
  const source = MOCK_SOURCES[Math.floor(rng() * MOCK_SOURCES.length)];
  const amount = paying ? MOCK_AMOUNTS[index % MOCK_AMOUNTS.length] : 0;

  const daysSinceFinished = [0.01, 0.09, 0.4, 1.1, 2.6, 5.3, 9.2, 16, 24, 41][
    index % 10
  ];
  const finishedAt = Math.round(
    now - daysSinceFinished * DAY - rng() * 5 * HOUR,
  );

  const spanDays = [0.002, 0.02, 0.9, 2.1, 14, 47, 96, 160][index % 8];
  const firstTouch = Math.round(finishedAt - spanDays * DAY);

  const entries: JourneyEntry[] = [
    {
      timestamp: firstTouch,
      eventType: "referral",
      isGoal: false,
      data: {
        domainName: source.domain,
        channel: source.channel,
        fullReferrer: source.referrer,
        trackingParams: Object.entries(source.params).map(([type, value]) => ({
          type,
          value,
        })),
      },
    },
  ];

  const stepCount = 4 + Math.floor(rng() * 6);
  const stride = Math.max(
    HOUR / 60,
    ((finishedAt - firstTouch) * 0.92) / stepCount,
  );
  let cursor = firstTouch;
  let pageviews = 0;

  for (let step = 0; step < stepCount; step++) {
    if (rng() < 0.45 || step === 0) {
      const repeats = rng() < 0.25 ? 2 + Math.floor(rng() * 2) : 1;
      const last = cursor + (repeats - 1) * Math.round(stride * 0.2);
      entries.push({
        timestamp: cursor,
        eventType: "pageview",
        isGoal: false,
        data: {
          path:
            step === 0
              ? "/"
              : MOCK_PATHS[Math.floor(rng() * MOCK_PATHS.length)],
          hostname: "tabsir.dev",
          count: repeats,
        },
        lastTimestamp: last,
      });
      pageviews += repeats;
      cursor = last;
    } else {
      const eventName =
        MOCK_EVENT_NAMES[Math.floor(rng() * MOCK_EVENT_NAMES.length)];
      entries.push({
        timestamp: cursor,
        eventType: "custom",
        isGoal: false,
        data: {
          eventName,
          metadata: {
            scroll_percentage: Math.round(rng() * 100),
            threshold: 0.5,
            delay: Math.round(rng() * 2000),
          },
        },
      });
    }
    cursor += Math.round(stride * (0.4 + rng()));
  }

  const goalCompletedAt = paying ? finishedAt : null;

  if (paying && goalCompletedAt !== null) {
    entries.push({
      timestamp: goalCompletedAt,
      eventType: "payment",
      isGoal: true,
      data: { amount },
    });
  }

  const lastSeenAt = entries[entries.length - 1].timestamp;
  const transactionId = `pi_3Q${(index * 7919).toString(36).toUpperCase()}`;
  const surname =
    MOCK_PEOPLE[(index * 7 + 3) % MOCK_PEOPLE.length]?.last ?? person.last;
  const fullName = `${person.first} ${surname}`;
  const email = `${person.first}.${surname}`
    .toLowerCase()
    .replace(/[^a-z.]/g, "")
    .concat("@example.com");

  return {
    visitorId: `v_${(index * 6151 + 104729).toString(36)}`,
    customerName: paying ? fullName : "",
    customerEmail: paying ? email : "",
    profileMetadata: paying
      ? {
          stripe_event_id: `evt_${transactionId.slice(3)}`,
          kind: "charge",
          customer_name: fullName,
          customer_email: email,
          customer_id: `cus_${(index * 5147).toString(36).toUpperCase()}`,
          transaction_id: transactionId,
        }
      : {},
    amount,
    channel: source.channel,
    sourceAttribution: {
      timestamp: firstTouch,
      referrer: source.referrer,
      params: {
        utm_source: "",
        utm_medium: "",
        utm_campaign: "",
        utm_content: "",
        utm_term: "",
        ref: "",
        ...source.params,
      },
    },
    countryCode: person.country,
    countryName: formatCountryName(person.country),
    cityName: person.city,
    browserName: person.browser,
    osName: person.os,
    deviceType: person.device,
    viewport: { width: person.width, height: person.height },
    pageviews,
    timeBeforeGoal:
      goalCompletedAt === null ? null : goalCompletedAt - firstTouch,
    goalCompletedAt,
    lastSeenAt,
    completeJourney: entries,
    truncated: false,
  } satisfies JourneyVisitor;
}

function mockJourney(extra?: Record<string, string>): JourneyResponse {
  const goal = extra?.goal ?? "payment";
  const skip = Number(extra?.skip ?? "0");
  const limit = Number(extra?.limit ?? "10");
  const search = (extra?.search ?? "").trim().toLowerCase();

  const now = Date.now();
  const paying = goal !== "all";
  const population = paying ? 29 : 214;

  const all = Array.from({ length: population }, (_, i) =>
    buildMockVisitor(i, paying || i % 4 === 0, now),
  ).sort(
    (a, b) =>
      (b.goalCompletedAt ?? b.lastSeenAt) - (a.goalCompletedAt ?? a.lastSeenAt),
  );

  const matched = search
    ? all.filter((v) =>
        JSON.stringify(v.profileMetadata).toLowerCase().includes(search),
      )
    : all;

  const visitors = matched.slice(skip, skip + limit);

  return {
    goal,
    visitors,
    uv: matched.length,
    pagination: {
      limit,
      skip,
      totalCount: matched.length,
      hasMore: skip + visitors.length < matched.length,
    },
  };
}
