import { NextResponse } from "next/server";
import { db } from "@/config/firebaseAdmin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "7", 10);
  
  // We fetch days * 2 to get previous period data for trends
  const fetchDays = days * 2;
  const todayDate = new Date();
  
  const cutoffDate = new Date();
  cutoffDate.setDate(todayDate.getDate() - fetchDays);
  
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const todayStr = formatDate(todayDate);
  const cutoffStr = formatDate(cutoffDate);

  try {
    const snapshot = await db
      .collection("daily_stats")
      .where("date", ">=", cutoffStr)
      .where("date", "<=", todayStr)
      .orderBy("date", "asc")
      .get();

    const stats = snapshot.docs.map((doc) => doc.data());

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching daily stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
