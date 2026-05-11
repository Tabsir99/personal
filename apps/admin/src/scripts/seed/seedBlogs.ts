import { randomUUID } from "node:crypto";
import type { Firestore } from "firebase-admin/firestore";
import {
  BlogStatus,
  type BlogStats,
  type PublishedBlogDB,
} from "@tabsircg/schemas/blog";
import { BLOG_SEEDS } from "./blogContent";
import { batchedWrites, rand } from "./helpers";

const DAY_MS = 24 * 60 * 60 * 1000;

// Writes the `blogs` collection. `slugViews` comes from the analytics simulator
// — used to backfill each blog's `stats.views` so the dashboard numbers and
// per-blog views are internally consistent.
export async function seedBlogs(
  db: Firestore,
  slugViews: Map<string, number>,
): Promise<void> {
  const now = Date.now();
  const blogIds: string[] = [];
  const blogDocs: PublishedBlogDB[] = [];

  for (const seed of BLOG_SEEDS) {
    const blogId = randomUUID();
    blogIds.push(blogId);

    const publishedAt = now - seed.publishedDaysAgo * DAY_MS;
    const views = slugViews.get(seed.slug) ?? 0;
    const stats: BlogStats = {
      views,
      score: Math.round(views * (0.06 + Math.random() * 0.06)), // 6–12%
      shares: Math.round(views * (0.02 + Math.random() * 0.03)),
    };

    blogDocs.push({
      blogId,
      kind: seed.kind,
      schemaType: seed.schemaType,
      slug: seed.slug,
      title: seed.title,
      dek: seed.dek,
      excerpt: seed.excerpt,
      tags: seed.tags,
      coverImageUrl: seed.coverImageUrl,
      seoTitle: seed.title,
      metaDescription: seed.dek,
      socialTitle: seed.title,
      socialDescription: seed.dek,
      readTime: seed.readTime,
      createdAt: publishedAt - rand(1, 4) * DAY_MS,
      updatedAt: publishedAt,
      featuredAt: seed.featured ? publishedAt + rand(1, 5) * DAY_MS : null,
      status: BlogStatus.published,
      content: JSON.stringify(seed.body),
      recommendedBlogIds: [],
      stats,
      publishedAt,
    });
  }

  // Cross-link recommendations: each post points at the other two.
  for (let i = 0; i < blogDocs.length; i++) {
    blogDocs[i].recommendedBlogIds = blogIds.filter((_, j) => j !== i);
  }

  const writes: Array<[FirebaseFirestore.DocumentReference, PublishedBlogDB]> =
    blogDocs.map((b) => [db.collection("blogs").doc(b.blogId), b]);
  await batchedWrites(db, writes);

  console.log(`  ✓ ${blogDocs.length} blogs`);
}
