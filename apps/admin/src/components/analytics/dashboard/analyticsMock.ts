import type {
  OverviewMetrics,
  TimeseriesPoint,
  SourceMetric,
  PageMetric,
  LocationMetric,
  SystemMetric,
  ExitLinkMetric,
  HostnameMetric,
  Period,
} from "@/lib/analyticsTypes";

interface GoalMetric {
  name: string;
  uv: number;
  total: number;
  conversionRate: number;
}

export async function mockFetchEndpoint<T>(
  path: string,
  period: Period,
): Promise<T | null> {
  // Simulate network delay for realistic feel
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (path === "main") {
    const now = Date.now();
    const pointsCount = period === "today" || period === "yesterday" ? 24 : period === "last7d" ? 7 : 30;
    const step = (period === "today" || period === "yesterday" ? 3600 * 1000 : 24 * 3600 * 1000);
    const start = now - pointsCount * step;

    const timeseries: TimeseriesPoint[] = [];
    for (let i = 0; i < pointsCount; i++) {
      const ts = start + i * step;
      const visitors = Math.floor(500 + Math.random() * 1500);
      const pageviews = Math.floor(visitors * (1.2 + Math.random() * 0.8));
      const sessions = Math.floor(visitors * (0.8 + Math.random() * 0.2));
      timeseries.push({ timestamp: ts, visitors, pageviews, sessions });
    }

    const current: OverviewMetrics = {
      visitors: timeseries.reduce((sum, p) => sum + p.visitors, 0),
      pageviews: timeseries.reduce((sum, p) => sum + p.pageviews, 0),
      sessions: timeseries.reduce((sum, p) => sum + p.sessions, 0),
      bounceRate: 0.425,
      sessionDuration: 182,
    };

    const previous: OverviewMetrics = {
      visitors: Math.floor(current.visitors * 0.9),
      pageviews: Math.floor(current.pageviews * 0.88),
      sessions: Math.floor(current.sessions * 0.91),
      bounceRate: 0.452,
      sessionDuration: 165,
    };

    return { current, previous, timeseries } as unknown as T;
  }

  if (path === "locations") {
    const countries: LocationMetric[] = [
      { name: "US", uv: 14200, country: "US" },
      { name: "GB", uv: 8500, country: "GB" },
      { name: "DE", uv: 6200, country: "DE" },
      { name: "CA", uv: 4100, country: "CA" },
      { name: "FR", uv: 3800, country: "FR" },
      { name: "IN", uv: 3200, country: "IN" },
      { name: "AU", uv: 2100, country: "AU" },
    ];

    const regions: LocationMetric[] = [
      { name: "California", uv: 5200, country: "US" },
      { name: "England", uv: 4300, country: "GB" },
      { name: "Texas", uv: 3800, country: "US" },
      { name: "New York", uv: 3100, country: "US" },
      { name: "Ontario", uv: 2900, country: "CA" },
      { name: "Île-de-France", uv: 2100, country: "FR" },
      { name: "New South Wales", uv: 1200, country: "AU" },
    ];

    const cities: LocationMetric[] = [
      { name: "London", uv: 3200, country: "GB" },
      { name: "New York", uv: 2900, country: "US" },
      { name: "Los Angeles", uv: 2100, country: "US" },
      { name: "San Francisco", uv: 1800, country: "US" },
      { name: "Paris", uv: 1700, country: "FR" },
      { name: "Toronto", uv: 1500, country: "CA" },
      { name: "Sydney", uv: 900, country: "AU" },
    ];

    return { countries, regions, cities } as unknown as T;
  }

  if (path === "sources") {
    const referrers: SourceMetric[] = [
      { name: "https://www.google.com/", uv: 12000, channel: "Search" },
      { name: "Direct / None", uv: 8500, channel: "Direct / None" },
      { name: "https://github.com/", uv: 4100, channel: "Referral" },
      { name: "https://t.co/", uv: 3200, channel: "Social" },
      { name: "https://www.linkedin.com/", uv: 1500, channel: "Social" },
    ];
    const channels = [
      { name: "Search", uv: 12000 },
      { name: "Direct / None", uv: 8500 },
      { name: "Social", uv: 4700 },
      { name: "Referral", uv: 4100 },
    ];
    return { referrers, channels } as unknown as T;
  }

  if (path === "pages") {
    const pages: PageMetric[] = [
      { name: "https://tabsircg.com/", uv: 15000, pageviews: 22000 },
      { name: "https://tabsircg.com/about", uv: 8200, pageviews: 11000 },
      { name: "https://tabsircg.com/projects", uv: 4200, pageviews: 5500 },
      { name: "https://tabsircg.com/blog/my-first-post", uv: 3100, pageviews: 3800 },
      { name: "https://tabsircg.com/contact", uv: 1500, pageviews: 1800 },
    ];
    const entryPages: PageMetric[] = [
      { name: "https://tabsircg.com/", uv: 12000, pageviews: 12000 },
      { name: "https://tabsircg.com/about", uv: 4100, pageviews: 4100 },
      { name: "https://tabsircg.com/blog/my-first-post", uv: 2500, pageviews: 2500 },
    ];
    const hostnames: HostnameMetric[] = [
      { name: "tabsircg.com", uv: 32000 },
      { name: "admin.tabsircg.com", uv: 1200 },
      { name: "localhost:3000", uv: 50 },
    ];
    const exitLinks: ExitLinkMetric[] = [
      { name: "https://github.com/tabsircg", uv: 1800, exits: 1800 },
      { name: "https://linkedin.com/in/tabsircg", uv: 1200, exits: 1200 },
      { name: "https://twitter.com/tabsircg", uv: 900, exits: 900 },
    ];
    return { pages, entryPages, hostnames, exitLinks } as unknown as T;
  }

  if (path === "system") {
    const browsers: SystemMetric[] = [
      { name: "Chrome", uv: 18500 },
      { name: "Safari", uv: 9200 },
      { name: "Firefox", uv: 3400 },
      { name: "Edge", uv: 2100 },
    ];
    const os: SystemMetric[] = [
      { name: "macOS", uv: 14500 },
      { name: "Windows", uv: 9800 },
      { name: "Linux", uv: 4200 },
      { name: "iOS", uv: 3100 },
      { name: "Android", uv: 1600 },
    ];
    const devices: SystemMetric[] = [
      { name: "Desktop", uv: 28500 },
      { name: "Mobile", uv: 4700 },
      { name: "Tablet", uv: 900 },
    ];
    return { browsers, os, devices } as unknown as T;
  }


  if (path === "events") {
    const goals: GoalMetric[] = [
      { name: "payment", uv: 850, total: 910, conversionRate: 0.02 },
      { name: "identify", uv: 1200, total: 1250, conversionRate: 0.028 },
      { name: "external_link", uv: 3200, total: 4100, conversionRate: 0.075 },
      { name: "signup_button_clicked", uv: 1500, total: 1800, conversionRate: 0.035 },
    ];
    return { goals, totalVisitors: 42500 } as unknown as T;
  }

  if (path === "realtime") {
    return { count: Math.floor(15 + Math.random() * 40) } as unknown as T;
  }

  return null;
}
