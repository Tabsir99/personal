import { cache } from "react";
import { env } from "@/config/env";
import type { ApiResponse } from "@tabsircg/schemas/api";
import type { PageData } from "@tabsircg/schemas/portfolio";

const FALLBACK: PageData = {
  title: "",
  description: "",
  keywords: [],
  profilePicture: "",
  resume: { url: "", filename: "" },
  aboutText: "",
  heroStats: [],
  studioName: "",
  address: "",
  contact: { email: "", phone: "", calLabel: "", calUrl: "", social: [] },
  projects: [],
  services: [],
  testimonials: [],
  skills: [],
  credentials: [],
};

// ISR: cached in the data cache, revalidated on-demand via the "page-data" tag
// (admin POSTs { tag: "page-data" } to /api/revalidate on save). cache() dedupes
// within a request (home + footer both call it).
export const getPageData = cache(async (): Promise<PageData> => {
  try {
    const response = await fetch(`${env.ADMIN_ORIGIN}/api/page-data`, {
      cache: "force-cache",
      next: { tags: ["page-data"] },
      headers: { serverToken: env.SERVER_TOKEN },
    });
    const res = (await response.json()) as ApiResponse<PageData | null>;
    if (res.status === "error") throw new Error(res.message);
    return res.data ?? FALLBACK;
  } catch (error) {
    console.error(error);
    return FALLBACK;
  }
});
