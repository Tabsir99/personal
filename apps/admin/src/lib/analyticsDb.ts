import { Collection } from "mongodb";
import { getDatabase } from "@/config/mognodb";
import type {
  DailyStats,
  PagePerformance,
  TrafficSource,
  GeoStats,
} from "@/types/dashboardTypes";

// Typed collection getters
export async function getDailyStatsCollection(): Promise<
  Collection<DailyStats>
> {
  const db = await getDatabase();
  return db.collection<DailyStats>("daily_stats");
}

export async function getPagePerformanceCollection(): Promise<
  Collection<PagePerformance>
> {
  const db = await getDatabase();
  return db.collection<PagePerformance>("page_performance");
}

export async function getTrafficSourceCollection(): Promise<
  Collection<TrafficSource>
> {
  const db = await getDatabase();
  return db.collection<TrafficSource>("traffic_sources");
}

export async function getGeoStatsCollection(): Promise<Collection<GeoStats>> {
  const db = await getDatabase();
  return db.collection<GeoStats>("geo_stats");
}
