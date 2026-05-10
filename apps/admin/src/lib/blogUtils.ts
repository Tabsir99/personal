import "server-only";
import {
  BlogFormData,
  BlogStatus,
  BlogDraftDB,
  PublishedBlogDB,
} from "@tabsircg/schemas/blog";
import { randomUUID } from "crypto";
import { slugify } from "./appUtils";
import { env } from "@/config/env.server";
import { clientEnv } from "@/config/env.client";

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
    excerpt: dbDraft.excerpt,
    seoTitle: dbDraft.seoTitle,
    createdAt: dbDraft.createdAt,
    updatedAt: dbDraft.updatedAt,
    hasDraftChanges: dbDraft.parentBlogId === null,
    socialDescription: dbDraft.socialDescription,
    featuredAt: dbDraft.featuredAt ?? null,
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
    excerpt: formData.excerpt,
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
    featuredAt: formData.featuredAt ?? null,
  };
}

export function publishedDBToFormData(
  dbPublished: PublishedBlogDB,
): BlogFormData {
  return {
    blogId: randomUUID(),
    parentBlogId: dbPublished.blogId,
    kind: dbPublished.kind,
    schemaType: dbPublished.schemaType,
    slug: dbPublished.slug,
    featuredAt: dbPublished.featuredAt ?? null,
    title: dbPublished.title,
    dek: dbPublished.dek,
    excerpt: dbPublished.excerpt,
    seoTitle: dbPublished.seoTitle,
    tags: dbPublished.tags,
    socialTitle: dbPublished.socialTitle,
    socialDescription: dbPublished.socialDescription,
    coverImageUrl: dbPublished.coverImageUrl,
    content: JSON.parse(dbPublished.content),
    readTime: dbPublished.readTime,
    metaDescription: dbPublished.metaDescription,
    publishedVersion: {
      title: dbPublished.title,
      dek: dbPublished.dek,
      excerpt: dbPublished.excerpt,
      seoTitle: dbPublished.seoTitle,
      tags: dbPublished.tags,
      socialTitle: dbPublished.socialTitle,
      coverImageUrl: dbPublished.coverImageUrl,
      content: JSON.parse(dbPublished.content),
      readTime: dbPublished.readTime,
      metaDescription: dbPublished.metaDescription,
      publishedAt: dbPublished.publishedAt,
      socialDescription: dbPublished.socialDescription,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    hasDraftChanges: false,
  };
}

export function formDataToPublishedDB(
  formData: BlogFormData,
  existingPublished?: PublishedBlogDB | null,
): PublishedBlogDB {
  return {
    blogId: formData.parentBlogId || formData.blogId,
    kind: formData.kind,
    schemaType: formData.schemaType,
    slug: formData.slug || slugify(formData.title),
    status: BlogStatus.published,
    title: formData.title,
    dek: formData.dek,
    excerpt: formData.excerpt,
    seoTitle: formData.seoTitle,
    tags: formData.tags,
    socialTitle: formData.socialTitle,
    coverImageUrl: formData.coverImageUrl,
    content: JSON.stringify(formData.content),
    readTime: formData.readTime,
    metaDescription: formData.metaDescription,
    stats: existingPublished?.stats ?? {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
    },
    createdAt: existingPublished?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
    publishedAt: existingPublished?.publishedAt ?? Date.now(),
    recommendedBlogIds: existingPublished?.recommendedBlogIds ?? [],
    socialDescription: formData.socialDescription,
    featuredAt: existingPublished?.featuredAt ?? formData.featuredAt ?? null,
  };
}

export function createNewBlogFormData(title?: string): BlogFormData {
  return {
    blogId: randomUUID(),
    parentBlogId: null,
    kind: "essay",
    schemaType: "Article",
    slug: "",
    title: title || `Untitled Blog ${new Date().toLocaleDateString()}`,
    dek: "",
    excerpt: "",
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
    featuredAt: null,
  };
}

export async function sendRevalidateRequest(path: string) {
  try {
    const res = await fetch(`${clientEnv.BLOG_ORIGIN}/api/revalidate`, {
      method: "POST",
      body: JSON.stringify({ path: `/blogs/${path}` }),
      headers: {
        "Content-Type": "application/json",
        acs_tkn: env.SERVER_TOKEN,
      },
    });
    if (env.RUNTIME === "local") {
      console.info(res.status, res.statusText);
    }
  } catch (error) {
    console.error(error);
  }
}
