import { type Firestore, FieldValue } from "firebase-admin/firestore";
import { db } from "@/config/firebaseAdmin";
import { BlogStatus } from "@tabsircg/schemas/blog";

type OldStatus = "active" | "inactive" | BlogStatus;
const BLOGS_COLLECTION = "blogs";

interface OldBlogBase {
  blogId: string;
  type?: string;
  schemaType?: string;
  kind?: string;
  link?: string;
  slug?: string;
  createdAt?: number;
  updatedAt?: number;
  title?: string;
  description?: string;
  tags?: string[];
  socialTitle?: string;
  featuredImageUrl?: string;
  recommendationTitle?: string;
  estReadTime?: number;
  content?: string;
  featured?: boolean;
}

interface OldDraftDoc extends OldBlogBase {
  parentBlogId?: string | null;
  status?: OldStatus;
}

interface OldPublishedDoc extends OldBlogBase {
  status?: OldStatus;
  recommendations?: string[];
  stats?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  publishedAt?: number;
}

interface MigrationOptions {
  dryRun?: boolean;
  firestore?: Firestore;
}

function normalizeSlug(link: string | undefined, fallbackId: string): string {
  if (!link) return fallbackId;
  return (
    link
      .replace(/^https?:\/\/[^/]+/i, "")
      .replace(/^\/+/, "")
      .replace(/^blog\/+/i, "")
      .trim() || fallbackId
  );
}

function mapDraftStatus(): "draft" {
  return BlogStatus.draft;
}

function mapPublishedStatus(status: OldStatus | undefined): BlogStatus {
  if (status === BlogStatus.published) return BlogStatus.published;
  if (status === BlogStatus.unpublished) return BlogStatus.unpublished;
  if (status === BlogStatus.archived) return BlogStatus.archived;
  if (status === "active") return BlogStatus.published;
  if (status === "inactive") return BlogStatus.unpublished;
  return BlogStatus.unpublished;
}

function buildNewBase(oldData: OldBlogBase, docId: string, now: number) {
  const title = oldData.title ?? "";
  const dek = oldData.description ?? "";
  const tags = oldData.tags ?? [];
  const coverImageUrl = oldData.featuredImageUrl ?? "";
  const socialTitle = oldData.socialTitle ?? title;
  const readTime = oldData.estReadTime ?? 0;
  const blogId = oldData.blogId || docId;
  const schemaType = oldData.schemaType ?? oldData.type ?? "BlogPosting";
  const kind = oldData.kind ?? "essay";
  const sourceSlug = oldData.slug ?? oldData.link;

  return {
    title,
    dek,
    tags,
    coverImageUrl,
    seoTitle: title,
    metaDescription: dek,
    socialTitle,
    socialDescription: dek,
    readTime,
    blogId,
    kind,
    schemaType,
    slug: normalizeSlug(sourceSlug, blogId),
    createdAt: oldData.createdAt ?? now,
    updatedAt: oldData.updatedAt ?? now,
    featuredAt: oldData.featured ? (oldData.updatedAt ?? now) : null,
  };
}

function buildDraftMigrationPayload(oldData: OldDraftDoc, docId: string, now: number) {
  const base = buildNewBase(oldData, docId, now);
  return {
    ...base,
    parentBlogId: oldData.parentBlogId ?? null,
    status: mapDraftStatus(),
    content: oldData.content ?? "",
  };
}

function buildPublishedMigrationPayload(oldData: OldPublishedDoc, docId: string, now: number) {
  const base = buildNewBase(oldData, docId, now);
  return {
    ...base,
    status: mapPublishedStatus(oldData.status),
    content: oldData.content ?? "",
    recommendedBlogIds: oldData.recommendations ?? [],
    stats: {
      views: oldData.stats?.views ?? 0,
      score: 0,
      shares: oldData.stats?.shares ?? 0,
    },
    publishedAt: oldData.publishedAt ?? base.updatedAt,
  };
}

export async function migrateBlogSchema(options: MigrationOptions = {}) {
  const firestore = options.firestore ?? db;
  const dryRun = options.dryRun ?? true;

  const blogsSnapshot = await firestore.collection(BLOGS_COLLECTION).get();
  const draftDocs = blogsSnapshot.docs.filter(
    (doc) => (doc.data() as { status?: string }).status === "draft",
  );
  const publishedDocs = blogsSnapshot.docs.filter(
    (doc) => (doc.data() as { status?: string }).status !== "draft",
  );

  const summary = {
    dryRun,
    drafts: draftDocs.length,
    published: publishedDocs.length,
    writesPlanned: blogsSnapshot.size,
  };

  if (dryRun) {
    return summary;
  }

  let batch = firestore.batch();
  let writeCount = 0;
  const commitBatch = async () => {
    if (!writeCount) return;
    await batch.commit();
    batch = firestore.batch();
    writeCount = 0;
  };
  const now = Date.now();

  for (const doc of draftDocs) {
    const oldData = doc.data() as OldDraftDoc;
    const payload = buildDraftMigrationPayload(oldData, doc.id, now);
    // merge:false rewrites each document to only the new schema fields.
    batch.set(doc.ref, payload, { merge: false });
    writeCount += 1;
    if (writeCount >= 450) {
      await commitBatch();
    }
  }

  for (const doc of publishedDocs) {
    const oldData = doc.data() as OldPublishedDoc;
    const payload = buildPublishedMigrationPayload(oldData, doc.id, now);
    batch.set(doc.ref, payload, { merge: false });
    writeCount += 1;
    if (writeCount >= 450) {
      await commitBatch();
    }
  }

  await commitBatch();
  return summary;
}

// One-shot pass for blogs that already match the current schema except for the
// stats shape change (likes/comments → score). Idempotent; safe to re-run.
export async function migrateBlogStats(options: MigrationOptions = {}) {
  const firestore = options.firestore ?? db;
  const dryRun = options.dryRun ?? true;

  const snapshot = await firestore.collection(BLOGS_COLLECTION).get();
  const targets = snapshot.docs.filter((doc) => {
    const stats = (doc.data() as { stats?: Record<string, unknown> }).stats;
    if (!stats) return false;
    return (
      "likes" in stats || "comments" in stats || !("score" in stats)
    );
  });

  const summary = { dryRun, writesPlanned: targets.length };
  if (dryRun) return summary;

  let batch = firestore.batch();
  let writeCount = 0;
  const commitBatch = async () => {
    if (!writeCount) return;
    await batch.commit();
    batch = firestore.batch();
    writeCount = 0;
  };

  for (const doc of targets) {
    const stats = (doc.data() as { stats?: Record<string, unknown> }).stats ?? {};
    const update: Record<string, unknown> = {
      "stats.likes": FieldValue.delete(),
      "stats.comments": FieldValue.delete(),
    };
    if (!("score" in stats)) update["stats.score"] = 0;
    batch.update(doc.ref, update);
    writeCount += 1;
    if (writeCount >= 450) await commitBatch();
  }

  await commitBatch();
  return summary;
}
