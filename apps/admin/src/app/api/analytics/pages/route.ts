import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import { F, queryAE, parseAnalyticsParams, periodToRange } from "@/lib/analyticsEngine";

interface PageMetric {
  name: string;
  uv: number;
  pageviews: number;
}

interface PagesResponse {
  pages: PageMetric[];
  entryPages: PageMetric[];
}

export const GET = wrapRoute<PagesResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);

  const [pagesRes, sessionFirstRes] = await Promise.all([
    queryAE<{ name: string; uv: number; pageviews: number }>(`
      SELECT ${F.href} as name, COUNT(DISTINCT ${F.visitorId}) as uv, COUNT(*) as pageviews
      FROM cgd
      WHERE index1 = '${params.websiteId}'
        AND ${F.type} = 'pageview'
        AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
      GROUP BY name
      ORDER BY uv DESC
      LIMIT 50
    `),
    queryAE<{ sid: string; name: string; ts: number }>(`
      SELECT ${F.sessionId} as sid, ${F.href} as name, MIN(${F.timestamp}) as ts
      FROM cgd
      WHERE index1 = '${params.websiteId}'
        AND ${F.type} = 'pageview'
        AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
      GROUP BY sid, name
      ORDER BY ts ASC
    `),
  ]);

  const entryBySession = new Map<string, string>();
  for (const row of sessionFirstRes.data) {
    const sid = String(row.sid);
    if (!entryBySession.has(sid)) {
      entryBySession.set(sid, String(row.name));
    }
  }

  const entryCount = new Map<string, number>();
  for (const page of entryBySession.values()) {
    entryCount.set(page, (entryCount.get(page) ?? 0) + 1);
  }

  const entryPages = [...entryCount.entries()]
    .map(([name, uv]) => ({ name, uv, pageviews: uv }))
    .sort((a, b) => b.uv - a.uv)
    .slice(0, 50);

  return {
    pages: pagesRes.data.map((r) => ({
      name: String(r.name),
      uv: Number(r.uv),
      pageviews: Number(r.pageviews),
    })),
    entryPages,
  };
});
