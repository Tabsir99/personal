import type { DocContent } from "@open-notion/serializers";
import type { ApiResponse, CursorPage } from "@tabsircg/schemas/api";
import type { PublishedBlogDB } from "@tabsircg/schemas/blog";
import type { SiteConfig } from "@tabsircg/schemas/site";
import { env } from "@/config/env";

// The /api/blogs list endpoint returns these fields per item.
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

// UI view-types — derived from wire shapes.
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

const ADMIN_HEADERS = { serverToken: env.SERVER_TOKEN } as const;

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${env.ADMIN_ORIGIN}${path}`, {
      headers: ADMIN_HEADERS,
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

// Single-document fetch — used by the /blog index for the featured slot.
export async function getFeaturedBlog(): Promise<PostMeta | null> {
  const blog = await fetchJson<PublishedBlogDB | null>("/api/blogs/featured");
  if (!blog) return null;
  return toPostMeta(blog);
}

// Single page — used by the /blog index for the regular list.
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
  );
  if (!page) return { items: [], nextCursor: null };
  return { items: page.items.map(toPostMeta), nextCursor: page.nextCursor };
}

// Walks all pages — used by sitemap and getPost (prev/next neighbours).
// Acceptable up to ~100 published blogs; past that, swap in a navigation index.
export async function getAllBlogs(): Promise<PostMeta[]> {
  const all: PostMeta[] = [];
  let cursor: string | undefined = undefined;
  // Hard cap to avoid runaway loops on a misbehaving server.
  for (let safety = 0; safety < 50; safety++) {
    const page = await getRecentBlogs(50, cursor);
    all.push(...page.items);
    if (!page.nextCursor) break;
    cursor = page.nextCursor;
  }
  return all;
}

export async function getPost(slug: string): Promise<Post | null> {
  const [blog, list] = await Promise.all([
    fetchJson<PublishedBlogDB>(`/api/blogs/${encodeURIComponent(slug)}`),
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
}

export async function getSiteConfig(): Promise<SiteConfig | null> {
  return fetchJson<SiteConfig>("/api/site-config");
}

export async function getBlogTags(): Promise<string[]> {
  const cfg = await fetchJson<{ tags: string[] }>("/api/config");
  return ["all", ...(cfg?.tags ?? [])];
}

export async function getPostScore(slug: string): Promise<number> {
  const r = await fetchJson<{ score: number }>(
    `/api/blogs/${encodeURIComponent(slug)}/score`,
  );
  return r?.score ?? 0;
}
