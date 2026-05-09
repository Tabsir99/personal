import { db, Collections } from "@/config/firebaseAdmin";
import { BlogStatus, PublishedBlogDB } from "@tabsircg/schemas/blog";
import { wrapRoute } from "@/lib/appUtils";

export const GET = wrapRoute(async () => {
  const snapshot = await db
    .collection(Collections.BLOGS)
    .where("status", "==", BlogStatus.published)
    .orderBy("featuredAt", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const blog = snapshot.docs[0].data() as PublishedBlogDB;
  return blog.featuredAt == null ? null : blog;
});
