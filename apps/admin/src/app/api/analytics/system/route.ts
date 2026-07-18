import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import { queryAE, parseAnalyticsParams, periodToRange, partitionByLevel, F } from "@/lib/analyticsEngine";
import type { SystemResponse } from "@/lib/analyticsTypes";

export const GET = wrapRoute<SystemResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const baseWhere = `
    ${F.websiteId} = '${params.websiteId}'
    AND ${F.type} = 'pageview'
    AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
  `;

  const res = await queryAE<{
    level: "browsers" | "os" | "devices";
    name: string;
    uv: number;
  }>(`
    (
      SELECT 'browsers' as level,
        multiIf(
          ${F.userAgent} LIKE '%Firefox%', 'Firefox',
          ${F.userAgent} LIKE '%Edg%', 'Edge',
          ${F.userAgent} LIKE '%OPR%' OR ${F.userAgent} LIKE '%Opera%', 'Opera',
          ${F.userAgent} LIKE '%Brave%', 'Brave',
          ${F.userAgent} LIKE '%SamsungBrowser%', 'Samsung Internet',
          ${F.userAgent} LIKE '%DuckDuckGo%', 'DuckDuckGo',
          ${F.userAgent} LIKE '%Chrome%', 'Chrome',
          ${F.userAgent} LIKE '%Safari%', 'Safari',
          'Other'
        ) as name,
        COUNT(DISTINCT ${F.visitorId}) as uv
      FROM ${F.engine} WHERE ${baseWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 20
    )
    UNION ALL
    (
      SELECT 'os' as level,
        multiIf(
          ${F.userAgent} LIKE '%Windows%', 'Windows',
          ${F.userAgent} LIKE '%Mac OS X%' OR ${F.userAgent} LIKE '%Macintosh%', 'macOS',
          ${F.userAgent} LIKE '%Android%', 'Android',
          ${F.userAgent} LIKE '%iPhone%' OR ${F.userAgent} LIKE '%iPad%', 'iOS',
          ${F.userAgent} LIKE '%CrOS%', 'Chrome OS',
          ${F.userAgent} LIKE '%Linux%', 'Linux',
          'Other'
        ) as name,
        COUNT(DISTINCT ${F.visitorId}) as uv
      FROM ${F.engine} WHERE ${baseWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 20
    )
    UNION ALL
    (
      SELECT 'devices' as level,
        multiIf(
          ${F.userAgent} LIKE '%Mobile%' OR ${F.userAgent} LIKE '%Android%' OR ${F.userAgent} LIKE '%iPhone%', 'Mobile',
          ${F.userAgent} LIKE '%iPad%' OR ${F.userAgent} LIKE '%Tablet%', 'Tablet',
          'Desktop'
        ) as name,
        COUNT(DISTINCT ${F.visitorId}) as uv
      FROM ${F.engine} WHERE ${baseWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 20
    )
  `);

  const { browsers = [], os = [], devices = [] } = partitionByLevel(res.data);

  return { browsers, os, devices };
});
