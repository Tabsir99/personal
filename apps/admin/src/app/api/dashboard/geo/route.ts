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
    .collection("geo_stats")
    .where("date", ">=", cutoffStr)
    .where("date", "<=", todayStr)
    .get();

  const geoMap = new Map<string, any>();

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const country = data.country || "Unknown";
    if (!geoMap.has(country)) {
      geoMap.set(country, {
        country,
        sessions: 0,
        pageViews: 0,
        uniqueVisits: 0,
        devices: { mobile: 0, desktop: 0, tablet: 0 },
      });
    }

    const entry = geoMap.get(country);
    entry.sessions += data.sessions || 0;
    entry.pageViews += data.pageViews || 0;
    entry.uniqueVisits += data.uniqueVisits || 0;
    if (data.devices) {
      entry.devices.mobile += data.devices.mobile || 0;
      entry.devices.desktop += data.devices.desktop || 0;
      entry.devices.tablet += data.devices.tablet || 0;
    }
  });

  const geo = Array.from(geoMap.values());
  geo.sort((a, b) => b.sessions - a.sessions);

  return geo;
});
