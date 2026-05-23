import { cache } from "react";
import { env } from "@/config/env";
import type { ApiResponse } from "@tabsircg/schemas/api";
import type { PageData } from "@tabsircg/schemas/portfolio";

const FALLBACK: PageData = {
  title: "",
  description: "",
  keywords: [],
  profilePicture: "",
  aboutText: "",
  heroStats: [],
  contact: { email: "", social: [] },
  projects: [],
  services: [],
  testimonials: [],
  skills: [],
  credentials: [],
};

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
