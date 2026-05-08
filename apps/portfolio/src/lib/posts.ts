import { env } from "@/config/env";
import { PublishedBlogDB } from "../../types/blogtypes";

export async function getBlog(slug: string): Promise<PublishedBlogDB | null> {
  return fetch(`${env.ADMIN_ORIGIN}/api/blogs/${slug}`, {
    headers: {
      serverToken: env.SERVER_TOKEN,
    },
  })
    .then((res) => res.json())
    .catch(() => null);
}

export async function getAllBlogs(): Promise<PublishedBlogDB[]> {
  return fetch(`${env.ADMIN_ORIGIN}/api/blogs?status=published`, {
    headers: {
      serverToken: env.SERVER_TOKEN,
    },
  })
    .then((res) => res.json())
    .catch(() => []);
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
