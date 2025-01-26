import { PageMetrics } from "./dashboardTypes";

export interface BlogMetadata {
  blogDescription: string; // This is basically meta description as well
  blogTags: string[];
  createdAt: any;
  estReadTime: string; // In Minutes
  updatedAt: any;
  recommendationTitle: string;
  socialTitle: string; // Meta title but for social media platforms
  thumbnailUrl: string; // Meta image
}

export interface BlogStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
}
export type BlogStatus = "active" | "inactive" | "draft";

export interface Blog {
  blogName: string;
  type: "Article" | "blogpost";
  link: string;
  content: string;
  categoryId: string;
  status: BlogStatus;
  recommendations?: string[];
  blogMetadata: BlogMetadata;
  blogStats: BlogStats;
}

export interface BlogCategory {
  categoryId: string;
  categoryName: string;
  description: string;
  createdAt: any;
  status: "active" | "inactive";
  totalPosts: number;
  updatedAt: any;
}

export interface UnstructuredBlogData {
  blogName: string;
  blogDescription: string;
  blogTags: string[];
  categoryId: string;
  recommendationTitle: string;
  socialTitle: string;
  thumbnailUrl: string;
  type: string;
  createdAt: string;
  estReadTime: string;
}

export type CategoryStatus = "active" | "inactive";

export interface AdminBlogMetadata {
  blogName: string;
  categoryId: string;
  createdAt: string;
  link: string;
  status: BlogStatus;
  pageMetrics: PageMetrics;
  thumbnailUrl: string
}
