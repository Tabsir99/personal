import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import { queryTinybird, parseAnalyticsParams, periodToRange, F } from "@/lib/tinybird";
import type { EventsResponse } from "@/lib/analyticsTypes";

export const GET = wrapRoute<EventsResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const [eventsRes, totalRes] = await Promise.all([
    queryTinybird<{ name: string; uv: number; total: number }>(`
      SELECT ${F.eventName} as name, COUNT(DISTINCT ${F.visitorId}) as uv, COUNT() as total
      FROM ${F.engine}
      WHERE ${F.websiteId} = '${params.websiteId}'
        AND ${F.type} != 'pageview'
        AND ${F.isBot} = 0
        AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
      GROUP BY name
      ORDER BY total DESC
      LIMIT 30
    `),
    queryTinybird<{ visitors: number }>(`
      SELECT COUNT(DISTINCT ${F.visitorId}) as visitors
      FROM ${F.engine}
      WHERE ${F.websiteId} = '${params.websiteId}'
        AND ${F.type} = 'pageview'
        AND ${F.isBot} = 0
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
