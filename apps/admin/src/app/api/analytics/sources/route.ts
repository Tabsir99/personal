import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import { queryAE, parseAnalyticsParams, periodToRange, partitionByLevel, F } from "@/lib/analyticsEngine";
import type { SourcesResponse } from "@/lib/analyticsTypes";

export const GET = wrapRoute<SourcesResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const baseWhere = `
    ${F.websiteId} = '${params.websiteId}'
    AND ${F.type} = 'pageview'
    AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
  `;

  const res = await queryAE<{
    level: "referrers" | "channels";
    name: string;
    uv: number;
    channel: string;
  }>(`
    (
      SELECT 'referrers' as level, ${F.referrer} as name, COUNT(DISTINCT ${F.visitorId}) as uv,
        multiIf(
          ${F.referrer} = '', 'Direct / None',
          lower(${F.referrer}) LIKE '%google%' OR lower(${F.referrer}) LIKE '%bing%' OR lower(${F.referrer}) LIKE '%duckduckgo%' OR lower(${F.referrer}) LIKE '%yahoo%', 'Search',
          lower(${F.referrer}) LIKE '%twitter%' OR lower(${F.referrer}) LIKE '%x.com%' OR lower(${F.referrer}) LIKE '%facebook%' OR lower(${F.referrer}) LIKE '%linkedin%' OR lower(${F.referrer}) LIKE '%reddit%' OR lower(${F.referrer}) LIKE '%youtube%', 'Social',
          'Referral'
        ) as channel
      FROM ${F.engine} WHERE ${baseWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 50
    )
    UNION ALL
    (
      SELECT 'channels' as level,
        multiIf(
          ${F.referrer} = '', 'Direct / None',
          lower(${F.referrer}) LIKE '%google%' OR lower(${F.referrer}) LIKE '%bing%' OR lower(${F.referrer}) LIKE '%duckduckgo%' OR lower(${F.referrer}) LIKE '%yahoo%', 'Search',
          lower(${F.referrer}) LIKE '%twitter%' OR lower(${F.referrer}) LIKE '%x.com%' OR lower(${F.referrer}) LIKE '%facebook%' OR lower(${F.referrer}) LIKE '%linkedin%' OR lower(${F.referrer}) LIKE '%reddit%' OR lower(${F.referrer}) LIKE '%youtube%', 'Social',
          'Referral'
        ) as name,
        COUNT(DISTINCT ${F.visitorId}) as uv,
        '' as channel
      FROM ${F.engine} WHERE ${baseWhere}
      GROUP BY name ORDER BY uv DESC
    )
  `);

  const { referrers = [], channels = [] } = partitionByLevel(res.data);

  return { referrers, channels };
});
