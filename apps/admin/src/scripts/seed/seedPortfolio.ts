import type { Firestore } from "firebase-admin/firestore";
import { pageDataSchema, type PageData } from "@tabsircg/schemas/portfolio";

// Seeds config/portfolio, the doc the public site reads via /api/page-data
// (pageData) and /api/config/portfolio (skillCatalog). Without this the
// portfolio homepage renders the empty FALLBACK. Validated against the live
// schema so any drift surfaces at seed time.
const PAGE_DATA: PageData = pageDataSchema.parse({
  title: "Tabsir CG — Full-stack developer",
  description: "Full-stack web work for teams who'd rather move than rewrite.",
  keywords: ["full-stack", "next.js", "typescript", "react", "firebase"],
  profilePicture: "",

  aboutText:
    "I build sturdy, fast web products and keep them shippable. Most of my work lives at the seam between a clean data model and an interface that feels effortless — and I'd rather migrate a system than rewrite it from scratch.",
  heroStats: [
    { value: "6+", label: "years shipping", order: 0 },
    { value: "40+", label: "projects delivered", order: 1 },
    { value: "12", label: "teams partnered", order: 2 },
  ],

  studioName: "Tabsir CG — independent studio",
  address: "Remote-first\nDhaka, Bangladesh",

  contact: {
    email: "admin@tabsircg.com",
    phone: "+880 1700-000000",
    calLabel: "Book a call",
    calUrl: "",
    social: [
      { name: "GitHub", url: "https://github.com/tabsircg", icon: "" },
      { name: "LinkedIn", url: "https://www.linkedin.com/in/tabsircg", icon: "" },
      { name: "X", url: "https://x.com/tabsircg", icon: "" },
    ],
  },

  projects: [
    {
      title: "Monorepo CMS + Portfolio",
      dek: "Two Next.js apps sharing Zod schemas with no build step between them.",
      type: "Personal",
      status: "shipped",
      role: "Solo — design, build, deploy",
      year: "2026",
      tag: "platform",
      metrics: [
        { label: "apps", value: "2" },
        { label: "build steps", value: "0" },
      ],
      skills: ["Next.js", "TypeScript", "Firestore"],
      links: [{ text: "Live", url: "https://tabsircg.com", type: "live" }],
      stills: [],
      order: 0,
      isActive: true,
    },
    {
      title: "Realtime Analytics Pipeline",
      dek: "Edge event ingestion aggregated into daily, geo, and source rollups.",
      type: "Freelance",
      status: "shipped",
      role: "Backend + data modelling",
      year: "2025",
      tag: "data",
      metrics: [
        { label: "events/day", value: "1.2M" },
        { label: "p95 write", value: "40ms" },
      ],
      skills: ["Node.js", "Firestore", "TypeScript"],
      links: [],
      stills: [],
      order: 1,
      isActive: true,
    },
    {
      title: "Open Notion Editor",
      dek: "A block editor with portable serializers for HTML, Markdown, and PDF.",
      type: "Demo",
      status: "in-progress",
      role: "Library author",
      year: "2025",
      tag: "oss",
      metrics: [{ label: "renderers", value: "5" }],
      skills: ["React", "TypeScript", "Shiki"],
      links: [],
      stills: [],
      order: 2,
      isActive: true,
    },
  ],

  services: [
    {
      label: "01",
      title: "Product engineering",
      desc: "From data model to deploy — features that ship and stay shippable.",
      frameNum: "01",
      frameLabel: "build",
      frameTitle: "Product engineering",
      items: ["Next.js apps", "API + data modelling", "Auth & billing"],
      isActive: true,
      order: 0,
    },
    {
      label: "02",
      title: "Performance & migration",
      desc: "Make the slow thing fast and the brittle thing boring — without a rewrite.",
      frameNum: "02",
      frameLabel: "fix",
      frameTitle: "Performance & migration",
      items: ["Core Web Vitals", "Caching & ISR", "Incremental migrations"],
      isActive: true,
      order: 1,
    },
    {
      label: "03",
      title: "Design engineering",
      desc: "Interfaces with taste — motion, type, and detail that feel intentional.",
      frameNum: "03",
      frameLabel: "polish",
      frameTitle: "Design engineering",
      items: ["Design systems", "Motion & micro-interactions", "Accessibility"],
      isActive: true,
      order: 2,
    },
  ],

  testimonials: [
    {
      name: "A. Rahman",
      company: "Northwind Labs",
      period: "2025",
      rating: 5,
      text: "Tabsir took a codebase we were ready to throw away and made it a pleasure to work in again. Shipped weekly, never broke prod.",
      video: "",
      avatar: "",
      displaySlot: "endorsement",
      isActive: true,
      order: 0,
    },
    {
      name: "J. Okafor",
      company: "Cedar & Co.",
      period: "2024",
      rating: 5,
      text: "The kind of engineer who asks the question that saves you three weeks. Calm, fast, and exact.",
      video: "",
      avatar: "",
      displaySlot: "voices",
      isActive: true,
      order: 1,
    },
  ],

  skills: [
    {
      title: "Frontend",
      skills: [
        { name: "Next.js", level: 5 },
        { name: "React", level: 5 },
        { name: "TypeScript", level: 5 },
        { name: "Tailwind CSS", level: 4 },
      ],
      isActive: true,
      order: 0,
    },
    {
      title: "Backend & data",
      skills: [
        { name: "Node.js", level: 5 },
        { name: "Firestore", level: 4 },
        { name: "PostgreSQL", level: 4 },
        { name: "Zod", level: 5 },
      ],
      isActive: true,
      order: 1,
    },
    {
      title: "Tooling",
      skills: [
        { name: "Docker", level: 3 },
        { name: "pnpm workspaces", level: 4 },
        { name: "Vitest", level: 4 },
      ],
      isActive: true,
      order: 2,
    },
  ],

  credentials: [
    { title: "B.Sc. Computer Science", image: "", link: "", isActive: true, order: 0 },
    { title: "AWS Certified Developer", image: "", link: "", isActive: true, order: 1 },
  ],
});

const SKILL_CATALOG = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "Firestore",
  "PostgreSQL",
  "Tailwind CSS",
  "Zod",
  "Docker",
  "Shiki",
].sort();

export async function seedPortfolio(db: Firestore): Promise<void> {
  await db
    .collection("config")
    .doc("portfolio")
    .set({ pageData: PAGE_DATA, skillCatalog: SKILL_CATALOG });
  console.log("  ✓ config/portfolio (pageData + skillCatalog)");
}
