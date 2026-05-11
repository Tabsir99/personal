import { z } from "zod";
import type { DocContent } from "@open-notion/editor";

// ============================================================================
// ENUMS (defined in zod, source of truth)
// ============================================================================

export const blogStatusSchema = z.enum([
  "published",
  "unpublished",
  "draft",
  "archived",
]);
export type BlogStatus = z.infer<typeof blogStatusSchema>;
export const BlogStatus = blogStatusSchema.enum;

// ============================================================================
// EDITOR CONTENT (opaque object from @open-notion/editor)
// ============================================================================

export const docContentSchema = z.custom<DocContent>(
  (v) => typeof v === "object" && v !== null,
  { message: "Invalid editor content" },
);

// ============================================================================
// BLOG SCHEMAS
// ============================================================================

export const blogStatsSchema = z.object({
  views: z.number().default(0),
  likes: z.number().default(0),
  comments: z.number().default(0),
  shares: z.number().default(0),
});
export type BlogStats = z.infer<typeof blogStatsSchema>;

export const blogUserMetaSchema = z.object({
  title: z.string(),
  dek: z.string().default(""),
  excerpt: z.string().default(""),
  tags: z.array(z.string()).default([]),
  coverImageUrl: z.string().default(""),
  seoTitle: z.string().default(""),
  metaDescription: z.string().default(""),
  socialTitle: z.string().default(""),
  socialDescription: z.string().default(""),
  readTime: z.number().default(0),
});
export type BlogUserMeta = z.infer<typeof blogUserMetaSchema>;

export const blogSystemMetaSchema = z.object({
  blogId: z.string().min(1),
  kind: z.string().min(1),
  schemaType: z.string().min(1),
  slug: z.string().default(""),
  createdAt: z.number(),
  updatedAt: z.number(),
  featuredAt: z.number().nullable().default(null),
});
export type BlogSystemMeta = z.infer<typeof blogSystemMetaSchema>;

export const baseBlogPropertiesSchema = z.object({
  ...blogUserMetaSchema.shape,
  ...blogSystemMetaSchema.shape,
});
export type BaseBlogProperties = z.infer<typeof baseBlogPropertiesSchema>;

export const blogDraftDBSchema = z.object({
  ...baseBlogPropertiesSchema.shape,
  parentBlogId: z.string().nullable(),
  status: z.literal(BlogStatus.draft),
  content: z.string(),
});
export type BlogDraftDB = z.infer<typeof blogDraftDBSchema>;

export const publishedBlogDBSchema = z.object({
  ...baseBlogPropertiesSchema.shape,
  status: z.union([
    z.literal(BlogStatus.published),
    z.literal(BlogStatus.unpublished),
    z.literal(BlogStatus.archived),
  ]),
  content: z.string(),
  recommendedBlogIds: z.array(z.string()).default([]),
  stats: blogStatsSchema,
  publishedAt: z.number(),
});
export type PublishedBlogDB = z.infer<typeof publishedBlogDBSchema>;

export const blogFormDataSchema = z.object({
  ...baseBlogPropertiesSchema.shape,
  parentBlogId: z.string().nullable(),
  content: docContentSchema,
  hasDraftChanges: z.boolean().default(true),
  publishedVersion: z
    .object({
      ...blogUserMetaSchema.shape,
      content: docContentSchema,
      publishedAt: z.number(),
    })
    .optional(),
});
export type BlogFormData = z.infer<typeof blogFormDataSchema>;

// ============================================================================
// ANCILLARY SHAPES
// ============================================================================

export const validLinksSchema = z.object({
  categoryLinks: z.array(z.string()).default([]),
  blogLinks: z.array(z.string()).default([]),
});
export type ValidLinks = z.infer<typeof validLinksSchema>;

export const siteMapLinksSchema = z.object({
  blogLinks: z
    .array(
      z.object({
        link: z.string(),
        updatedAt: z.unknown(),
      }),
    )
    .default([]),
});
export type SiteMapLinks = z.infer<typeof siteMapLinksSchema>;
