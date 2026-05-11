import type { Firestore } from "firebase-admin/firestore";
import type { ValidLinks } from "@tabsircg/schemas/blog";

// `valid-links/blogs` is the denormalized slug list portfolio uses for sitemap
// and link-validation (see CLAUDE.local.md → Wire contracts).
export async function seedValidLinks(
  db: Firestore,
  slugs: string[],
): Promise<void> {
  const doc: ValidLinks = {
    blogLinks: slugs,
    categoryLinks: [],
  };
  await db.collection("valid-links").doc("blogs").set(doc);
  console.log("  ✓ valid-links/blogs");
}
