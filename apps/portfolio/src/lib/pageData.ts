import { cache } from "react";
import { env } from "@/config/env";
import type { ApiResponse } from "@tabsircg/schemas/api";
import { PageData } from "@/app/page.type";

export const getPageData = cache(async (): Promise<PageData> => {
  try {
    const response = await fetch(`${env.ADMIN_ORIGIN}/api/page-data`, {
      headers: {
        serverToken: env.SERVER_TOKEN,
      },
    });
    const res = (await response.json()) as ApiResponse<PageData>;
    if (res.status === "error") throw new Error(res.message);
    return res.data;
  } catch (error) {
    console.error(error);
    return {
      about: [],
      credentials: [],
      services: [],
      stats: {
        yearsExperience: 0,
        projectsCompleted: 0,
        jobSuccessRate: 0,
        responseTime: "",
        happyClients: 0,
      },
      skills: [],
      projects: [],
      testimonials: [],
      title: "",
      description: "",
      keywords: [],
      profilePicture: "",
      contact: {
        email: "",
        social: [],
      },
    };
  }
});
