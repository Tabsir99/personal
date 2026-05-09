import { db } from "@/config/firebaseAdmin";
import { wrapRoute } from "@/lib/appUtils";

export const GET = wrapRoute(async (request) => {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "7", 10);

  const fetchDays = days * 2;
  const todayDate = new Date();

  const cutoffDate = new Date();
  cutoffDate.setDate(todayDate.getDate() - fetchDays);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const todayStr = formatDate(todayDate);
  const cutoffStr = formatDate(cutoffDate);

  const snapshot = await db
    .collection("daily_stats")
    .where("date", ">=", cutoffStr)
    .where("date", "<=", todayStr)
    .orderBy("date", "asc")
    .get();

  return snapshot.docs.map((doc) => doc.data());
});
