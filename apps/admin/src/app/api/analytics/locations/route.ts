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
import { breakdown, type UvBreakdownRow } from "@/lib/analyticsQuery";
import type { LocationsResponse, LocationMetric } from "@/lib/analyticsTypes";

export const GET = wrapRoute<LocationsResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const countryFilter = req.nextUrl.searchParams.get("country")
    ? escapeSQL(req.nextUrl.searchParams.get("country")!)
    : null;

  const chain = breakdown(params.websiteId, start, end)
    .level("countries", "country", F.country)
    .level("regions", "region", F.region)
    .level("cities", "city", F.city)
    .revenue()
    // Aliased away from the `country` grouping key: ClickHouse rejects an
    // aggregate aliased to a GROUP BY column. Mapped back to `country` below.
    .column(`any(${F.country}) as countryCode`)
    .top(30);

  if (countryFilter) chain.filter(`${F.country} = '${countryFilter}'`);

  const sql = chain.build();

  const res = await queryTinybird<
    UvBreakdownRow<"countries" | "regions" | "cities"> & { countryCode: string }
  >(sql, "locations");

  const { countries, regions, cities } = partitionByLevel(res.data, [
    "countries",
    "regions",
    "cities",
  ]);
  const withCountry = (
    rows: (Omit<UvBreakdownRow, "level"> & { countryCode: string })[],
  ): LocationMetric[] =>
    rows.map(({ countryCode, ...rest }) => ({ ...rest, country: countryCode }));

  return {
    countries: withCountry(countries),
    regions: withCountry(regions),
    cities: withCountry(cities),
  };
});
