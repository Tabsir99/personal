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
import { breakdown, type UvBreakdownRow } from "@/lib/analyticsQuery";
import type { SystemResponse } from "@/lib/analyticsTypes";

export const GET = wrapRoute<SystemResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const sql = breakdown(params.websiteId, start, end)
    .level("browsers", "browser", F.browser)
    .level("os", "os", F.os)
    .level("devices", "device", F.device)
    .revenue()
    .top(20)
    .build();

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
