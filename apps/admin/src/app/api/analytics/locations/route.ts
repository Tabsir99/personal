import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import {
  queryAE,
  parseAnalyticsParams,
  periodToRange,
  escapeSQL,
  F,
} from "@/lib/analyticsEngine";

interface LocationMetric {
  name: string;
  uv: number;
}

interface LocationsResponse {
  countries: LocationMetric[];
  regions: LocationMetric[];
  cities: LocationMetric[];
}

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
    AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
  `;

  const regionWhere = `${baseWhere}${countryFilter ? ` AND ${F.country} = '${countryFilter}'` : ""}`;
  const cityWhere = `${regionWhere}${regionFilter ? ` AND ${F.region} = '${regionFilter}'` : ""}`;

  const res = await queryAE<{
    level: "country" | "region" | "city";
    name: string;
    uv: number;
  }>(`
    (
      SELECT 'country' as level, ${F.country} as name, COUNT(DISTINCT ${F.visitorId}) as uv
      FROM ${F.engine} WHERE ${baseWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 30
    )
    UNION ALL
    (
      SELECT 'region' as level, ${F.region} as name, COUNT(DISTINCT ${F.visitorId}) as uv
      FROM ${F.engine} WHERE ${regionWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 30
    )
    UNION ALL
    (
      SELECT 'city' as level, ${F.city} as name, COUNT(DISTINCT ${F.visitorId}) as uv
      FROM ${F.engine} WHERE ${cityWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 30
    )
  `);

  const byLevel = (level: "country" | "region" | "city"): LocationMetric[] =>
    res.data
      .filter((r) => r.level === level)
      .map((r) => ({ name: String(r.name), uv: Number(r.uv) }));

  return {
    countries: byLevel("country"),
    regions: byLevel("region"),
    cities: byLevel("city"),
  };
});
