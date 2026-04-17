import "server-only";
import {
  BlogFormData,
  BlogStatus,
  BlogType,
  BlogDraftDB,
  PublishedBlogDB,
} from "@/types/blogTypes";
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
    type: dbDraft.type,
    link: dbDraft.link,
    title: dbDraft.title,
    description: dbDraft.description,
    tags: dbDraft.tags,
    socialTitle: dbDraft.socialTitle,
    featuredImageUrl: dbDraft.featuredImageUrl,
    recommendationTitle: dbDraft.recommendationTitle,
    content: JSON.parse(dbDraft.content),
    estReadTime: dbDraft.estReadTime,
    createdAt: dbDraft.createdAt,
    updatedAt: dbDraft.updatedAt,
    hasDraftChanges: true,
    // publishedVersion will be added separately if parentBlogId exists
  };
}

export function formDataToDraftDB(formData: BlogFormData): BlogDraftDB {
  return {
    blogId: formData.blogId,
    parentBlogId: formData.parentBlogId,
    type: formData.type,
    link: formData.link,
    status: BlogStatus.Draft,
    title: formData.title,
    description: formData.description,
    tags: formData.tags,
    socialTitle: formData.socialTitle,
    featuredImageUrl: formData.featuredImageUrl,
    recommendationTitle: formData.recommendationTitle,
    content: JSON.stringify(formData.content),
    estReadTime: formData.estReadTime,
    createdAt: formData.createdAt || Date.now(),
    updatedAt: Date.now(),
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
    type: dbPublished.type,
    link: dbPublished.link,
    // Populate draft fields from published (user will edit these)
    title: dbPublished.title,
    description: dbPublished.description,
    tags: dbPublished.tags,
    socialTitle: dbPublished.socialTitle,
    featuredImageUrl: dbPublished.featuredImageUrl,
    recommendationTitle: dbPublished.recommendationTitle,
    content: JSON.parse(dbPublished.content),
    estReadTime: dbPublished.estReadTime,
    // Store published version for comparison
    publishedVersion: {
      title: dbPublished.title,
      description: dbPublished.description,
      tags: dbPublished.tags,
      socialTitle: dbPublished.socialTitle,
      featuredImageUrl: dbPublished.featuredImageUrl,
      recommendationTitle: dbPublished.recommendationTitle,
      content: JSON.parse(dbPublished.content),
      estReadTime: dbPublished.estReadTime,
      publishedAt: dbPublished.publishedAt,
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
    type: formData.type,
    link: formData.link || slugify(formData.title),
    status: BlogStatus.Active,
    title: formData.title,
    description: formData.description,
    tags: formData.tags,
    socialTitle: formData.socialTitle,
    featuredImageUrl: formData.featuredImageUrl,
    recommendationTitle: formData.recommendationTitle,
    content: JSON.stringify(formData.content),
    estReadTime: formData.estReadTime,
    stats: { views: 0, likes: 0, comments: 0, shares: 0 },
    createdAt: formData.publishedVersion ? formData.createdAt! : Date.now(),
    updatedAt: Date.now(),
    publishedAt: formData.publishedVersion?.publishedAt || Date.now(),
    recommendations: [],
  };
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createNewBlogFormData(title?: string): BlogFormData {
  return {
    blogId: randomUUID(),
    parentBlogId: null, // New draft (not editing published)
    type: BlogType.Article,
    link: "",
    title: title || `Untitled Blog ${new Date().toLocaleDateString()}`,
    description: "",
    tags: [],
    socialTitle: "",
    featuredImageUrl: "",
    recommendationTitle: "Keep reading...",
    content: null,
    estReadTime: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    hasDraftChanges: true,
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
      console.log(res.status, res.statusText);
    }
  } catch (error) {
    console.error(error);
  }
}
