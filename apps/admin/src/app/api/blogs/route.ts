import { z } from "zod";
import { readNDocs } from "@/lib/commonQuery";
import { PublishedBlogDB } from "@tabsircg/schemas/blog";
import type { CursorPage } from "@tabsircg/schemas/api";
import { wrapRoute } from "@/lib/appUtils";
import { NextRequest } from "next/server";

const blogStatusFilterSchema = z.enum([
  "published",
  "unpublished",
  "archived",
  "draft",
]);

const orderByFieldSchema = z
  .enum(["createdAt", "updatedAt", "publishedAt"])
  .default("createdAt");

const querySchema = z.object({
  status: blogStatusFilterSchema.optional(),
  kind: z.string().optional(),
  schemaType: z.string().optional(),
  tag: z.string().optional(),
  cursor: z.string().nullable().default(null),
  limit: z.coerce.number().int().positive().max(50).default(30),
  orderBy: orderByFieldSchema,
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const GET = wrapRoute(async (request: NextRequest) => {
  const query = request.nextUrl.searchParams;
  const parsed = querySchema.parse({
    status: query.get("status") ?? undefined,
    kind: query.get("kind") ?? undefined,
    schemaType: query.get("schemaType") ?? undefined,
    tag: query.get("tag") ?? undefined,
    cursor: query.get("cursor"),
    limit: query.get("limit") ?? undefined,
    orderBy: query.get("orderBy") ?? undefined,
    order: query.get("order") ?? undefined,
  });

  const filters: Record<string, unknown> = {};
  if (parsed.status) filters.status = parsed.status;
  if (parsed.kind) filters.kind = parsed.kind;
  if (parsed.schemaType) filters.schemaType = parsed.schemaType;

  const items = await readNDocs<PublishedBlogDB>({
    collectionName: "BLOGS",
    limit: parsed.limit,
    cursorValue: parsed.cursor,
    filters,
    ...(parsed.tag ? { arrayContainsFilters: { tags: parsed.tag } } : {}),
    fieldsToRead: {
      blogId: true,
      title: true,
      dek: true,
      excerpt: true,
      seoTitle: true,
      tags: true,
      coverImageUrl: true,
      readTime: true,
      metaDescription: true,
      featuredAt: true,
      stats: true,
      createdAt: true,
      updatedAt: true,
      publishedAt: true,
      slug: true,
      status: true,
      kind: true,
      schemaType: true,
    },
    orderBy: {
      field: parsed.orderBy,
      order: parsed.order,
    },
  });

  const last = items[items.length - 1];
  const nextCursor =
    items.length === parsed.limit
      ? `${last[parsed.orderBy]}__${last.blogId}`
      : null;

  const page: CursorPage<PublishedBlogDB> = { items, nextCursor };
  return page;
});
