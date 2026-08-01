import { NextRequest } from "next/server";
import { wrapRoute } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import {
  queryTinybird,
  parseAnalyticsParams,
  periodToRange,
  granularityToMs,
  F,
} from "@/lib/tinybird";
import type { BotCategory } from "@tabsircg/schemas/analytics";
import type {
  BotCategoryTotal,
  BotMetric,
  BotTimeseriesPoint,
  BotsResponse,
} from "@/lib/analyticsTypes";

interface Row {
  level: "series" | "bots";
  bucket: number;
  category: string;
  name: string;
  cnt: number;
}

export const GET = wrapRoute<BotsResponse>(async (req: NextRequest) => {
  await requireAuth();
  const params = parseAnalyticsParams(req.nextUrl.searchParams);
  const { start, end } = periodToRange(params.period);
  const bucketMs = granularityToMs(params.granularity ?? "daily");

  const where = `
    ${F.websiteId} = '${params.websiteId}'
    AND ${F.isBot} = 1
    AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
  `;

  // One query: per-bucket-per-category series rows + per-bot totals, tagged by
  // `level` so JS can split them (mirrors the partitionByLevel pattern).
  const res = await queryTinybird<Row>(
    `
    (
      SELECT
        'series' AS level,
        intDiv(${F.timestamp}, ${bucketMs}) * ${bucketMs} AS bucket,
        ${F.botCategory} AS category,
        '' AS name,
        COUNT() AS cnt
      FROM ${F.engine}
      WHERE ${where}
      GROUP BY bucket, category
    )
    UNION ALL
    (
      SELECT
        'bots' AS level,
        0 AS bucket,
        any(${F.botCategory}) AS category,
        ${F.botName} AS name,
        COUNT() AS cnt
      FROM ${F.engine}
      WHERE ${where}
      GROUP BY name
      ORDER BY cnt DESC
      LIMIT 100
    )
  `,
    "bots",
  );

  const seriesRows = res.data.filter((r) => r.level === "series");

  const bots: BotMetric[] = res.data
    .filter((r) => r.level === "bots" && r.name)
    .map((r) => ({
      name: r.name,
      category: (r.category || "generic") as BotCategory,
      count: Number(r.cnt),
    }));

  // Category totals from the series rows (every bot hit carries a category).
  const totals = new Map<BotCategory, number>();
  for (const s of seriesRows) {
    const cat = (s.category || "generic") as BotCategory;
    totals.set(cat, (totals.get(cat) ?? 0) + Number(s.cnt));
  }
  const categories: BotCategoryTotal[] = [...totals.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
  const activeCats = categories.map((c) => c.category);

  const byBucket = new Map<number, BotTimeseriesPoint>();
  for (const s of seriesRows) {
    const bucket = Number(s.bucket);
    let point = byBucket.get(bucket);
    if (!point) {
      point = { timestamp: bucket };
      for (const c of activeCats) point[c] = 0;
      byBucket.set(bucket, point);
    }
    point[(s.category || "generic") as BotCategory] = Number(s.cnt);
  }

  // Fill every bucket in range so the lines stay continuous (flat at 0 on gaps).
  const timeseries: BotTimeseriesPoint[] = [];
  const firstBucket = Math.floor(start / bucketMs) * bucketMs;
  for (let b = firstBucket; b < end; b += bucketMs) {
    const point = byBucket.get(b);
    if (point) {
      timeseries.push(point);
    } else {
      const empty: BotTimeseriesPoint = { timestamp: b };
      for (const c of activeCats) empty[c] = 0;
      timeseries.push(empty);
    }
  }

  const total = categories.reduce((sum, c) => sum + c.count, 0);

  return { total, categories, timeseries, bots };
});
