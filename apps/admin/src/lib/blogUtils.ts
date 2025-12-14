import "server-only";
import {
  BlogDB,
  BlogFormData,
  BlogStatus,
  BlogType,
  DraftBlogDB,
  PublishedBlogDB,
  PublishedBlogEditingDB,
} from "@/types/blogTypes";
import { randomUUID } from "crypto";
import { slugify } from "./utils";
import { env } from "@/config/env.server";

// Type guards
export function isDraftBlog(blog: BlogDB): blog is DraftBlogDB {
  return blog.status === BlogStatus.Draft && !("title" in blog);
}

export function isPublishedBlog(blog: BlogDB): blog is PublishedBlogDB {
  return blog.status !== BlogStatus.Draft && !("draftTitle" in blog);
}

export function isPublishedBlogEditing(
  blog: BlogDB
): blog is PublishedBlogEditingDB {
  return blog.status !== BlogStatus.Draft && "draftTitle" in blog;
}

// Conversion functions
export function dbToBlogFormData(dbBlog: BlogDB): BlogFormData {
  if (isDraftBlog(dbBlog)) {
    // Pure draft blog
    return {
      ...dbBlog,
      draftContent: dbBlog.draftContent
        ? JSON.parse(dbBlog.draftContent)
        : null,
      hasDraftChanges: true,
    };
  }

  if (isPublishedBlogEditing(dbBlog)) {
    // Published blog with draft fields (being edited)
    return {
      ...dbBlog,
      draftContent: JSON.parse(dbBlog.draftContent),
      content: JSON.parse(dbBlog.content),
      hasDraftChanges: true,
    };
  }

  // Published blog without draft fields - populate drafts from published
  const publishedBlog = dbBlog as PublishedBlogDB;
  return {
    ...publishedBlog,
    // Populate draft fields from published fields
    draftTitle: publishedBlog.title,
    draftDescription: publishedBlog.description,
    draftTags: publishedBlog.tags,
    draftSocialTitle: publishedBlog.socialTitle,
    draftFeaturedImageUrl: publishedBlog.featuredImageUrl,
    draftRecommendationTitle: publishedBlog.recommendationTitle,
    draftContent: JSON.parse(publishedBlog.content),
    draftEstReadTime: publishedBlog.estReadTime,

    content: JSON.parse(publishedBlog.content),
    hasDraftChanges: false,
  };
}

export function blogFormDataToDB(
  formData: BlogFormData,
  doCleanPublish: boolean = false
): BlogDB {
  if (formData.status === BlogStatus.Draft) {
    // Draft blog - only save draft fields
    return {
      blogId: formData.blogId,
      type: formData.type,
      link: formData.link,
      status: BlogStatus.Draft,
      draftTitle: formData.draftTitle,
      draftDescription: formData.draftDescription,
      draftTags: formData.draftTags,
      draftSocialTitle: formData.draftSocialTitle,
      draftFeaturedImageUrl: formData.draftFeaturedImageUrl,
      draftRecommendationTitle: formData.draftRecommendationTitle,
      draftContent: JSON.stringify(formData.draftContent),
      draftEstReadTime: formData.draftEstReadTime,

      createdAt: formData.createdAt!,
      updatedAt: formData.updatedAt!,
    } as DraftBlogDB;
  }

  if (doCleanPublish) {
    // Clean published blog - no draft fields
    return {
      blogId: formData.blogId,
      type: formData.type,
      link: formData.link,
      status: formData.status,
      title: formData.title!,
      description: formData.description!,
      tags: formData.tags!,
      content: JSON.stringify(formData.content!),
      estReadTime: formData.estReadTime!,
      recommendations: formData.recommendations!,
      stats: formData.stats!,
      createdAt: formData.createdAt!,
      updatedAt: formData.updatedAt!,
      socialTitle: formData.socialTitle!,
      featuredImageUrl: formData.featuredImageUrl!,
      recommendationTitle: formData.recommendationTitle!,
      publishedAt: formData.publishedAt!,
    } as PublishedBlogDB;
  }
  // Published blog being edited - save both published and draft fields
  return {
    ...formData,
    content: JSON.stringify(formData.content!),
    draftContent: JSON.stringify(formData.draftContent),
  } as PublishedBlogEditingDB;
}

export function createNewBlogFormData(title?: string): BlogFormData {
  return {
    blogId: randomUUID(),
    type: BlogType.Article,
    link: "",
    status: BlogStatus.Draft,

    draftTitle: title || `Untitled Blog ${new Date().toLocaleDateString()}`,
    draftDescription: "",
    draftTags: [],
    draftSocialTitle: "",
    draftFeaturedImageUrl: "",
    draftRecommendationTitle: "Keep reading...",
    draftContent: null,
    draftEstReadTime: 0,

    hasDraftChanges: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// Publish draft (promote draft fields to published fields)
export function draftToPublishedBlog(formData: BlogFormData): BlogFormData {
  return {
    ...formData,
    status: BlogStatus.Active,
    title: formData.draftTitle,
    description: formData.draftDescription,
    tags: formData.draftTags,
    socialTitle: formData.draftSocialTitle,
    featuredImageUrl: formData.draftFeaturedImageUrl,
    recommendationTitle: formData.draftRecommendationTitle,
    content: formData.draftContent!,
    estReadTime: formData.draftEstReadTime,
    updatedAt: Date.now(),
    publishedAt: formData.publishedAt || Date.now(),
    link: formData.link || slugify(formData.draftTitle),
    recommendations: [],
    stats: {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
    },
  };
}

export const sendRevalidateRequest = async (path: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BLOG_ORIGIN}/api/revalidate`, {
    method: "POST",
    body: JSON.stringify({ path: `/blogs/${path}` }),
    headers: {
      "Content-Type": "application/json",
      acs_tkn: env.SERVER_TOKEN,
    },
  });
  if (env.RUNTIME === "local") {
    console.log(res.status, res.statusText);
  }
};
