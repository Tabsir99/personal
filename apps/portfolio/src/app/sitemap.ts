import { MetadataRoute } from "next";
import { getPageData } from "./layout";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pageData = await getPageData();

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
  ];
}
