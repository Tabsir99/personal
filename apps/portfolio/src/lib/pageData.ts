import { cache } from "react";
import { adminFetch } from "@/lib/adminFetch";
import type { ApiResponse } from "@tabsircg/schemas/api";
import type { PageData } from "@tabsircg/schemas/portfolio";

const UNCONFIGURED: PageData = {
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

export const getPageData = cache(async (): Promise<PageData> => {
  const response = await adminFetch("/api/page-data", ["page-data"]);

  if (!response.ok) {
    throw new Error(
      `page-data unavailable: admin responded ${response.status}`,
    );
  }

  const res = (await response.json()) as ApiResponse<PageData | null>;
  if (res.status === "error") {
    throw new Error(`page-data unavailable: ${res.message}`);
  }

  return res.data ?? UNCONFIGURED;
});
