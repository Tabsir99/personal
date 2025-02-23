import {
  AdminBlogListItem,
  Blog,
  BlogFormData,
  BlogStatus,
  BlogType,
} from "@/types/blogTypes";
import { load } from "cheerio";
import { randomUUID } from "crypto";

type ResponseStatus = "success" | "error" | "fail";

export interface ApiResponse<T> {
  status: ResponseStatus;
  data: T | null;
  message: string;
}

export const formatResponse = <T>({
  status = "success" as ResponseStatus,
  data,
  message = "",
}): ApiResponse<T> => {
  return {
    status,
    data,
    message,
  };
};

export const Collections = {
  DRAFTS: "draft_blogs",
  CATEGORY_METADATA: "category-metadata",
  STATS: {
    collectionName: "stats",
    documents: {
      DASHBOARD: "dashboard",
    },
    DAILY_STATS: "daily-stats",
    MONTHLY_STATS: "monthly-stats",
  },
  VALID_LINKS: "valid-links",
  USERS: "users",
  PAGE_METRICS: "page-metrics",
  BLOG_METADATA: "blog-metadata",
  SESSIONS: "sessions",
};

export const env = {
  BLOGSITE_HOSTNAME: process.env.NEXT_PUBLIC_BLOGSITE_HOSTNAME as string,
  ADMIN_ORIGIN: process.env.ADMIN_ORIGIN as string,
};

export const measureEstReadTime = (blogText = "") => {
  const textsLength = blogText
    .trim()
    .split(/\s+/)
    .filter((word) => {
      const isLessThanTwoCharacters = word.length < 3;
      return !isLessThanTwoCharacters;
    }).length;

  const estReadTime = Math.ceil(textsLength / 230);

  return estReadTime;
};

export const buildBlog = (
  blogFormData: BlogFormData,
  isDraft: boolean,
  blogId?: string
): Blog => {
  if (!blogFormData.content) throw new Error("There is no blog content");
  const $ = load(blogFormData.content);
  return {
    blogId: blogId || randomUUID(),
    blogMetadata: {
      blogDescription: blogFormData.blogDescription,

      blogTags: blogFormData.blogTags,
      createdAt: new Date().toISOString(),
      estReadTime: measureEstReadTime($("body").text()),
      recommendationTitle: blogFormData.recommendationTitle,
      socialTitle: blogFormData.socialTitle,
      featuredImageUrl: blogFormData.featuredImageUrl,
      updatedAt: new Date().toISOString(),
    },
    blogName: blogFormData.blogName,
    content: blogFormData.content,
    type: BlogType.Article,
    status: isDraft ? BlogStatus.Draft : BlogStatus.Active,
    categoryId: blogFormData.categoryId,
    link: encodeURIComponent(
      blogFormData.blogName.trim().toLowerCase().replace(/\s/g, "-")
    ),
    recommendations: [],
    blogStats: {
      totalComments: 0,
      totalLikes: 0,
      totalShares: 0,
      totalViews: 0,
    },
  };
};

export async function fetcher({
  url,
  method = "POST",
  body,
}: {
  url: string;
  method?: "GET" | "POST" | "DELETE" | "PUT";
  body?: string | File;
}) {
  return fetch(url, {
    method: method,
    ...(body && { body }),
    headers: {
      ...(method !== "GET" && { "Content-Type": "application/json" }),
      origin: env.ADMIN_ORIGIN,
      acc_tkn: process.env.ACCESS_TOKEN as string,
    },
  });
}

export function buildAdminBlog(
  blog: Blog,
  shouldUpdate: boolean
): Partial<AdminBlogListItem> {
  return {
    blogName: blog.blogName,
    categoryId: blog.categoryId,
    link: blog.link,
    status: blog.status,
    blogId: blog.blogId,
    createdAt: blog.blogMetadata.createdAt,
    type: blog.type,
    featuredImageUrl: blog.blogMetadata.featuredImageUrl,
    ...(!shouldUpdate && {
      pageMetrics: {
        totalVisitors: 0,
        uniqueVisitoris: 0,
        timeOnPage: {
          totalTime: 0,
          timeRange: {
            "0-30": 0,
            "120+": 0,
            "30-60": 0,
            "60-120": 0,
          },
        },
        blogMetrics: {
          totalComments: 0,
          totalLikes: 0,
          totalShares: 0,
          totalDepthScrolled: 0,
          clickThroughRate: {
            totalClicks: 0,
            totalVisibility: 0,
          },
        },
      },
    }),
  };
}
