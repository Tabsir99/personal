import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import { F, queryAE, parseAnalyticsParams, periodToRange } from "@/lib/analyticsEngine";

interface GoalMetric {
  name: string;
  uv: number;
  total: number;
  conversionRate: number;
}

interface EventsResponse {
  goals: GoalMetric[];
  totalVisitors: number;
}

export const GET = wrapRoute<EventsResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const [eventsRes, totalRes] = await Promise.all([
    queryAE<{ name: string; uv: number; total: number }>(`
      SELECT ${F.eventName} as name, COUNT(DISTINCT ${F.visitorId}) as uv, COUNT() as total
      FROM cgd
      WHERE index1 = '${params.websiteId}'
        AND ${F.type} = 'custom'
        AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
      GROUP BY name
      ORDER BY total DESC
      LIMIT 30
    `),
    queryAE<{ visitors: number }>(`
      SELECT COUNT(DISTINCT ${F.visitorId}) as visitors
      FROM cgd
      WHERE index1 = '${params.websiteId}'
        AND ${F.type} = 'pageview'
        AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
    `),
  ]);

  const totalVisitors = Number(totalRes.data[0]?.visitors ?? 0);

  return {
    goals: eventsRes.data.map((r) => ({
      name: String(r.name),
      uv: Number(r.uv),
      total: Number(r.total),
      conversionRate: totalVisitors > 0 ? Number(r.uv) / totalVisitors : 0,
    })),
    totalVisitors,
  };
});
