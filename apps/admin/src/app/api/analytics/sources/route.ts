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
  nestRevenue,
  revenueSplit,
  type BreakdownRow,
} from "@/lib/analyticsQuery";
import {
  CAMPAIGN_DIMENSIONS,
  rollupCampaigns,
  type SourcesResponse,
  type CampaignMetric,
  type CampaignDimension,
} from "@/lib/analyticsTypes";
import { buildChannelSQL } from "./channels";

type SourceLevel = "referrers" | "channels" | CampaignDimension;

const PER_LEVEL = 50;

const LEVELS: { level: SourceLevel; key: string }[] = [
  { level: "referrers", key: "referrer" },
  { level: "channels", key: "chn" },
  ...CAMPAIGN_DIMENSIONS.map((dim) => ({ level: dim, key: dim })),
];

type SourceLevelSpec = (typeof LEVELS)[number];

const perLevel = (value: (spec: SourceLevelSpec) => string): string => {
  const last = LEVELS.length - 1;
  const arms = LEVELS.map((spec, i) =>
    i < last ? `GROUPING(s.${spec.key}) = 0, ${value(spec)}` : value(spec),
  );
  return `multiIf(${arms.join(", ")})`;
};

const campaignParam = (dim: CampaignDimension) =>
  `extractURLParameter(${F.href}, '${dim}')`;

export const GET = wrapRoute<SourcesResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const scanned = ["referrer", ...CAMPAIGN_DIMENSIONS];
  const groupingSets = LEVELS.map(({ key }) => `(s.${key})`).join(", ");

  const sql = `
    SELECT
      ${perLevel((spec) => `'${spec.level}'`)} as level,
      ${perLevel((spec) => `s.${spec.key}`)} as name,
      if(GROUPING(s.referrer) = 0, any(s.chn), '') as channel,
      uniqExactIf(s.vid, s.minSess = 1) as newVisitors,
      uniqExactIf(s.vid, s.minSess > 1) as returningVisitors,
      ${revenueDedupedByVisitor("s.vid", "pr")}
    FROM (
      SELECT
        ${scanned.join(", ")},
        vid,
        ${buildChannelSQL("referrer")} as chn,
        min(firstSession) OVER (PARTITION BY vid) as minSess
      FROM (
        SELECT
          ${F.referrer} as referrer,
          ${CAMPAIGN_DIMENSIONS.map((dim) => `${campaignParam(dim)} as ${dim}`).join(",\n          ")},
          ${F.visitorId} as vid,
          min(${F.sessionNumber}) as firstSession
        FROM ${F.engine}
        WHERE ${eventWhere("pageview", params.websiteId, start, end)}
        GROUP BY ${scanned.join(", ")}, vid
      )
    ) s
    LEFT JOIN (${visitorRevenueSubquery(params.websiteId, start, end)}) pr
      ON s.vid = pr.vid
    GROUP BY GROUPING SETS (${groupingSets})
    ORDER BY newVisitors + returningVisitors DESC
    LIMIT ${PER_LEVEL} BY level
  `;

  const res = await queryTinybird<
    BreakdownRow<SourceLevel> & { channel: string }
  >(sql, "sources");

  const byLevel = partitionByLevel(res.data, [
    "referrers",
    "channels",
    ...CAMPAIGN_DIMENSIONS,
  ]);

  const dims = Object.fromEntries(
    CAMPAIGN_DIMENSIONS.map((dim) => [
      dim,
      byLevel[dim]
        .filter((r) => r.name !== "")
        .map((r) => ({
          name: r.name,
          uv: r.newVisitors + r.returningVisitors,
          revenue: revenueSplit(r),
        })),
    ]),
  ) as Record<CampaignDimension, CampaignMetric[]>;

  return {
    referrers: byLevel.referrers.map(nestRevenue),
    channels: byLevel.channels.map(nestRevenue),
    campaigns: rollupCampaigns(dims),
  };
});
