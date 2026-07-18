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
} from "./types";

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
      const visitors = Math.floor(50 + Math.random() * 150);
      const pageviews = Math.floor(visitors * (1.2 + Math.random() * 0.8));
      const sessions = Math.floor(visitors * (0.8 + Math.random() * 0.2));
      timeseries.push({ timestamp: ts, visitors, pageviews, sessions });
    }

    const current: OverviewMetrics = {
      visitors: timeseries.reduce((sum, p) => sum + p.visitors, 0),
      pageviews: timeseries.reduce((sum, p) => sum + p.pageviews, 0),
      sessions: timeseries.reduce((sum, p) => sum + p.sessions, 0),
      bounceRate: 42.5,
      sessionDuration: 182,
    };

    const previous: OverviewMetrics = {
      visitors: Math.floor(current.visitors * 0.9),
      pageviews: Math.floor(current.pageviews * 0.88),
      sessions: Math.floor(current.sessions * 0.91),
      bounceRate: 45.2,
      sessionDuration: 165,
    };

    return { current, previous, timeseries } as unknown as T;
  }

  if (path === "locations") {
    const countries: LocationMetric[] = [
      { name: "United States", uv: 1420 },
      { name: "United Kingdom", uv: 850 },
      { name: "Germany", uv: 620 },
      { name: "Canada", uv: 410 },
      { name: "France", uv: 380 },
      { name: "India", uv: 320 },
      { name: "Australia", uv: 210 },
    ];

    const regions: LocationMetric[] = [
      { name: "California", uv: 520 },
      { name: "England", uv: 430 },
      { name: "Texas", uv: 380 },
      { name: "New York", uv: 310 },
      { name: "Ontario", uv: 290 },
      { name: "Île-de-France", uv: 210 },
      { name: "New South Wales", uv: 120 },
    ];

    const cities: LocationMetric[] = [
      { name: "London", uv: 320 },
      { name: "New York", uv: 290 },
      { name: "Los Angeles", uv: 210 },
      { name: "San Francisco", uv: 180 },
      { name: "Paris", uv: 170 },
      { name: "Toronto", uv: 150 },
      { name: "Sydney", uv: 90 },
    ];

    return { countries, regions, cities } as unknown as T;
  }

  if (path === "sources") {
    const referrers: SourceMetric[] = [
      { name: "Google", uv: 1200, channel: "Search" },
      { name: "Direct", uv: 850, channel: "Direct" },
      { name: "GitHub", uv: 410, channel: "Referral" },
      { name: "Twitter / X", uv: 320, channel: "Social" },
      { name: "LinkedIn", uv: 150, channel: "Social" },
    ];
    return { referrers } as unknown as T;
  }

  if (path === "pages") {
    const pages: PageMetric[] = [
      { name: "/", uv: 1500, pageviews: 2200 },
      { name: "/docs", uv: 820, pageviews: 1100 },
      { name: "/pricing", uv: 420, pageviews: 550 },
      { name: "/blog/post-1", uv: 310, pageviews: 380 },
      { name: "/about", uv: 150, pageviews: 180 },
    ];
    const entryPages: PageMetric[] = [
      { name: "/", uv: 1200, pageviews: 1200 },
      { name: "/docs", uv: 410, pageviews: 410 },
      { name: "/blog/post-1", uv: 250, pageviews: 250 },
    ];
    return { pages, entryPages } as unknown as T;
  }

  if (path === "system") {
    const browsers: SystemMetric[] = [
      { name: "Chrome", uv: 1850 },
      { name: "Safari", uv: 920 },
      { name: "Firefox", uv: 340 },
      { name: "Edge", uv: 210 },
    ];
    const os: SystemMetric[] = [
      { name: "macOS", uv: 1450 },
      { name: "Windows", uv: 980 },
      { name: "Linux", uv: 420 },
      { name: "iOS", uv: 310 },
      { name: "Android", uv: 160 },
    ];
    const devices: SystemMetric[] = [
      { name: "Desktop", uv: 2850 },
      { name: "Mobile", uv: 470 },
      { name: "Tablet", uv: 90 },
    ];
    return { browsers, os, devices } as unknown as T;
  }

  if (path === "exit-links") {
    const exitLinks: ExitLinkMetric[] = [
      { name: "github.com/personal", uv: 180, exits: 180 },
      { name: "twitter.com/personal", uv: 120, exits: 120 },
      { name: "stripe.com", uv: 90, exits: 90 },
    ];
    return exitLinks as unknown as T;
  }

  if (path === "hostnames") {
    const hostnames: HostnameMetric[] = [
      { name: "localhost:3000", uv: 120 },
      { name: "admin.personal.co", uv: 3200 },
    ];
    return hostnames as unknown as T;
  }

  if (path === "realtime") {
    return { count: Math.floor(5 + Math.random() * 15) } as unknown as T;
  }

  return null;
}
