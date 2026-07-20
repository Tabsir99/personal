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
import type { SourcesResponse } from "@/lib/analyticsTypes";
import { buildChannelSQL } from "./channels";

const channelExpr = buildChannelSQL(F.referrer);

export const GET = wrapRoute<SourcesResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const baseWhere = `
    ${F.websiteId} = '${params.websiteId}'
    AND ${F.type} = 'pageview'
    AND ${F.isBot} = 0
    AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
  `;

  const res = await queryTinybird<{
    level: "referrers" | "channels";
    name: string;
    uv: number;
    channel: string;
  }>(`
    (
      SELECT 'referrers' as level, ${F.referrer} as name, COUNT(DISTINCT ${F.visitorId}) as uv,
        ${channelExpr} as channel
      FROM ${F.engine} WHERE ${baseWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 50
    )
    UNION ALL
    (
      SELECT 'channels' as level, ${channelExpr} as name, COUNT(DISTINCT ${F.visitorId}) as uv,
        '' as channel
      FROM ${F.engine} WHERE ${baseWhere}
      GROUP BY name ORDER BY uv DESC
    )
  `);

  const { referrers = [], channels = [] } = partitionByLevel(res.data);

  return { referrers, channels };
});
