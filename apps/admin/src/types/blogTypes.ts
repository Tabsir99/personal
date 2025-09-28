import { JSONContent } from "@tiptap/react";

// Standardized enum naming using PascalCase consistently
// export enum BlogType {
//   Article = "Article",
//   NewsArticle = "NewsArticle",
//   BlogPosting = "BlogPosting",
// }

// export enum BlogStatus {
//   Active = "active",
//   Inactive = "inactive",
//   Draft = "draft",
// }

// // Base interface for shared blog properties
// export interface BaseBlogData {
//   blogId: string;
//   type: BlogType;
//   link: string;
//   status: BlogStatus;
// }

// export interface BlogStats {
//   totalViews: number;
//   totalLikes: number;
//   totalComments: number;
//   totalShares: number;
// }

// // Main blog interface extending the base
// export interface Blog extends BaseBlogData {
//   title: string;
//   description: string; // SEO meta description
//   tags: string[]; // Content categorization tags
//   socialTitle: string; // Title for social media sharing
//   featuredImageUrl: string; // Image for thumbnails and social sharing
//   recommendationTitle: string; // Title used in recommendation sections
//   content: string; // Full Tiptap JSONContent but as a string
//   estReadTime: number; // In Minutes

//   recommendations: string[]; // Array of related blog IDs
//   stats: BlogStats;

//   createdAt: number; // Publication timestamp
//   updatedAt: number; // Last modification timestamp

//   draftTitle?: string;
//   draftDescription?: string;
//   draftTags?: string[];
//   draftSocialTitle?: string;
//   draftFeaturedImageUrl?: string;
//   draftRecommendationTitle?: string;
//   draftContent?: string;
//   draftEstReadTime?: number;
// }

// export type BlogFields = keyof Blog;

// // Interface for blog draft/creation forms
// export interface BlogFormData extends BaseBlogData {
//   draftTitle: string;
//   draftDescription: string;
//   draftTags: string[];
//   draftSocialTitle: string;
//   draftFeaturedImageUrl: string;
//   draftRecommendationTitle: string;
//   draftContent: JSONContent | null;
//   draftEstReadTime: number;

//   title?: string;
//   description?: string;
//   tags?: string[];
//   socialTitle?: string;
//   featuredImageUrl?: string;
//   recommendationTitle?: string;
//   content?: JSONContent;
//   estReadTime?: number;
// }

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
