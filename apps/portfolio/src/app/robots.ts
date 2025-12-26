import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://tabsircg.com/sitemap.xml",
    host: "https://tabsircg.com",
  };
}
