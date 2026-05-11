import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load apps/admin/.env BEFORE any module that reads process.env at import time.
// firebaseAdmin -> env.server.ts calls requireEnv() during module init, so the
// firebaseAdmin import must come AFTER dotenv.config() — hence the dynamic
// import below.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const [{ db }, { SEED }, { BLOG_SEEDS }, { simulateTraffic }] =
  await Promise.all([
    import("@/config/firebaseAdmin"),
    import("./flags"),
    import("./blogContent"),
    import("./simulator"),
  ]);
const { seedConfig } = await import("./seedConfig");
const { seedSiteConfig } = await import("./seedSiteConfig");
const { seedBlogs } = await import("./seedBlogs");
const { seedValidLinks } = await import("./seedValidLinks");
const { seedAnalytics } = await import("./seedAnalytics");

console.log("Seeding Firestore...");

const slugs = BLOG_SEEDS.map((b) => b.slug);
// Run the simulator unconditionally — it's pure compute, and both `blogs`
// (for stats backfill) and `analytics` (for the four aggregate collections)
// consume its output.
const simulation = simulateTraffic(slugs);

if (SEED.config) await seedConfig(db);
if (SEED.siteConfig) await seedSiteConfig(db);
if (SEED.blogs) await seedBlogs(db, simulation.slugViews);
if (SEED.validLinks) await seedValidLinks(db, slugs);
if (SEED.analytics) await seedAnalytics(db, simulation);

console.log("Done.");
process.exit(0);
