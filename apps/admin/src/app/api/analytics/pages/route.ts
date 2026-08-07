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
import {
  visitorRevenueSubquery,
  eventWhere,
  revenueDedupedByVisitor,
  nestRevenue,
  VISITOR_REVENUE_COLUMNS,
  type RevenueColumns,
} from "@/lib/analyticsQuery";
import type { PagesResponse } from "@/lib/analyticsTypes";

interface PagesRow extends RevenueColumns {
  level: "pages" | "entryPages" | "hostnames" | "exitLinks";
  name: string;
  uv: number;
  pageviews: number;
  exits: number;
}

const HOSTNAMES_LIMIT = 3;

export const GET = wrapRoute<PagesResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const pageviewWhere = eventWhere("pageview", params.websiteId, start, end);
  const exitWhere = eventWhere("external_link", params.websiteId, start, end);
  const visitorRev = visitorRevenueSubquery(params.websiteId, start, end);

  // pages/entryPages/hostnames share one pageview scan via GROUPING SETS;
  // exitLinks is a different event type and stays its own.
  const res = await queryTinybird<PagesRow>(
    `
    (
      SELECT
        multiIf(GROUPING(href) = 0, 'pages', GROUPING(host) = 0, 'hostnames', 'entryPages') AS level,
        multiIf(GROUPING(href) = 0, any(href), GROUPING(host) = 0, any(host), any(entryHref)) AS name,
        uniqExact(vid) AS uv,
        if(GROUPING(href) = 0, sum(cnt), 0) AS pageviews,
        0 AS exits,
        ${revenueDedupedByVisitor("vid", "")}
      FROM (
        SELECT d.href AS href, d.host AS host, d.vid AS vid, d.cnt AS cnt,
          d.entryHref AS entryHref,
          ${VISITOR_REVENUE_COLUMNS.map((c) => `pr.${c} AS ${c}`).join(",\n          ")}
        FROM (
          SELECT href, host, vid, cnt,
            first_value(href) OVER (PARTITION BY vid ORDER BY firstTs) AS entryHref
          FROM (
            SELECT
              ${F.href} AS href,
              ${F.domain} AS host,
              ${F.visitorId} AS vid,
              COUNT() AS cnt,
              min(${F.timestamp}) AS firstTs
            FROM ${F.engine} WHERE ${pageviewWhere}
            GROUP BY href, host, vid
          )
        ) d
        LEFT JOIN (${visitorRev}) pr ON d.vid = pr.vid
      )
      GROUP BY GROUPING SETS ((href), (host), (entryHref))
      ORDER BY uv DESC
      LIMIT 20 BY level
    )
    UNION ALL
    (
      SELECT 'exitLinks' AS level, JSONExtractString(${F.extraData}, 'url') AS name,
        uniqExact(${F.visitorId}) AS uv, 0 AS pageviews, COUNT() AS exits,
        0 AS revCharge, 0 AS revRefund, 0 AS revDispute
      FROM ${F.engine} WHERE ${exitWhere} AND JSONExtractString(${F.extraData}, 'url') != ''
      GROUP BY name ORDER BY uv DESC LIMIT 20
    )
  `,
    "pages",
  );

  const { pages, entryPages, hostnames, exitLinks } = partitionByLevel(
    res.data,
    ["pages", "entryPages", "hostnames", "exitLinks"],
  );

  return {
    pages: pages.map(nestRevenue),
    entryPages: entryPages.map(nestRevenue),
    exitLinks: exitLinks.map(nestRevenue),
    hostnames: hostnames.slice(0, HOSTNAMES_LIMIT).map(nestRevenue),
  };
});
