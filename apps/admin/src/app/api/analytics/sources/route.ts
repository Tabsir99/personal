import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import { queryAE, parseAnalyticsParams, periodToRange, F } from "@/lib/analyticsEngine";

interface SourceMetric {
  name: string;
  uv: number;
  channel: string;
}

interface SourcesResponse {
  referrers: SourceMetric[];
}

function classifyChannel(referrer: string): string {
  if (!referrer) return "Direct / None";
  const r = referrer.toLowerCase();
  if (r.includes("google") || r.includes("bing") || r.includes("duckduckgo") || r.includes("yahoo"))
    return "Search";
  if (r.includes("twitter") || r.includes("x.com") || r.includes("facebook") || r.includes("linkedin") || r.includes("reddit") || r.includes("youtube"))
    return "Social";
  return "Referral";
}

export const GET = wrapRoute<SourcesResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const res = await queryAE<{ name: string; uv: number }>(`
    SELECT ${F.referrer} as name, COUNT(DISTINCT ${F.visitorId}) as uv
    FROM ${F.engine}
    WHERE ${F.websiteId} = '${params.websiteId}'
      AND ${F.type} = 'pageview'
      AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
    GROUP BY name
    ORDER BY uv DESC
    LIMIT 50
  `);

  const referrers = res.data.map((r) => {
    const name = String(r.name) || "Direct / None";
    return {
      name,
      uv: Number(r.uv),
      channel: classifyChannel(String(r.name)),
    };
  });

  return { referrers };
});
