// Dev/test helper: directly set a published blog's title in the emulator
// (bypasses the API + revalidation) so ISR revalidation can be tested with a
// stale→fresh control. Usage: tsx src/scripts/devSetBlogTitle.ts <slug> <title>
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { db } = await import("@/config/firebaseAdmin");

const slug = process.argv[2];
const newTitle = process.argv.slice(3).join(" ");
if (!slug || !newTitle) {
  console.error("usage: devSetBlogTitle.ts <slug> <title...>");
  process.exit(1);
}

const snap = await db
  .collection("blogs")
  .where("slug", "==", slug)
  .limit(1)
  .get();
if (snap.empty) {
  console.error(`no blog with slug "${slug}"`);
  process.exit(1);
}

await snap.docs[0].ref.update({ title: newTitle, updatedAt: Date.now() });
console.log(`updated ${slug} -> "${newTitle}"`);
process.exit(0);
