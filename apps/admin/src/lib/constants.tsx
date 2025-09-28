import {
  Bash,
  Golang,
  JavaScript,
  Python,
  Rust,
  TypeScript,
} from "@/components/ui/icons/icon";
import React from "react";

interface Languages {
  name: string;
  icon: React.ReactNode;
  value: string;
}
export const languages: Languages[] = [
  {
    name: "JavaScript",
    icon: <JavaScript />,
    value: "javascript",
  },
  {
    name: "TypeScript",
    icon: <TypeScript />,
    value: "typescript",
  },
  {
    name: "Python",
    icon: <Python />,
    value: "python",
  },
  {
    name: "Bash",
    icon: <Bash />,
    value: "bash",
  },
  {
    name: "Rust",
    icon: <Rust />,
    value: "rust",
  },
  {
    name: "Go",
    icon: <Golang />,
    value: "go",
  },
];

export const Collections = {
  DASHBOARD_STATS: "stats",
  DAILY_STATS: "daily-stats",
  MONTHLY_STATS: "monthly-stats",

  VALID_LINKS: "valid-links",
  USERS: "users",
  PAGE_METRICS: "page-metrics",
  BLOGS: "blogs",
  SESSIONS: "sessions",
};

export type ValidCollections = keyof typeof Collections;

export const env = {
  BLOGSITE_HOSTNAME: process.env.NEXT_PUBLIC_BLOGSITE_HOSTNAME as string,
  ADMIN_ORIGIN: process.env.ADMIN_ORIGIN as string,
};

