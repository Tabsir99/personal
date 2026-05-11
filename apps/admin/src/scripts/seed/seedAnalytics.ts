import type { DocumentReference, Firestore } from "firebase-admin/firestore";
import { batchedWrites } from "./helpers";
import type { Simulation } from "./types";

// Writes the four analytics collections from a Simulation. Collection names
// match what the production event handler writes (snake_case), not the
// constants in firebaseAdmin.ts — see apps/admin/src/app/api/event/route.ts.
export async function seedAnalytics(
  db: Firestore,
  sim: Simulation,
): Promise<void> {
  const writes: Array<[DocumentReference, unknown]> = [];

  for (const [date, d] of sim.daily) {
    writes.push([db.collection("daily_stats").doc(date), d]);
  }
  for (const [key, g] of sim.geo) {
    writes.push([db.collection("geo_stats").doc(key), g]);
  }
  for (const [key, pg] of sim.pages) {
    writes.push([db.collection("page_performance").doc(key), pg]);
  }
  for (const [key, t] of sim.sources) {
    writes.push([db.collection("traffic_sources").doc(key), t]);
  }

  await batchedWrites(db, writes);

  console.log(
    `  ✓ analytics: ${sim.daily.size} daily / ${sim.geo.size} geo / ${sim.pages.size} page / ${sim.sources.size} source docs`,
  );
}
