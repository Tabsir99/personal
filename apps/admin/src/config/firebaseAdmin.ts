// import "server-only";
import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { env } from "./env.server";

function initFirebase() {
  if (getApps().length) return getFirestore(getApps()[0]);

  let app: App;
  if (env.RUNTIME === "local") {
    app = initializeApp({
      projectId: "tabsir-s-blog",
    });
  } else {
    app = initializeApp({
      credential: cert({
        projectId: "tabsir-s-blog",
        privateKey: env.FIREBASE_PRIVATE_KEY,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }

  const db = getFirestore(app);

  if (env.RUNTIME === "local") {
    db.settings({
      host: "localhost:8085",
      ssl: false,
    });
  }

  return db;
}

export const db = initFirebase();

export const Collections = {
  /** Aggregated dashboard stats. Docs: `overall`. */
  DASHBOARD_STATS: "stats",

  /** Stats bucketed per day (doc IDs like `2026-05-08`). Dynamic docs. */
  DAILY_STATS: "daily-stats",

  /** Stats bucketed per month (doc IDs like `2026-05`). Dynamic docs. */
  MONTHLY_STATS: "monthly-stats",

  /** Per-page traffic and engagement metrics (doc IDs are page slugs). Dynamic docs. */
  PAGE_METRICS: "page-metrics",

  /** Blog posts (doc IDs are uuid). Dynamic docs. */
  BLOGS: "blogs",

  /** Event log (page views, clicks, etc.). Dynamic docs. */
  EVENTS: "events",

  /** Denormalized list of published blog slugs for sitemap/link validation. Docs: `blogs`. */
  VALID_LINKS: "valid-links",

  /** App-level config edited from the CMS. Docs: `blog`, `site`, `portfolio`. */
  CONFIG: "config",
} as const;

export type ValidCollections = keyof typeof Collections;
