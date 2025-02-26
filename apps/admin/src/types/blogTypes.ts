import { JSONContent } from "@tiptap/react";
import { PageMetrics } from "./dashboardTypes";

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

// Convert string literal to enum for consistency
export enum CategoryStatus {
  Active = "active",
  Inactive = "inactive",
}

// Base interface for shared blog properties
export interface BaseBlogData {
  blogId: string;
  blogName: string;
  categoryId: string;
  type: BlogType;
  status: BlogStatus;
  link: string;
}

// Improved metadata interface with proper types
export interface BlogMetadata {
  blogDescription: string; // SEO meta description
  blogTags: string[]; // Content categorization tags
  createdAt: string; // Publication timestamp
  updatedAt: string; // Last modification timestamp
  estReadTime: number; // Estimated reading time in minutes
  recommendationTitle: string; // Title used in recommendation sections
  socialTitle: string; // Title optimized for social media sharing
  featuredImageUrl: string; // Image for thumbnails and social sharing
}

export interface BlogStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
}

// Main blog interface extending the base
export interface Blog extends BaseBlogData {
  content: string; // Full HTML/Markdown blog content
  recommendations: string[]; // Array of related blog IDs
  blogMetadata: BlogMetadata;
  blogStats: BlogStats;
}

// Admin-specific category management
export interface BlogCategory {
  categoryId: string;
  categoryName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: CategoryStatus;
  totalPosts: number; // Calculated field showing posts in category
}

// Interface for blog draft/creation forms

export interface BlogFormData extends BaseBlogData {
  blogDescription: string;
  blogTags: string[];
  recommendationTitle: string;
  socialTitle: string;
  featuredImageUrl: string;
  estReadTime: number | null;
  content: JSONContent | null;
}

// Admin dashboard blog list item
export interface AdminBlogListItem extends BaseBlogData {
  createdAt: string;
  featuredImageUrl: string;
  pageMetrics: PageMetrics;
}

// // Detailed admin view of a blog
// export interface AdminBlogDetail extends Blog {
//   pageMetrics: PageMetrics;
//   publishHistory: {
//     publishedAt: string | Date;
//     version: number;
//   }[];
// }
