import { NextResponse } from "next/server";
import { db } from "@/config/firebaseAdmin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "7", 10);
  
  const todayDate = new Date();
  const cutoffDate = new Date();
  cutoffDate.setDate(todayDate.getDate() - days);
  
  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const todayStr = formatDate(todayDate);
  const cutoffStr = formatDate(cutoffDate);

  try {
    const snapshot = await db
      .collection("traffic_sources")
      .where("date", ">=", cutoffStr)
      .where("date", "<=", todayStr)
      .get();

    // Aggregate across dates: group by source
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

    return NextResponse.json(sources);
  } catch (error) {
    console.error("Error fetching traffic sources:", error);
    return NextResponse.json({ error: "Failed to fetch traffic sources" }, { status: 500 });
  }
}
