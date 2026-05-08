import { DocContent } from "@open-notion/editor";

export enum BlogType {
  Article = "Article",
  NewsArticle = "NewsArticle",
  BlogPosting = "BlogPosting",
}

export enum BlogStatus {
  Published = "published",
  Unpublished = "unpublished",
  Draft = "draft",
  Archived = "archived",
}

interface BlogStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

// Editorial content authored by the user
export interface BlogUserMeta {
  title: string;
  dek: string; // subtitle/hook shown below title
  tags: string[];
  coverImageUrl: string;

  // SEO
  seoTitle: string;
  metaDescription: string;

  // Social (OG/Twitter)
  socialTitle: string;
  socialDescription: string;

  // Misc
  readTime: number;
}

// System-level metadata (not authored, set by app/db)
export interface BlogSystemMeta {
  blogId: string;
  type: BlogType;
  slug: string;
  createdAt: number;
  updatedAt: number;
}

// Base = content + system meta
export interface BaseBlogProperties extends BlogUserMeta, BlogSystemMeta {}

// BLOGS_DRAFT collection
export interface BlogDraftDB extends BaseBlogProperties {
  parentBlogId: string | null;
  status: BlogStatus.Draft;
  content: string; // JSON string of DocContent
}

// BLOGS collection
export interface PublishedBlogDB extends BaseBlogProperties {
  status: BlogStatus.Published | BlogStatus.Unpublished | BlogStatus.Archived;
  content: string; // JSON string of DocContent
  recommendedBlogIds: string[];
  stats: BlogStats;
  publishedAt: number;
}

// Client form data
export interface BlogFormData extends BaseBlogProperties {
  parentBlogId: string | null;
  content: DocContent | null;
  publishedVersion?: BlogUserMeta & {
    content: DocContent;
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
