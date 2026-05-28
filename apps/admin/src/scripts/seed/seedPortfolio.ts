import type { Firestore } from "firebase-admin/firestore";
import { pageDataSchema, type PageData } from "@tabsircg/schemas/portfolio";

const PAGE_DATA = pageDataSchema.parse({
  title: "Full-Stack Developer (React, Next.js, Node) — Tabsir CG",
  description:
    "Full-stack developer in React, Next.js and Node. I build production web apps for agencies and startups, solo and end to end. Two years shipping, including a SaaS in production.",
  keywords: [
    "full-stack developer",
    "react developer",
    "next.js developer",
    "node.js developer",
    "freelance web developer",
    "saas developer",
    "api integration",
    "remote developer",
  ],

  profilePicture: "", // ← R2 URL

  aboutText:
    "I'm Tabsir, 21, full-stack developer. The last two years have mostly been learning and building: Postchart, a Facebook scheduling platform I built solo for an agency over ten months. It's live now. The rest is my own tools — a block editor, an SDK, this site and the CMS behind it. I work alone, end to end, mostly in React and Node.",

  heroStats: [
    { value: "2y", label: "shipping to production", order: 0 },
    { value: "100+", label: "users on work I built", order: 1 },
    { value: "1", label: "SaaS, built solo", order: 2 },
  ], // ← confirm these numbers are real before shipping

  studioName: "TabsirCG Web & AI Solutions LLC",
  address: "", // ← fill, or just city if you don't want a full address public

  contact: {
    email: "hello@tabsircg.com",
    phone: "", // shows "(on request)" if filled
    calLabel: "", // e.g. "Book a call" — leave blank if no booking link
    calUrl: "",
    social: [
      {
        name: "GitHub",
        url: "https://github.com/Tabsir99",
        icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg",
      }, // ← fill URLs
      {
        name: "Upwork",
        url: "https://www.upwork.com/freelancers/tabsircg",
        icon: "https://media.tabsircg.com/portfolio/icons/upwork.svg",
      },
    ],
  },

  projects: [
    {
      title: "Postchart",
      dek: "A Facebook scheduling and page-management platform, built from scratch for a small agency running hundreds of pages. They'd outgrown Buffer and the native scheduler, so I built the parts those couldn't: bulk-scheduling hundreds of posts at once, rule-based re-publishing across pages, and a custom earnings tracker for contributors that Facebook gives you no native way to build.",
      type: "Freelance",
      status: "shipped",
      role: "Sole developer — design through deploy, including the custom scheduling engine",
      year: "2025–2026",
      tag: "Platform",
      metrics: [
        { label: "Users", value: "100+" },
        { label: "Pages managed", value: "Hundreds" },
        { label: "Solo build", value: "~10 mo" },
      ],
      skills: [
        "React",
        "Node / Express",
        "MongoDB",
        "Redis",
        "AWS (EC2 / S3)",
        "Stripe",
        "OpenAI",
      ],
      links: [{ text: "Live", url: "https://postchart.com", type: "live" }],
      stills: [],
      order: 0,
      isActive: true,
    },
    {
      title: "Open Notion",
      dek: "A Notion-style block editor for React. One JSON document model drives five output formats — HTML, Markdown, PDF, React, and plain text — built on Tiptap v3 and ProseMirror. The kind of thing most teams pay a SaaS to avoid building.",
      type: "Personal",
      status: "in-progress",
      role: "Sole author — architecture, editor core, serializers, build pipeline",
      year: "2026",
      tag: "Tooling",
      metrics: [
        { label: "Editor mount (gzip)", value: "~50 KB" },
        { label: "Output formats", value: "5" },
        { label: "Smooth typing at", value: "300+ blocks" },
      ],
      skills: [
        "TypeScript",
        "React 19",
        "Tiptap / ProseMirror",
        "Tailwind v4",
        "pnpm",
      ],
      links: [
        {
          text: "Repo",
          url: "https://github.com/Tabsir99/open-notion",
          type: "repo",
        },
        {
          text: "Playground",
          url: "https://open-notion-rouge.vercel.app",
          type: "live",
        },
      ],
      stills: [
        {
          url: "",
          alt: "Editor with rich content and slash menu open",
          label: "The editor",
          kind: "image",
        },
        {
          url: "",
          alt: "Slash menu, drag, and export in action",
          label: "In use",
          kind: "video",
        },
      ],
      order: 1,
      isActive: true,
    },
    {
      title: "fb-sdk",
      dek: "A strongly-typed Facebook Graph API SDK for Node. You describe the shape you want as a plain object; what you await back is exactly that shape, camelCased, with unknown fields rejected at compile time. Extracted out of Postchart into a standalone package on npm.",
      type: "Personal",
      status: "shipped",
      role: "Sole author — type system, batching primitive, webhook + store layer",
      year: "2025",
      tag: "Tooling",
      metrics: [
        { label: "On npm", value: "v1.2.x" },
        { label: "Graph API pinned", value: "v25.0" },
        { label: "Batch auto-chunk", value: "50/req" },
      ],
      skills: ["TypeScript", "Node.js", "Graph API", "Redis", "vitest"],
      links: [
        {
          text: "npm",
          url: "https://www.npmjs.com/package/@tabsircg/fb-sdk",
          type: "live",
        },
        {
          text: "Repo",
          url: "https://github.com/Tabsir99/fb-sdk",
          type: "repo",
        },
      ],
      stills: [
        {
          url: "",
          alt: "Typed field selector and its inferred result",
          label: "Type-safe selectors",
          kind: "image",
        },
        {
          url: "",
          alt: "Autocomplete narrowing field types in the editor",
          label: "DX in motion",
          kind: "video",
        }, // optional
      ],
      order: 2,
      isActive: true,
    },
    {
      title: "tabsircg.com",
      dek: "This site, and the CMS behind it. A public Next.js portfolio and blog that reads a private admin app over a typed REST contract, with push-based cache invalidation so content goes live without a redeploy. The block editor above powers the writing.",
      type: "Personal",
      status: "shipped",
      role: "Designed and built both apps — public site, CMS, Firestore + R2, caching",
      year: "2026",
      tag: "Platform",
      metrics: [
        { label: "Apps in monorepo", value: "2" },
        { label: "Cache strategy", value: "tag-based ISR" },
        { label: "Publish → live", value: "no redeploy" },
      ],
      skills: ["Next.js 16", "React 19", "Firestore", "Cloudflare R2", "Zod"],
      links: [{ text: "Live", url: "https://tabsircg.com", type: "live" }],
      stills: [
        { url: "", alt: "Admin dashboard", label: "The CMS", kind: "image" },
        {
          url: "",
          alt: "Block editor inside the admin",
          label: "Authoring",
          kind: "image",
        },
        {
          url: "",
          alt: "Analytics dashboard",
          label: "Analytics",
          kind: "image",
        },
      ],
      order: 3,
      isActive: true,
    },
  ],

  services: [
    {
      label: "Embedded delivery",
      title: "Ship into\nyour codebase",
      desc: "You already have a codebase and it mostly works. I get in, learn how it's built, and start adding features without making a mess. I won't push a rewrite in the first week. I work with what's there, the way your team already works.",
      frameLabel: "EXISTING CODE",
      frameTitle: "Working in your code",
      items: [
        "Feature work in React / Next",
        "Fixing code you didn't write",
        "No 'let's rebuild it' as step one",
        "Reviews and cleanup as I go",
      ],
      isActive: true,
      order: 0,
    },
    {
      label: "Full builds",
      title: "Build it\nend to end",
      desc: "Starting from scratch works too. Hand me the idea and I build the whole thing: database, backend, UI, login, payments, the deploy. Most of the real work is the unglamorous middle, and that's the part I don't skip.",
      frameLabel: "GREENFIELD",
      frameTitle: "Idea to deployed",
      items: [
        "Full-stack apps (Next / Node)",
        "Database and schema design",
        "Auth, payments, the unglamorous bits",
        "Deployed and actually used",
      ],
      isActive: true,
      order: 1,
    },
    {
      label: "Integrations",
      title: "Wire up\nthe seams",
      desc: "A lot of my work is just connecting things: your app to Stripe, to the Facebook API, to some old endpoint nobody wants to touch. It's fiddly and it breaks in weird ways, so I build it to handle the weird ways. Same with messy data from other services. I'll turn it into a dashboard you can actually read.",
      frameLabel: "APIs / GLUE",
      frameTitle: "Connecting things up",
      items: [
        "REST / API integration",
        "Third-party SDKs (Stripe, Graph API…)",
        "Automation and webhooks",
        "Dashboards over messy data",
      ],
      isActive: true,
      order: 2,
    },
  ],

  testimonials: [], // later

  skills: [
    {
      title: "Frontend",
      isActive: true,
      order: 0,
      skills: [
        { name: "React", level: 5 },
        { name: "Next.js", level: 4 },
        { name: "TypeScript", level: 4 },
        { name: "Tailwind", level: 5 },
      ],
    },
    {
      title: "Backend",
      isActive: true,
      order: 1,
      skills: [
        { name: "Node / Express", level: 5 },
        { name: "MongoDB", level: 4 },
        { name: "PostgreSQL", level: 3 },
        { name: "Redis", level: 4 },
      ],
    },
    {
      title: "Infra",
      isActive: true,
      order: 2,
      skills: [
        { name: "AWS (EC2 / S3)", level: 4 },
        { name: "Docker", level: 3 },
        { name: "Cloudflare R2", level: 4 },
        { name: "Firestore", level: 3 },
      ],
    },
    {
      title: "Tooling",
      isActive: true,
      order: 3,
      skills: [
        { name: "Stripe", level: 4 },
        { name: "OpenAI API", level: 4 },
        { name: "Graph API", level: 4 },
        { name: "Zod", level: 4 },
      ],
    },
  ], // ← levels are my guess, set them honestly

  credentials: [], // you said no high-end certs; Upwork verification already lives in the Endorsement
} satisfies PageData);

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
