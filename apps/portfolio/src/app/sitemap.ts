import { MetadataRoute } from "next";
import { getPageData } from "@/lib/pageData";
import { getAllBlogs } from "@/lib/posts";

const BASE_URL = "https://tabsircg.com";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pageData, blogs] = await Promise.all([getPageData(), getAllBlogs()]);

  const homepageImages = [
    pageData.profilePicture,
    ...pageData.projects.flatMap((p) =>
      p.stills.filter((s) => s.kind === "image").map((s) => s.url),
    ),
    ...pageData.credentials.map((c) => c.image),
  ].filter(Boolean);

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: homepageImages,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const blogEntries: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${BASE_URL}/blog/${blog.slug}`,
    lastModified: new Date(blog.updatedAt ?? blog.publishedAt),
    changeFrequency: "monthly",
    priority: 0.8,
    ...(blog.coverImageUrl ? { images: [blog.coverImageUrl] } : {}),
  }));

  return [...staticEntries, ...blogEntries];
}
