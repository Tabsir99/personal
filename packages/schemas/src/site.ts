import { z } from "zod";

export const nowReadingItemSchema = z.object({
  title: z.string(),
  author: z.string().default(""),
  done: z.boolean().default(false),
});
export type NowReadingItem = z.infer<typeof nowReadingItemSchema>;

export const currentlyBuildingSchema = z.object({
  code: z.string().default(""),
  body: z.string().default(""),
  linkLabel: z.string().default(""),
  linkHref: z.string().default(""),
});
export type CurrentlyBuilding = z.infer<typeof currentlyBuildingSchema>;

export const blogLandingSchema = z.object({
  metaTitle: z.string().default(""),
  metaDescription: z.string().default(""),
  heroHeading: z.string().default("Writing"),
  heroTagline: z.string().default(""),
});
export type BlogLanding = z.infer<typeof blogLandingSchema>;

export const siteConfigSchema = z.object({
  blogLanding: blogLandingSchema.default({
    metaTitle: "",
    metaDescription: "",
    heroHeading: "Writing",
    heroTagline: "",
  }),
  nowReading: z.array(nowReadingItemSchema).default([]),
  currentlyBuilding: currentlyBuildingSchema.default({
    code: "",
    body: "",
    linkLabel: "",
    linkHref: "",
  }),
});
export type SiteConfig = z.infer<typeof siteConfigSchema>;
