import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import {
  queryAE,
  parseAnalyticsParams,
  periodToRange,
  partitionByLevel,
  F,
} from "@/lib/analyticsEngine";
import type { PagesResponse } from "@/lib/analyticsTypes";

export const GET = wrapRoute<PagesResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const pageviewWhere = `
    ${F.websiteId} = '${params.websiteId}'
    AND ${F.type} = 'pageview'
    AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
  `;

  const exitWhere = `
    ${F.websiteId} = '${params.websiteId}'
    AND ${F.type} = 'external_link'
    AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
  `;

  const res = await queryAE<{
    level: "pages" | "entryPages" | "hostnames" | "exitLinks";
    name: string;
    uv: number;
    pageviews: number;
    exits: number;
  }>(`
    (
      SELECT 'pages' as level, ${F.href} as name, COUNT(DISTINCT ${F.visitorId}) as uv, COUNT() as pageviews, 0 as exits
      FROM ${F.engine} WHERE ${pageviewWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 50
    )
    UNION ALL
    (
      SELECT 'entryPages' as level, name, COUNT() as uv, COUNT() as pageviews, 0 as exits FROM (
        SELECT argMin(${F.href}, ${F.timestamp}) as name
        FROM ${F.engine} WHERE ${pageviewWhere}
        GROUP BY ${F.sessionId}
      )
      GROUP BY name ORDER BY uv DESC LIMIT 50
    )
    UNION ALL
    (
      SELECT 'hostnames' as level, ${F.domain} as name, COUNT(DISTINCT ${F.visitorId}) as uv, 0 as pageviews, 0 as exits
      FROM ${F.engine} WHERE ${pageviewWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 20
    )
    UNION ALL
    (
      SELECT 'exitLinks' as level, ${F.href} as name, COUNT(DISTINCT ${F.visitorId}) as uv, 0 as pageviews, COUNT() as exits
      FROM ${F.engine} WHERE ${exitWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 30
    )
  `);

  const { pages = [], entryPages = [], hostnames = [], exitLinks = [] } = partitionByLevel(res.data);

  return { pages, entryPages, hostnames, exitLinks };
});
