import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import { queryTinybird, parseAnalyticsParams, periodToRange, partitionByLevel, F } from "@/lib/tinybird";
import type { SystemResponse } from "@/lib/analyticsTypes";

export const GET = wrapRoute<SystemResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const baseWhere = `
    ${F.websiteId} = '${params.websiteId}'
    AND ${F.type} = 'pageview'
    AND is_bot = 0
    AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
  `;

  const res = await queryTinybird<{
    level: "browsers" | "os" | "devices";
    name: string;
    uv: number;
  }>(`
    (
      SELECT 'browsers' as level, browser as name, COUNT(DISTINCT ${F.visitorId}) as uv
      FROM ${F.engine} WHERE ${baseWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 20
    )
    UNION ALL
    (
      SELECT 'os' as level, os as name, COUNT(DISTINCT ${F.visitorId}) as uv
      FROM ${F.engine} WHERE ${baseWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 20
    )
    UNION ALL
    (
      SELECT 'devices' as level, device as name, COUNT(DISTINCT ${F.visitorId}) as uv
      FROM ${F.engine} WHERE ${baseWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 20
    )
  `);

  const { browsers = [], os = [], devices = [] } = partitionByLevel(res.data);

  return { browsers, os, devices };
});
