import {
  AdminBlogMetadata,
  Blog,
  UnstructuredBlogData,
} from "@/types/blogTypes";

type ResponseStatus = "success" | "error" | "fail";

export interface ApiResponse<T> {
  status: ResponseStatus;
  data: T | null;
  message: string;
}

export const formatResponse = <T>(
  status: ResponseStatus,
  data: T | null = null,
  message: string = ""
): ApiResponse<T> => {
  return {
    status,
    data,
    message,
  };
};

export const Collections = {
  BLOGS: "blogs",
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

  return `${estReadTime}`;
};

export const buildBlog = (
  blogData: UnstructuredBlogData,
  content: string,
  estReadTime: string
): Blog => {
  return {
    blogMetadata: {
      blogDescription: blogData.blogDescription,

      blogTags: blogData.blogTags,
      createdAt: blogData.createdAt,
      estReadTime: estReadTime,
      recommendationTitle: blogData.recommendationTitle,
      socialTitle: blogData.socialTitle,
      thumbnailUrl: blogData.thumbnailUrl,
      updatedAt: blogData.createdAt,
    },
    blogName: blogData.blogName,
    content: content,
    type: "Article",
    status: "active",
    categoryId: blogData.categoryId,
    link: "",
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
): AdminBlogMetadata | Partial<AdminBlogMetadata> {
  return {
    blogName: blog.blogName,
    categoryId: blog.categoryId,
    createdAt: blog.blogMetadata.createdAt,
    link: blog.link,
    status: blog.status,
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
