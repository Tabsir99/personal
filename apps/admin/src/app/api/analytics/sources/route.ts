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
import { breakdown, type BreakdownRow } from "@/lib/analyticsQuery";
import {
  CAMPAIGN_DIMENSIONS,
  rollupCampaigns,
  type SourcesResponse,
  type SourceMetric,
  type ChannelMetric,
  type CampaignMetric,
  type CampaignDimension,
} from "@/lib/analyticsTypes";
import { buildChannelSQL } from "./channels";

type SourceLevel = "referrers" | "channels" | CampaignDimension;

const channelExpr = buildChannelSQL(F.referrer);
const paramExpr = (dim: CampaignDimension) =>
  `extractURLParameter(${F.href}, '${dim}')`;

export const GET = wrapRoute<SourcesResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  // Referrers, channels and every campaign dimension are one GROUPING SETS scan:
  // the campaign levels ride the scan referrers/channels already pay for. Empty
  // buckets (untagged traffic) fall out as name === '' below.
  const chain = breakdown(params.websiteId, start, end)
    .level("referrers", "referrer", F.referrer)
    .level("channels", "channel", channelExpr);
  for (const dim of CAMPAIGN_DIMENSIONS) chain.level(dim, dim, paramExpr(dim));

  const sql = chain
    .revenue()
    .splitVisitors()
    // Aliased `chan`, not `channel`: `channel` is a grouping key here and
    // ClickHouse rejects an aggregate aliased to a GROUP BY column. Each
    // referrer row carries its channel; mapped back to `channel` below.
    .column(`multiIf(GROUPING(referrer) = 0, any(channel), '') as chan`)
    .top(50)
    .build();

  const res = await queryTinybird<BreakdownRow<SourceLevel> & { chan: string }>(
    sql,
    "sources",
  );
  const byLevel = partitionByLevel(res.data, [
    "referrers",
    "channels",
    ...CAMPAIGN_DIMENSIONS,
  ]);

  const referrers = byLevel.referrers.map(({ chan, ...r }) => ({
    ...r,
    channel: chan,
  })) as SourceMetric[];
  const channels = byLevel.channels as ChannelMetric[];

  const dims = Object.fromEntries(
    CAMPAIGN_DIMENSIONS.map((dim) => [
      dim,
      byLevel[dim]
        .filter((r) => r.name !== "")
        .map((r) => ({
          name: r.name,
          uv: r.newVisitors + r.returningVisitors,
          revenue: r.revenue,
        })),
    ]),
  ) as Record<CampaignDimension, CampaignMetric[]>;

  return { referrers, channels, campaigns: rollupCampaigns(dims) };
});
