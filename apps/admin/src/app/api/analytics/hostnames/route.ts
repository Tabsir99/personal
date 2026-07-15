import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import { F, queryAE, parseAnalyticsParams, periodToRange } from "@/lib/analyticsEngine";

interface HostnameMetric {
  name: string;
  uv: number;
}

export const GET = wrapRoute<HostnameMetric[]>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const res = await queryAE<{ name: string; uv: number }>(`
    SELECT ${F.domain} as name, COUNT(DISTINCT ${F.visitorId}) as uv
    FROM cgd
    WHERE index1 = '${params.websiteId}'
      AND ${F.type} = 'pageview'
      AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
    GROUP BY name
    ORDER BY uv DESC
    LIMIT 20
  `);

  return res.data.map((r) => ({
    name: String(r.name),
    uv: Number(r.uv),
  }));
});
