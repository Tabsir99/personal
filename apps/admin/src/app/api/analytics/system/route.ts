import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import { F, queryAE, parseAnalyticsParams, periodToRange } from "@/lib/analyticsEngine";

interface SystemMetric {
  name: string;
  uv: number;
}

interface SystemResponse {
  browsers: SystemMetric[];
  os: SystemMetric[];
  devices: SystemMetric[];
}

function parseBrowser(ua: string): string {
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Brave")) return "Brave";
  if (ua.includes("SamsungBrowser")) return "Samsung Internet";
  if (ua.includes("DuckDuckGo")) return "DuckDuckGo";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Other";
}

function parseOS(ua: string): string {
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS X") || ua.includes("Macintosh")) return "macOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("CrOS")) return "Chrome OS";
  return "Other";
}

function parseDevice(ua: string): string {
  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone"))
    return "Mobile";
  if (ua.includes("iPad") || ua.includes("Tablet")) return "Tablet";
  return "Desktop";
}

export const GET = wrapRoute<SystemResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const res = await queryAE<{ ua: string; vid: string }>(`
    SELECT ${F.userAgent} as ua, ${F.visitorId} as vid
    FROM cgd
    WHERE index1 = '${params.websiteId}'
      AND ${F.type} = 'pageview'
      AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
    GROUP BY vid, ua
  `);

  const browserMap = new Map<string, Set<string>>();
  const osMap = new Map<string, Set<string>>();
  const deviceMap = new Map<string, Set<string>>();

  for (const row of res.data) {
    const ua = String(row.ua);
    const vid = String(row.vid);

    const browser = parseBrowser(ua);
    if (!browserMap.has(browser)) browserMap.set(browser, new Set());
    browserMap.get(browser)!.add(vid);

    const os = parseOS(ua);
    if (!osMap.has(os)) osMap.set(os, new Set());
    osMap.get(os)!.add(vid);

    const device = parseDevice(ua);
    if (!deviceMap.has(device)) deviceMap.set(device, new Set());
    deviceMap.get(device)!.add(vid);
  }

  const toSorted = (map: Map<string, Set<string>>) =>
    [...map.entries()]
      .map(([name, vids]) => ({ name, uv: vids.size }))
      .sort((a, b) => b.uv - a.uv);

  return {
    browsers: toSorted(browserMap),
    os: toSorted(osMap),
    devices: toSorted(deviceMap),
  };
});
