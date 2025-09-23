import { JSONContent } from "@tiptap/react";

// Standardized enum naming using PascalCase consistently
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

// Base interface for shared blog properties
export interface BaseBlogData {
  blogId: string;
  blogName: string;
  type: BlogType;
  status: BlogStatus;
  link: string;

  estReadTime: number; // In Minutes

  blogDescription: string; // SEO meta description
  blogTags: string[]; // Content categorization tags
  recommendationTitle: string; // Title used in recommendation sections
  socialTitle: string; // Title for social media sharing
  featuredImageUrl: string; // Image for thumbnails and social sharing

  draftTitle?: string;
  draftDescription?: string;
  lastDraftSave?: number;
}

export interface BlogStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
}

// Main blog interface extending the base
export interface Blog extends BaseBlogData {
  content: string; // Full Tiptap JSONContent but as a string
  draftContent?: string;

  recommendations: string[]; // Array of related blog IDs
  blogStats: BlogStats;

  createdAt: number; // Publication timestamp
  updatedAt: number; // Last modification timestamp

  hasDraftChanges: boolean;
}

export type BlogFields = keyof Blog;

// Interface for blog draft/creation forms
export interface BlogFormData extends BaseBlogData {
  content: JSONContent | null;
  draftContent?: JSONContent;

  createdAt?: number; // Publication timestamp
  updatedAt?: number; // Last modification timestamp
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
