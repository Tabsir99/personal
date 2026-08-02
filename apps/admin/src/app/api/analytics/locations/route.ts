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
    // Region and city names repeat across countries (London GB/CA), so a bare
    // name is not a key and the parents have to ride along on every row.
    .nested()
    // ClickHouse rejects an aggregate aliased to a GROUP BY column, hence the
    // renames. Both are mapped back below.
    .column(`any(${F.country}) as countryCode`)
    .column(`any(${F.region}) as regionName`)
    .top(30);

  if (countryFilter) chain.filter(`${F.country} = '${countryFilter}'`);

  const sql = chain.build();

  type Row = UvBreakdownRow<"countries" | "regions" | "cities"> & {
    countryCode: string;
    regionName: string;
  };
  const res = await queryTinybird<Row>(sql, "locations");

  const { countries, regions, cities } = partitionByLevel(res.data, [
    "countries",
    "regions",
    "cities",
  ]);
  // `regionName` is only meaningful on a city row. On a country row it is an
  // arbitrary pick from that country, and on a region row it repeats `name`.
  const toMetric =
    (withRegion: boolean) =>
    (rows: Omit<Row, "level">[]): LocationMetric[] =>
      rows.map(({ countryCode, regionName, ...rest }) => ({
        ...rest,
        country: countryCode,
        ...(withRegion ? { region: regionName } : {}),
      }));

  return {
    countries: toMetric(false)(countries),
    regions: toMetric(false)(regions),
    cities: toMetric(true)(cities),
  };
});
