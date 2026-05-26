import type { DocContent } from "@open-notion/serializers";
import type { ApiResponse, CursorPage } from "@tabsircg/schemas/api";
import type { PublishedBlogDB } from "@tabsircg/schemas/blog";
import type { SiteConfig } from "@tabsircg/schemas/site";
import { cache } from "react";
import { env } from "@/config/env";

// Mirrors `fieldsToRead` in apps/admin/src/app/api/blogs/route.ts.
type BlogListItem = Pick<
  PublishedBlogDB,
  | "blogId"
  | "title"
  | "dek"
  | "excerpt"
  | "seoTitle"
  | "tags"
  | "coverImageUrl"
  | "readTime"
  | "metaDescription"
  | "featuredAt"
  | "stats"
  | "createdAt"
  | "updatedAt"
  | "publishedAt"
  | "slug"
  | "status"
  | "kind"
  | "schemaType"
>;

export interface Neighbour {
  slug: string;
  title: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  dek: string;
  excerpt: string;
  tags: string[];
  kind: string;
  date: string;
  updatedAtIso: string;
  readTime: number;
  featuredAt: number | null;
  publishedAt: number;
  updatedAt: number;
  coverImageUrl: string;
}

export type Post = PostMeta & {
  body: DocContent;
  prev: Neighbour | null;
  next: Neighbour | null;
};

export const KIND_LABEL: Record<PostMeta["kind"], string> = {
  essay: "essay",
  "deep-dive": "deep-dive",
  "war-story": "war story",
  notes: "notes",
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const ADMIN_HEADERS = { serverToken: env.SERVER_TOKEN } as const;

// ISR: responses are stored in the data cache (force-cache) and revalidated
// on-demand by tag. Admin POSTs the matching tags to /api/revalidate after a
// mutation (see apps/admin/src/lib/blogUtils.ts → revalidateBlog).
async function fetchJson<T>(path: string, tags: string[]): Promise<T | null> {
  try {
    const res = await fetch(`${env.ADMIN_ORIGIN}${path}`, {
      headers: ADMIN_HEADERS,
      cache: "force-cache",
      next: { tags },
    });
    const json = (await res.json()) as ApiResponse<T>;
    if (json.status === "error") return null;
    return json.data;
  } catch (err) {
    console.error(`fetch ${path} failed:`, err);
    return null;
  }
}

const toIsoDate = (ms: number) => new Date(ms).toISOString();

const toPostMeta = (b: BlogListItem): PostMeta => ({
  slug: b.slug,
  title: b.title,
  dek: b.dek,
  excerpt: b.excerpt || b.dek,
  tags: b.tags,
  kind: b.kind,
  date: toIsoDate(b.publishedAt),
  updatedAtIso: toIsoDate(b.updatedAt),
  readTime: b.readTime,
  featuredAt: b.featuredAt ?? null,
  publishedAt: b.publishedAt,
  updatedAt: b.updatedAt,
  coverImageUrl: b.coverImageUrl,
});

const toNeighbour = ({ slug, title }: PostMeta): Neighbour => ({ slug, title });

export async function getFeaturedBlog(): Promise<PostMeta | null> {
  const blog = await fetchJson<PublishedBlogDB | null>(
    "/api/blogs/featured",
    ["blogs"],
  );
  if (!blog) return null;
  return toPostMeta(blog);
}

export async function getRecentBlogs(
  limit: number = 30,
  cursor?: string,
): Promise<{ items: PostMeta[]; nextCursor: string | null }> {
  const params = new URLSearchParams({
    status: "published",
    limit: String(limit),
  });
  if (cursor) params.set("cursor", cursor);
  const page = await fetchJson<CursorPage<BlogListItem>>(
    `/api/blogs?${params.toString()}`,
    ["blogs"],
  );
  if (!page) return { items: [], nextCursor: null };
  return { items: page.items.map(toPostMeta), nextCursor: page.nextCursor };
}

// Acceptable up to ~100 published blogs; past that, swap in a nav index.
// cache() dedupes the page-walk within a single request render.
export const getAllBlogs = cache(async (): Promise<PostMeta[]> => {
  const all: PostMeta[] = [];
  let cursor: string | undefined = undefined;
  for (let safety = 0; safety < 50; safety++) {
    const page = await getRecentBlogs(50, cursor);
    all.push(...page.items);
    if (!page.nextCursor) break;
    cursor = page.nextCursor;
  }
  return all;
});

// cache() dedupes getPost across generateMetadata + the page render.
export const getPost = cache(async (slug: string): Promise<Post | null> => {
  const [blog, list] = await Promise.all([
    fetchJson<PublishedBlogDB>(`/api/blogs/${encodeURIComponent(slug)}`, [
      "blogs",
      `blog:${slug}`,
    ]),
    getAllBlogs(),
  ]);
  if (!blog) return null;

  const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));
  const idx = sorted.findIndex((p) => p.slug === slug);
  const next = idx > 0 ? toNeighbour(sorted[idx - 1]) : null;
  const prev =
    idx >= 0 && idx < sorted.length - 1 ? toNeighbour(sorted[idx + 1]) : null;

  let body: DocContent;
  try {
    body = JSON.parse(blog.content) as DocContent;
  } catch {
    body = { type: "doc", content: [] } as unknown as DocContent;
  }

  return {
    slug: blog.slug,
    title: blog.title,
    dek: blog.dek,
    excerpt: blog.excerpt || blog.dek,
    tags: blog.tags,
    kind: blog.kind,
    date: toIsoDate(blog.publishedAt),
    updatedAtIso: toIsoDate(blog.updatedAt),
    readTime: blog.readTime,
    featuredAt: blog.featuredAt ?? null,
    publishedAt: blog.publishedAt,
    updatedAt: blog.updatedAt,
    coverImageUrl: blog.coverImageUrl,
    body,
    prev,
    next,
  };
});

export async function getSiteConfig(): Promise<SiteConfig | null> {
  return fetchJson<SiteConfig>("/api/site-config", ["site-config"]);
}

export async function getBlogTags(): Promise<string[]> {
  const cfg = await fetchJson<{ tags: string[] }>("/api/config", [
    "blog-config",
  ]);
  return ["all", ...(cfg?.tags ?? [])];
}
