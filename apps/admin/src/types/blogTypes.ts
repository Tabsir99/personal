import type { JSONContent } from "@tiptap/react";

export enum BlogType {
  Article = "Article",
  NewsArticle = "NewsArticle",
  BlogPosting = "BlogPosting",
}

export enum BlogStatus {
  Active = "active",
  Inactive = "inactive",
  Draft = "draft",
}

interface BlogStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

interface BlogContent {
  title: string;
  description: string;
  tags: string[];
  socialTitle: string;
  featuredImageUrl: string;
  recommendationTitle: string;
  estReadTime: number;
}

// Base properties (metadata)
export interface BaseBlogProperties extends BlogContent {
  blogId: string;
  type: BlogType;
  link: string;
  createdAt: number;
  updatedAt: number;
}

// BLOGS_DRAFT collection
export interface BlogDraftDB extends BaseBlogProperties {
  parentBlogId: string | null;
  status: BlogStatus.Draft;
  content: string; // JSON string
}

// BLOGS collection
export interface PublishedBlogDB extends BaseBlogProperties {
  status: BlogStatus.Active | BlogStatus.Inactive;
  content: string; // JSON string
  recommendations: string[];
  stats: BlogStats;
  publishedAt: number;
}

// Client form data
export interface BlogFormData extends BaseBlogProperties {
  parentBlogId: string | null;
  content: JSONContent | null;
  publishedVersion?: BlogContent & {
    content: JSONContent;
    publishedAt: number;
  };
  hasDraftChanges: boolean;
}

export interface ValidLinks {
  categoryLinks: string[];
  blogLinks: string[];
}

export interface SiteMapLinks {
  blogLinks: {
    link: string;
    updatedAt: any;
  }[];
}
