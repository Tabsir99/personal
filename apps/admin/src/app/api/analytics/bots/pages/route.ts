import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import {
  queryTinybird,
  parseAnalyticsParams,
  periodToRange,
  escapeSQL,
  parseHref,
  F,
} from "@/lib/tinybird";
import type { BotCategory } from "@tabsircg/schemas/analytics";
import type {
  BotPageMetric,
  BotPagesResponse,
} from "@/lib/analyticsTypes";

export const GET = wrapRoute<BotPagesResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);
  const botName = escapeSQL(req.nextUrl.searchParams.get("bot") ?? "");

  const res = await queryTinybird<{
    name: string;
    category: string;
    cnt: number;
  }>(
    `
    SELECT
      ${F.href} AS name,
      any(${F.botCategory}) AS category,
      COUNT() AS cnt
    FROM ${F.engine}
    WHERE ${F.websiteId} = '${params.websiteId}'
      AND ${F.isBot} = 1
      AND ${F.botName} = '${botName}'
      AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
    GROUP BY name
    ORDER BY cnt DESC
    LIMIT 100
  `,
    "bots.pages",
  );

  // Collapse hrefs to path+search and re-aggregate (same path, different origin).
  const byPath = new Map<string, number>();
  for (const r of res.data) {
    const p = parseHref(r.name, true).path;
    byPath.set(p, (byPath.get(p) ?? 0) + Number(r.cnt));
  }
  const pages: BotPageMetric[] = [...byPath.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const total = pages.reduce((sum, p) => sum + p.count, 0);
  const category = (res.data[0]?.category || "generic") as BotCategory;

  return { bot: botName, category, total, pages };
});
