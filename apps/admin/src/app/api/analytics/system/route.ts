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
  eventWhere,
  visitorRevenueSubquery,
  revenueDedupedByVisitor,
  type UvBreakdownRow,
} from "@/lib/analyticsQuery";
import type { SystemResponse } from "@/lib/analyticsTypes";

const PER_LEVEL = 20;

export const GET = wrapRoute<SystemResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const sql = `
    SELECT
      multiIf(GROUPING(v.browser) = 0, 'browsers', GROUPING(v.os) = 0, 'os', 'devices') as level,
      multiIf(GROUPING(v.browser) = 0, v.browser, GROUPING(v.os) = 0, v.os, v.device) as name,
      uniqExact(v.vid) as uv,
      ${revenueDedupedByVisitor("v.vid", "pr.rev")}
    FROM (
      SELECT
        ${F.browser} as browser,
        ${F.os} as os,
        ${F.device} as device,
        ${F.visitorId} as vid
      FROM ${F.engine}
      WHERE ${eventWhere("pageview", params.websiteId, start, end)}
      GROUP BY browser, os, device, vid
    ) v
    LEFT JOIN (${visitorRevenueSubquery(params.websiteId, start, end)}) pr
      ON v.vid = pr.vid
    GROUP BY GROUPING SETS ((v.browser), (v.os), (v.device))
    ORDER BY uv DESC
    LIMIT ${PER_LEVEL} BY level
  `;

  const res = await queryTinybird<
    UvBreakdownRow<"browsers" | "os" | "devices">
  >(sql, "system");

  const { browsers, os, devices } = partitionByLevel(res.data, [
    "browsers",
    "os",
    "devices",
  ]);

  return { browsers, os, devices };
});
