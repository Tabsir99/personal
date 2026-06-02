import { z } from "zod";
import { db, Collections } from "@/config/firebaseAdmin";
import { BlogStatus, PublishedBlogDB } from "@tabsircg/schemas/blog";
import { wrapRoute, HttpError } from "@/lib/appUtils";
import { fetchPublishedNeighbours } from "@/lib/blogQuery";

const slugSchema = z.string().min(1);

export const GET = wrapRoute(
  async (_req, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const parsedSlug = slugSchema.parse(slug);

    const snapshot = await db
      .collection(Collections.BLOGS)
      .where("slug", "==", parsedSlug)
      .where("status", "==", BlogStatus.published)
      .limit(1)
      .get();

    if (snapshot.empty) throw new HttpError(404, "Not found");

    const post = snapshot.docs[0].data() as PublishedBlogDB;
    const { prev, next } = await fetchPublishedNeighbours(post.publishedAt);
    return { ...post, prev, next };
  },
);
