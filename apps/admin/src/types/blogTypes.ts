import { JSONContent } from "@tiptap/react";

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
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
}

// Base properties
interface BaseBlogProperties {
  blogId: string;
  type: BlogType;
  link: string;
  status: BlogStatus;

  createdAt: number;
  updatedAt: number;
}

// Draft blog (DB format) - only has draft fields
export interface DraftBlogDB extends BaseBlogProperties {
  status: BlogStatus.Draft;
  draftTitle: string;
  draftDescription: string;
  draftTags: string[];
  draftSocialTitle: string;
  draftFeaturedImageUrl: string;
  draftRecommendationTitle: string;
  draftContent: string; // JSON string
  draftEstReadTime: number;
}

// Published blog (DB format) - only has published fields
export interface PublishedBlogDB extends BaseBlogProperties {
  status: BlogStatus.Active | BlogStatus.Inactive;
  title: string;
  description: string;
  tags: string[];
  socialTitle: string;
  featuredImageUrl: string;
  recommendationTitle: string;
  content: string; // JSON string
  estReadTime: number;
  recommendations: string[];
  stats: BlogStats;
  publishedAt?: number;
}

// Published blog being edited (DB format) - has both published and draft fields
export interface PublishedBlogEditingDB extends PublishedBlogDB {
  draftTitle: string;
  draftDescription: string;
  draftTags: string[];
  draftSocialTitle: string;
  draftFeaturedImageUrl: string;
  draftRecommendationTitle: string;
  draftContent: string; // JSON string
  draftEstReadTime: number;
}

// Union type for what we get from DB
export type BlogDB = DraftBlogDB | PublishedBlogDB | PublishedBlogEditingDB;

// Client-side format - ALWAYS has draft fields (what user edits)
export interface BlogFormData
  extends Omit<BaseBlogProperties, "createdAt" | "updatedAt"> {
  // Draft fields (always present for editing)
  draftTitle: string;
  draftDescription: string;
  draftTags: string[];
  draftSocialTitle: string;
  draftFeaturedImageUrl: string;
  draftRecommendationTitle: string;
  draftContent: JSONContent | null;
  draftEstReadTime: number;

  // Published fields (only if it was published before)
  title?: string;
  description?: string;
  tags?: string[];
  socialTitle?: string;
  featuredImageUrl?: string;
  recommendationTitle?: string;
  content?: JSONContent;
  estReadTime?: number;
  recommendations?: string[];
  stats?: BlogStats;
  createdAt?: number;
  updatedAt?: number;
  publishedAt?: number;

  // UI state
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
