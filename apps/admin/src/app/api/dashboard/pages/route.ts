import { db } from "@/config/firebaseAdmin";
import { wrapRoute } from "@/lib/appUtils";

export const GET = wrapRoute(async (request) => {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "7", 10);

  const todayDate = new Date();
  const cutoffDate = new Date();
  cutoffDate.setDate(todayDate.getDate() - days);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const todayStr = formatDate(todayDate);
  const cutoffStr = formatDate(cutoffDate);

  const snapshot = await db
    .collection("page_performance")
    .where("date", ">=", cutoffStr)
    .where("date", "<=", todayStr)
    .get();

  const pagesMap = new Map<string, any>();

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const path = data.path;
    if (!pagesMap.has(path)) {
      pagesMap.set(path, {
        path,
        views: 0,
        totalTimeOnPage: 0,
        bounces: 0,
        exitCount: 0,
      });
    }

    const entry = pagesMap.get(path);
    entry.views += data.views || 0;
    entry.totalTimeOnPage += data.totalTimeOnPage || 0;
    entry.bounces += data.bounces || 0;
    entry.exitCount += data.exitCount || 0;
  });

  const pages = Array.from(pagesMap.values()).map((p) => {
    const avgTimeOnPage = p.exitCount > 0 ? p.totalTimeOnPage / p.exitCount : 0;
    const bounceRate = p.views > 0 ? (p.bounces / p.views) * 100 : 0;
    return {
      path: p.path,
      views: p.views,
      avgTimeOnPage,
      bounceRate,
      bounces: p.bounces,
    };
  });

  pages.sort((a, b) => b.views - a.views);

  return pages;
});
