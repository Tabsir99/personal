import "server-only";
import {
  BlogFormData,
  BlogStatus,
  SchemaType,
  BlogDraftDB,
  PublishedBlogDB,
} from "@/schemas/blogSchemas";
import { randomUUID } from "crypto";
import { slugify } from "./appUtils";
import { env } from "@/config/env.server";

// ============================================================================
// DRAFT CONVERSIONS (BLOG_DRAFTS collection)
// ============================================================================

export function draftDBToFormData(dbDraft: BlogDraftDB): BlogFormData {
  return {
    blogId: dbDraft.blogId,
    parentBlogId: dbDraft.parentBlogId,
    kind: dbDraft.kind,
    schemaType: dbDraft.schemaType,
    slug: dbDraft.slug,
    title: dbDraft.title,
    metaDescription: dbDraft.metaDescription,
    tags: dbDraft.tags,
    socialTitle: dbDraft.socialTitle,
    coverImageUrl: dbDraft.coverImageUrl,
    content: JSON.parse(dbDraft.content),
    readTime: dbDraft.readTime,
    dek: dbDraft.dek,
    seoTitle: dbDraft.seoTitle,
    createdAt: dbDraft.createdAt,
    updatedAt: dbDraft.updatedAt,
    hasDraftChanges: true,
    socialDescription: dbDraft.socialDescription,
    featured: dbDraft.featured || false,
    // publishedVersion will be added separately if parentBlogId exists
  };
}

export function formDataToDraftDB(formData: BlogFormData): BlogDraftDB {
  return {
    blogId: formData.blogId,
    parentBlogId: formData.parentBlogId,
    kind: formData.kind,
    schemaType: formData.schemaType,
    slug: formData.slug,
    status: BlogStatus.draft,
    title: formData.title,
    dek: formData.dek,
    seoTitle: formData.seoTitle,
    tags: formData.tags,
    socialTitle: formData.socialTitle,
    coverImageUrl: formData.coverImageUrl,
    content: JSON.stringify(formData.content),
    readTime: formData.readTime,
    metaDescription: formData.metaDescription,
    createdAt: formData.createdAt || Date.now(),
    updatedAt: Date.now(),
    socialDescription: formData.socialDescription,
    featured: formData.featured || false,
  };
}

// ============================================================================
// PUBLISHED CONVERSIONS (BLOGS collection)
// ============================================================================

export function publishedDBToFormData(
  dbPublished: PublishedBlogDB,
): BlogFormData {
  // When loading published blog for editing, populate draft fields from published
  return {
    blogId: randomUUID(), // New draft ID
    parentBlogId: dbPublished.blogId, // Link to published blog
    kind: dbPublished.kind,
    schemaType: dbPublished.schemaType,
    slug: dbPublished.slug,
    featured: dbPublished.featured,
    // Populate draft fields from published (user will edit these)
    title: dbPublished.title,
    dek: dbPublished.dek,
    seoTitle: dbPublished.seoTitle,
    tags: dbPublished.tags,
    socialTitle: dbPublished.socialTitle,
    socialDescription: dbPublished.socialDescription,
    coverImageUrl: dbPublished.coverImageUrl,
    content: JSON.parse(dbPublished.content),
    readTime: dbPublished.readTime,
    metaDescription: dbPublished.metaDescription,
    // Store published version for comparison
    publishedVersion: {
      title: dbPublished.title,
      dek: dbPublished.dek,
      seoTitle: dbPublished.seoTitle,
      tags: dbPublished.tags,
      socialTitle: dbPublished.socialTitle,
      coverImageUrl: dbPublished.coverImageUrl,
      content: JSON.parse(dbPublished.content),
      readTime: dbPublished.readTime,
      metaDescription: dbPublished.metaDescription,
      publishedAt: dbPublished.publishedAt,
      socialDescription: dbPublished.socialDescription,
      featured: dbPublished.featured,
    },
    createdAt: Date.now(), // Draft creation time
    updatedAt: Date.now(),
    hasDraftChanges: false, // No changes yet
  };
}

export function formDataToPublishedDB(formData: BlogFormData): PublishedBlogDB {
  // Promote draft fields to published
  return {
    blogId: formData.parentBlogId || formData.blogId, // Use parent ID if editing, else draft ID
    kind: formData.kind,
    schemaType: formData.schemaType,
    slug: formData.slug || slugify(formData.title),
    status: BlogStatus.published,
    title: formData.title,
    dek: formData.dek,
    seoTitle: formData.seoTitle,
    tags: formData.tags,
    socialTitle: formData.socialTitle,
    coverImageUrl: formData.coverImageUrl,
    content: JSON.stringify(formData.content),
    readTime: formData.readTime,
    metaDescription: formData.metaDescription,
    stats: { views: 0, likes: 0, comments: 0, shares: 0 },
    createdAt: formData.publishedVersion ? formData.createdAt! : Date.now(),
    updatedAt: Date.now(),
    publishedAt: formData.publishedVersion?.publishedAt || Date.now(),
    recommendedBlogIds: [],
    socialDescription: formData.socialDescription,
    featured: formData.featured,
  };
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createNewBlogFormData(title?: string): BlogFormData {
  return {
    blogId: randomUUID(),
    parentBlogId: null, // New draft (not editing published)
    kind: "essay",
    schemaType: SchemaType.Article,
    slug: "",
    title: title || `Untitled Blog ${new Date().toLocaleDateString()}`,
    dek: "",
    seoTitle: "",
    tags: [],
    socialTitle: "",
    coverImageUrl: "",
    content: { type: "doc", content: [] },
    readTime: 0,
    metaDescription: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    hasDraftChanges: true,
    socialDescription: "",
    featured: false,
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

export async function sendRevalidateRequest(path: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BLOG_ORIGIN}/api/revalidate`,
      {
        method: "POST",
        body: JSON.stringify({ path: `/blogs/${path}` }),
        headers: {
          "Content-Type": "application/json",
          acs_tkn: env.SERVER_TOKEN,
        },
      },
    );
    if (env.RUNTIME === "local") {
      console.info(res.status, res.statusText);
    }
  } catch (error) {
    console.error(error);
  }
}
