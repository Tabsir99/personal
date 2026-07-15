import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import { F, queryAE, parseAnalyticsParams, periodToRange } from "@/lib/analyticsEngine";

interface ExitLinkMetric {
  name: string;
  uv: number;
  exits: number;
}

export const GET = wrapRoute<ExitLinkMetric[]>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const res = await queryAE<{ name: string; uv: number; exits: number }>(`
    SELECT ${F.href} as name, COUNT(DISTINCT ${F.visitorId}) as uv, COUNT(*) as exits
    FROM cgd
    WHERE index1 = '${params.websiteId}'
      AND ${F.type} = 'custom'
      AND ${F.eventName} = 'outbound-link'
      AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
    GROUP BY name
    ORDER BY exits DESC
    LIMIT 30
  `);

  return res.data.map((r) => ({
    name: String(r.name),
    uv: Number(r.uv),
    exits: Number(r.exits),
  }));
});
