import type { Firestore } from "firebase-admin/firestore";

// Editable in the CMS via `addConfigValue` (apps/admin/src/actions/configActions.ts).
// Seeding establishes a starting set so the dropdowns aren't empty on a fresh DB.
const TAGS = [
  "accessibility",
  "design",
  "devops",
  "firebase",
  "indie-hacking",
  "nextjs",
  "performance",
  "productivity",
  "react",
  "tailwind",
  "typescript",
  "web-dev",
];

const KINDS = ["case-study", "essay", "opinion", "retrospective", "tutorial"];

const SCHEMA_TYPES = ["Article", "BlogPosting", "HowTo"];

export async function seedConfig(db: Firestore): Promise<void> {
  await db
    .collection("config")
    .doc("blog")
    .set({
      tags: [...TAGS].sort(),
      kinds: [...KINDS].sort(),
      schemaTypes: [...SCHEMA_TYPES].sort(),
    });
  console.log("  ✓ config/blog");
}
