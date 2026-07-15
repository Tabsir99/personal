import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import { F, queryAE, parseAnalyticsParams, periodToRange, escapeSQL } from "@/lib/analyticsEngine";

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
    index1 = '${params.websiteId}'
    AND ${F.type} = 'pageview'
    AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
  `;

  const [countriesRes, regionsRes, citiesRes] = await Promise.all([
    queryAE<{ name: string; uv: number }>(`
      SELECT ${F.country} as name, COUNT(DISTINCT ${F.visitorId}) as uv
      FROM cgd WHERE ${baseWhere}
      GROUP BY name ORDER BY uv DESC LIMIT 30
    `),
    queryAE<{ name: string; uv: number }>(`
      SELECT ${F.region} as name, COUNT(DISTINCT ${F.visitorId}) as uv
      FROM cgd WHERE ${baseWhere}
        ${countryFilter ? `AND ${F.country} = '${countryFilter}'` : ""}
      GROUP BY name ORDER BY uv DESC LIMIT 30
    `),
    queryAE<{ name: string; uv: number }>(`
      SELECT ${F.city} as name, COUNT(DISTINCT ${F.visitorId}) as uv
      FROM cgd WHERE ${baseWhere}
        ${countryFilter ? `AND ${F.country} = '${countryFilter}'` : ""}
        ${regionFilter ? `AND ${F.region} = '${regionFilter}'` : ""}
      GROUP BY name ORDER BY uv DESC LIMIT 30
    `),
  ]);

  const toMetrics = (data: { name: string; uv: number }[]) =>
    data.map((r) => ({ name: String(r.name), uv: Number(r.uv) }));

  return {
    countries: toMetrics(countriesRes.data),
    regions: toMetrics(regionsRes.data),
    cities: toMetrics(citiesRes.data),
  };
});
