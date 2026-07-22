import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import {
  queryTinybird,
  parseAnalyticsParams,
  periodToRange,
  partitionByLevel,
  F,
} from "@/lib/tinybird";
import { visitorRevenueSubquery, eventWhere } from "@/lib/analyticsQuery";
import type { PagesResponse } from "@/lib/analyticsTypes";

interface PagesRow {
  level: "pages" | "entryPages" | "hostnames" | "exitLinks";
  name: string;
  uv: number;
  pageviews: number;
  exits: number;
  revenue: number;
}

export const GET = wrapRoute<PagesResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const pageviewWhere = eventWhere("pageview", params.websiteId, start, end);
  const exitWhere = eventWhere("external_link", params.websiteId, start, end);

  const visitorRev = visitorRevenueSubquery(params.websiteId, start, end);

  const res = await queryTinybird<PagesRow>(
    `
    (
      SELECT 'pages' as level, name,
        uniqExact(vid) as uv, SUM(cnt) as pageviews, 0 as exits,
        round(SUM(rev) / 100) as revenue
      FROM (
        SELECT p.name as name, p.vid as vid, p.cnt as cnt, pr.rev as rev
        FROM (
          SELECT ${F.href} as name, ${F.visitorId} as vid, COUNT() as cnt
          FROM ${F.engine} WHERE ${pageviewWhere}
          GROUP BY name, vid
        ) p
        LEFT JOIN (${visitorRev}) pr ON p.vid = pr.vid
      )
      GROUP BY name ORDER BY uv DESC LIMIT 50
    )
    UNION ALL
    (
      SELECT 'entryPages' as level, name,
        uniqExact(vid) as uv, 0 as pageviews, 0 as exits,
        round(SUM(rev) / 100) as revenue
      FROM (
        SELECT e.name as name, e.vid as vid, pr.rev as rev
        FROM (
          SELECT argMin(${F.href}, ${F.timestamp}) as name, ${F.visitorId} as vid
          FROM ${F.engine} WHERE ${pageviewWhere}
          GROUP BY vid
        ) e
        LEFT JOIN (${visitorRev}) pr ON e.vid = pr.vid
      )
      GROUP BY name ORDER BY uv DESC LIMIT 50
    )
    UNION ALL
    (
      SELECT 'hostnames' as level, name,
        uniqExact(vid) as uv, 0 as pageviews, 0 as exits,
        round(SUM(rev) / 100) as revenue
      FROM (
        SELECT h.name as name, h.vid as vid, pr.rev as rev
        FROM (
          SELECT ${F.domain} as name, ${F.visitorId} as vid
          FROM ${F.engine} WHERE ${pageviewWhere}
          GROUP BY name, vid
        ) h
        LEFT JOIN (${visitorRev}) pr ON h.vid = pr.vid
      )
      GROUP BY name ORDER BY uv DESC LIMIT 20
    )
    UNION ALL
    (
      SELECT 'exitLinks' as level, ${F.href} as name,
        uniqExact(${F.visitorId}) as uv, 0 as pageviews, COUNT() as exits,
        0 as revenue
      FROM ${F.engine} WHERE ${exitWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 30
    )
  `,
    "pages",
  );

  const { pages, entryPages, hostnames, exitLinks } = partitionByLevel(
    res.data,
  );

  return { pages, entryPages, exitLinks, hostnames };
});
