import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import {
  queryTinybird,
  parseAnalyticsParams,
  periodToRange,
  partitionByLevel,
  escapeSQL,
  F,
} from "@/lib/tinybird";
import {
  eventWhere,
  visitorRevenueSubquery,
  revenueDedupedByVisitor,
  type UvBreakdownRow,
} from "@/lib/analyticsQuery";
import type { LocationsResponse, LocationMetric } from "@/lib/analyticsTypes";

const PER_LEVEL = 30;

type Row = UvBreakdownRow<"countries" | "regions" | "cities"> & {
  country: string;
  region: string;
};

const withoutRegion = (rows: Omit<Row, "level">[]): LocationMetric[] =>
  rows.map(({ name, uv, revenue, country }) => ({
    name,
    uv,
    revenue,
    country,
  }));

export const GET = wrapRoute<LocationsResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const country = req.nextUrl.searchParams.get("country");
  const scope = country ? ` AND ${F.country} = '${escapeSQL(country)}'` : "";

  const sql = `
    SELECT
      multiIf(GROUPING(v.city) = 0, 'cities', GROUPING(v.region) = 0, 'regions', 'countries') as level,
      multiIf(GROUPING(v.city) = 0, v.city, GROUPING(v.region) = 0, v.region, v.country) as name,
      v.country as country,
      v.region as region,
      uniqExact(v.vid) as uv,
      ${revenueDedupedByVisitor("v.vid", "pr.rev")}
    FROM (
      SELECT
        ${F.country} as country,
        ${F.region} as region,
        ${F.city} as city,
        ${F.visitorId} as vid
      FROM ${F.engine}
      WHERE ${eventWhere("pageview", params.websiteId, start, end)}${scope}
      GROUP BY country, region, city, vid
    ) v
    LEFT JOIN (${visitorRevenueSubquery(params.websiteId, start, end)}) pr
      ON v.vid = pr.vid
    GROUP BY GROUPING SETS ((v.country), (v.country, v.region), (v.country, v.region, v.city))
    ORDER BY uv DESC
    LIMIT ${PER_LEVEL} BY level
  `;

  const res = await queryTinybird<Row>(sql, "locations");

  const { countries, regions, cities } = partitionByLevel(res.data, [
    "countries",
    "regions",
    "cities",
  ]);

  return {
    countries: withoutRegion(countries),
    regions: withoutRegion(regions),
    cities,
  };
});
