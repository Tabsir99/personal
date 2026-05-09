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
    .collection("traffic_sources")
    .where("date", ">=", cutoffStr)
    .where("date", "<=", todayStr)
    .get();

  const sourcesMap = new Map<string, any>();

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const source = data.source || "Direct";
    if (!sourcesMap.has(source)) {
      sourcesMap.set(source, {
        source,
        sessions: 0,
        pageViews: 0,
        bounces: 0,
      });
    }

    const entry = sourcesMap.get(source);
    entry.sessions += data.sessions || 0;
    entry.pageViews += data.pageViews || 0;
    entry.bounces += data.bounces || 0;
  });

  const sources = Array.from(sourcesMap.values());
  sources.sort((a, b) => b.sessions - a.sessions);

  return sources;
});
