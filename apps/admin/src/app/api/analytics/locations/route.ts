import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import {
  queryAE,
  parseAnalyticsParams,
  periodToRange,
  partitionByLevel,
  escapeSQL,
  F,
} from "@/lib/analyticsEngine";
import type { LocationsResponse } from "@/lib/analyticsTypes";

export const GET = wrapRoute<LocationsResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const countryFilter = req.nextUrl.searchParams.get("country")
    ? escapeSQL(req.nextUrl.searchParams.get("country")!)
    : null;
  const regionFilter = req.nextUrl.searchParams.get("region")
    ? escapeSQL(req.nextUrl.searchParams.get("region")!)
    : null;

  const baseWhere = `
    ${F.websiteId} = '${params.websiteId}'
    AND ${F.type} = 'pageview'
    AND ${F.isBot} = 0
    AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
  `;

  const regionWhere = `${baseWhere}${countryFilter ? ` AND ${F.country} = '${countryFilter}'` : ""}`;
  const cityWhere = `${regionWhere}${regionFilter ? ` AND ${F.region} = '${regionFilter}'` : ""}`;

  const res = await queryAE<{
    level: "countries" | "regions" | "cities";
    name: string;
    uv: number;
    country: string | null;
  }>(`
    (
      SELECT 'countries' as level, ${F.country} as name, COUNT(DISTINCT ${F.visitorId}) as uv, ${F.country} as country
      FROM ${F.engine} WHERE ${baseWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 30
    )
    UNION ALL
    (
      SELECT 'regions' as level, ${F.region} as name, COUNT(DISTINCT ${F.visitorId}) as uv, any(${F.country}) as country
      FROM ${F.engine} WHERE ${regionWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 30
    )
    UNION ALL
    (
      SELECT 'cities' as level, ${F.city} as name, COUNT(DISTINCT ${F.visitorId}) as uv, any(${F.country}) as country
      FROM ${F.engine} WHERE ${cityWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 30
    )
  `);

  const { countries = [], regions = [], cities = [] } = partitionByLevel(res.data);

  return { countries, regions, cities };
});
