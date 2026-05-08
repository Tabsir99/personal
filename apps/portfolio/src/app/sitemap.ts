import { MetadataRoute } from "next";
import { getPageData } from "./layout";
import { getAllPosts } from "@/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pageData = await getPageData();
  const posts = await getAllPosts();

  const portfolioImages = pageData.projects.map((p) => p.image);
  const images = [...portfolioImages].filter(Boolean);

  return [
    {
      url: "https://tabsircg.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: [pageData.profilePicture, ...images],
    },
    {
      url: "https://tabsircg.com/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `https://tabsircg.com/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
