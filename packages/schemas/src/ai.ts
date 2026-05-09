import { z } from "zod";

export const aiBlogMetadataSchema = z.object({
  title: z.string().min(1).max(120),
  dek: z.string().max(200),
  excerpt: z.string().max(280),
  seoTitle: z.string().max(60),
  metaDescription: z.string().max(160),
  socialTitle: z.string().max(70),
  socialDescription: z.string().max(200),
  tags: z.array(z.string()).max(5).default([]),
});

export type AIBlogMetadata = z.infer<typeof aiBlogMetadataSchema>;
