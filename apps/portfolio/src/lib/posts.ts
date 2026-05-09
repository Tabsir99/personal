import type { DocContent } from "@open-notion/editor";
import type { ApiResponse } from "@tabsircg/schemas/api";
import type { BlogKind, PublishedBlogDB } from "@tabsircg/schemas/blog";
import { env } from "@/config/env";

// The /api/blogs list endpoint returns these fields per item.
// Mirrors `fieldsToRead` in apps/admin/src/app/api/blogs/route.ts.
type BlogListItem = Pick<
  PublishedBlogDB,
  | "blogId"
  | "title"
  | "dek"
  | "seoTitle"
  | "tags"
  | "coverImageUrl"
  | "readTime"
  | "metaDescription"
  | "featured"
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
  kind: BlogKind;
  date: string;
  readTime: number;
  featured: boolean;
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
  excerpt: b.dek,
  tags: b.tags,
  kind: b.kind,
  date: toIsoDate(b.publishedAt),
  readTime: b.readTime,
  featured: b.featured,
  publishedAt: b.publishedAt,
  updatedAt: b.updatedAt,
  coverImageUrl: b.coverImageUrl,
});

const toNeighbour = ({ slug, title }: PostMeta): Neighbour => ({ slug, title });

export async function getAllBlogs(): Promise<PostMeta[]> {
  const list = await fetchJson<BlogListItem[]>("/api/blogs?status=published");
  if (!list) return [];
  return list.map(toPostMeta);
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
    excerpt: blog.dek,
    tags: blog.tags,
    kind: blog.kind,
    date: toIsoDate(blog.publishedAt),
    readTime: blog.readTime,
    featured: blog.featured,
    publishedAt: blog.publishedAt,
    updatedAt: blog.updatedAt,
    coverImageUrl: blog.coverImageUrl,
    body,
    prev,
    next,
  };
}

export const ALL_TAGS: string[] = [
  "all",
  "react",
  "next.js",
  "tailwindcss",
  "typescript",
  "javascript",
  "html",
  "css",
  "node.js",
  "express",
  "mongodb",
];
