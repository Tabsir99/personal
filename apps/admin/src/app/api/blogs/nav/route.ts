import { db, Collections } from "@/config/firebaseAdmin";
import { BlogStatus } from "@tabsircg/schemas/blog";
import { wrapRoute } from "@/lib/appUtils";

export const GET = wrapRoute(async () => {
  const snap = await db
    .collection(Collections.BLOGS)
    .where("status", "==", BlogStatus.published)
    .orderBy("publishedAt", "desc")
    .select("slug", "title", "publishedAt", "updatedAt", "coverImageUrl")
    .get();
  return snap.docs.map((d) => d.data());
});
