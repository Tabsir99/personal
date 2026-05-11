import type { Firestore } from "firebase-admin/firestore";
import { siteConfigSchema, type SiteConfig } from "@tabsircg/schemas/site";

// Mirrors the literals that lived in apps/portfolio/src/components/Blog/* so
// the swap from hardcoded copy to fetched siteConfig is a no-op visually.
const SITE: SiteConfig = siteConfigSchema.parse({
  blogLanding: {
    metaTitle: "Writing — tabsircg.com",
    metaDescription:
      "Field notes on databases, type systems, and the occasional 3 a.m. pager incident.",
    heroHeading: "Writing",
    heroTagline:
      "Field notes on databases, type systems, and the occasional 3 a.m. pager incident.",
  },
  nowReading: [
    { title: "Designing Data-Intensive Applications", author: "Kleppmann", done: true },
    { title: "Crafting Interpreters", author: "Nystrom" },
    { title: "The Pragmatic Programmer", author: "Hunt & Thomas" },
  ],
  currentlyBuilding: {
    code: "tinypg",
    body: "— a 2-day SQL playground that renders EXPLAIN plans as little ascii forests.",
    linkLabel: "→ /lab",
    linkHref: "/lab",
  },
});

export async function seedSiteConfig(db: Firestore): Promise<void> {
  await db.collection("config").doc("site").set(SITE);
  console.log("  ✓ config/site");
}
