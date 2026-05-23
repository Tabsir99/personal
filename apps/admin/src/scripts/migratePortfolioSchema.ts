import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { PageData } from "@tabsircg/schemas/portfolio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Dynamic imports AFTER dotenv so firebaseAdmin's env.server requireEnv() reads
// the .env we just loaded. (`import type` above is erased at compile time and
// has no runtime effect.)
const { pageDataSchema } = await import("@tabsircg/schemas/portfolio");
const { writePortfolioPageData } = await import("@/actions/configActions");

const DRY_RUN = process.argv.includes("--dry-run");

// Snapshot of the values previously hardcoded in the portfolio source. Every
// field uses the new clean schema shape (no image/video/gallery/featured/etc).
const seed: PageData = {
  title: "Tabsir CG — Full-stack developer",
  description:
    "Full-stack web work for teams who'd rather move than rewrite.",
  keywords: [
    "full-stack",
    "next.js",
    "react",
    "typescript",
    "postgres",
    "web",
  ],
  profilePicture: "",

  aboutText:
    "I write code for the messy middle — where product specs collide with reality. I care about response budgets, accessible focus rings, sensible primary keys, and shipping things small enough to fix on a Friday. Two years in, mostly across SaaS dashboards, marketplaces, and a handful of internal tools nobody ever sees but everyone depends on.",

  heroStats: [
    { value: "∼2", label: "Years shipping", order: 0 },
    { value: "17", label: "Projects merged", order: 1 },
    { value: "4", label: "Stacks daily", order: 2 },
    { value: "0", label: "Frameworks worshipped", order: 3 },
  ],

  contact: {
    email: "admin@tabsircg.com",
    social: [],
  },

  projects: [
    {
      title: "Northwind",
      dek: "Real-time logistics console tracking 2k+ daily shipments across South-East Asia. Operator dashboard, alert routing, replay scrubber, live-ETA model — and a satellite-friendly offline mode for the warehouse floor.",
      type: "Freelance",
      status: "shipped",
      role: "Sole engineer",
      year: "2025",
      tag: "Operations",
      metrics: [
        { label: "shipments / day", value: "2.1k" },
        { label: "p95 read", value: "180ms" },
        { label: "uptime, 12 mo", value: "99.94%" },
      ],
      skills: ["Next.js", "Postgres", "Mapbox", "WebSockets", "tRPC"],
      links: [
        { text: "Live console", url: "", type: "live" },
        { text: "Case study", url: "", type: "case-study" },
      ],
      stills: [
        { url: "", alt: "", label: "Operator console", kind: "image" },
        { url: "", alt: "", label: "Route replay", kind: "video" },
        { url: "", alt: "", label: "Alert rules", kind: "image" },
        { url: "", alt: "", label: "Driver mobile", kind: "image" },
      ],
      order: 0,
      isActive: true,
    },
    {
      title: "Atlas Atelier",
      dek: "A design-system handoff tool — paste a Figma file, get a typed component library, theming tokens, and a documentation site that updates itself on every commit.",
      type: "Demo",
      status: "shipped",
      role: "Designer · engineer",
      year: "2024",
      tag: "Tooling",
      metrics: [
        { label: "components generated", value: "142" },
        { label: "beta studios", value: "11" },
        { label: "avg. sync time", value: "6.4s" },
      ],
      skills: ["React", "Figma API", "TypeScript", "Vite", "Stitches"],
      links: [
        { text: "Try it", url: "", type: "live" },
        { text: "GitHub", url: "", type: "repo" },
        { text: "Demo video", url: "", type: "video" },
      ],
      stills: [
        { url: "", alt: "", label: "Token explorer", kind: "image" },
        { url: "", alt: "", label: "Component preview", kind: "image" },
        { url: "", alt: "", label: "Diff timeline", kind: "image" },
      ],
      order: 1,
      isActive: true,
    },
    {
      title: "Sentinel",
      dek: "A quiet observability dashboard for solo founders and two-person infra teams. Boring graphs, sensible defaults, and incident-mode that turns the whole UI into a calm checklist instead of a Christmas tree.",
      type: "Personal",
      status: "in-progress",
      role: "Solo build",
      year: "2025",
      tag: "Observability",
      metrics: [
        { label: "private-beta teams", value: "8" },
        { label: "log ingest / day", value: "14 GB" },
        { label: "rules in trial", value: "40+" },
      ],
      skills: ["Go", "Clickhouse", "Svelte", "Grafana panels", "Loki"],
      links: [
        { text: "Waitlist", url: "", type: "live" },
        { text: "Build log", url: "", type: "case-study" },
      ],
      stills: [
        { url: "", alt: "", label: "Overview", kind: "image" },
        { url: "", alt: "", label: "Incident mode", kind: "image" },
        { url: "", alt: "", label: "Latency board", kind: "image" },
        { url: "", alt: "", label: "On-call sheet", kind: "image" },
        { url: "", alt: "", label: "Alert routing", kind: "video" },
      ],
      order: 2,
      isActive: true,
    },
    {
      title: "Looplab",
      dek: "A browser-native generative audio playground. Visual patch cords, MIDI in/out, a sampler that survives a refresh. Built mostly on weekends; ended up in two universities’ sound-design syllabi.",
      type: "Personal",
      status: "shipped",
      role: "Solo · ongoing",
      year: "2024",
      tag: "Audio",
      metrics: [
        { label: "monthly patches", value: "3.6k" },
        { label: "syllabi listed", value: "2" },
        { label: "lines of DSP", value: "~7k" },
      ],
      skills: ["Web Audio", "WebMIDI", "TypeScript", "Canvas", "IndexedDB"],
      links: [
        { text: "Play", url: "", type: "live" },
        { text: "Source", url: "", type: "repo" },
      ],
      stills: [
        { url: "", alt: "", label: "Patch surface", kind: "image" },
        { url: "", alt: "", label: "Sampler view", kind: "image" },
        { url: "", alt: "", label: "Granular mode", kind: "video" },
      ],
      order: 3,
      isActive: true,
    },
    {
      title: "Quartermile",
      dek: "A small habit-tracker for runners, built for a friend's coaching practice. Quiet daily prompts, weekly summaries, and a \"compassionate streaks\" model that doesn't punish you for life happening.",
      type: "Freelance",
      status: "archived",
      role: "Engineer · designer",
      year: "2023",
      tag: "Habit",
      metrics: [
        { label: "active runners", value: "420" },
        { label: "streak threshold", value: "forgiving" },
      ],
      skills: ["Remix", "SQLite", "Tailwind", "Resend", "Fly.io"],
      links: [{ text: "Retrospective", url: "", type: "case-study" }],
      stills: [
        { url: "", alt: "", label: "Daily prompt", kind: "image" },
        { url: "", alt: "", label: "Weekly review", kind: "image" },
        { url: "", alt: "", label: "Coach view", kind: "image" },
      ],
      order: 4,
      isActive: true,
    },
  ],

  services: [
    {
      label: "Build",
      title: "Web products,\nend-to-end.",
      desc: "From the first wireframe to the final deploy script — I take projects from \"what if\" to \"v1 in production\". One developer, fewer hand-off seams.",
      frameNum: "S/01",
      frameLabel: "Full-stack delivery",
      frameTitle: "Marketplace, dashboard, or SaaS — I bring it up.",
      items: [
        "Spec → architecture",
        "Design system + UI",
        "API, auth, payments",
        "CI/CD + monitoring",
      ],
      isActive: true,
      order: 0,
    },
    {
      label: "Interfaces",
      title: "Front-end that\nfeels honest.",
      desc: "Real-feeling motion, accessible defaults, dark mode that isn't an afterthought. I write components other devs are happy to inherit.",
      frameNum: "S/02",
      frameLabel: "Front-end engineering",
      frameTitle: "React/Next interfaces that read as designed.",
      items: [
        "Design system buildout",
        "Animation + interaction",
        "A11y + performance budget",
        "TypeScript everywhere",
      ],
      isActive: true,
      order: 1,
    },
    {
      label: "APIs",
      title: "Back-ends that\nstay boring.",
      desc: "I optimise for the engineer reading the code at 2am. Boring schemas, traceable jobs, no clever tricks — until they are absolutely required.",
      frameNum: "S/03",
      frameLabel: "API & data layer",
      frameTitle: "Postgres-first systems built to be debugged.",
      items: [
        "REST / tRPC / GraphQL",
        "Background jobs + queues",
        "Schema design + migrations",
        "Observability from day one",
      ],
      isActive: true,
      order: 2,
    },
    {
      label: "Sparring",
      title: "Technical\nsparring partner.",
      desc: "Already have a team? I plug in for tricky weeks — architecture reviews, hairy bug-hunts, design-system audits, \"is this PR sane?\" calls.",
      frameNum: "S/04",
      frameLabel: "Advisory & audits",
      frameTitle: "A senior pair of eyes, by the hour or sprint.",
      items: [
        "Architecture review",
        "Performance audit",
        "Code-review on retainer",
        "Hiring & tech interviews",
      ],
      isActive: true,
      order: 3,
    },
  ],

  testimonials: [
    {
      name: "Zohaib",
      company: "DataZoro",
      period: "Mar — Jul 2025",
      rating: 5,
      text: "Quick response and attention to detail. Clean, efficient code and communication.",
      video: "",
      avatar: "",
      displaySlot: "endorsement",
      isActive: true,
      order: 0,
    },
    {
      name: "Eric Bihr",
      company: "Postchart",
      period: "Mar — Jul 2025",
      rating: 5,
      text: "A short walkthrough from Eric at Postchart — the project was a custom AI-featured Facebook Page management system with a bulk scheduler.",
      video:
        "https://media.tabsircg.com/portfolio/testimonials/client-testimonial-ERIC-Postchart.mov",
      avatar: "",
      displaySlot: "voices",
      isActive: true,
      order: 1,
    },
  ],

  skills: [
    {
      title: "Front-end",
      skills: [
        { name: "React / Next.js", level: 4 },
        { name: "TypeScript", level: 4 },
        { name: "Tailwind / CSS", level: 4 },
        { name: "Framer / Motion", level: 3 },
        { name: "Vue (legacy)", level: 2 },
      ],
      isActive: true,
      order: 0,
    },
    {
      title: "Back-end",
      skills: [
        { name: "Node.js / Express", level: 4 },
        { name: "Go", level: 3 },
        { name: "Python / FastAPI", level: 3 },
        { name: "PostgreSQL", level: 4 },
        { name: "Redis / BullMQ", level: 3 },
      ],
      isActive: true,
      order: 1,
    },
    {
      title: "Infra & DevOps",
      skills: [
        { name: "Docker / Compose", level: 4 },
        { name: "AWS (ECS, RDS, S3)", level: 3 },
        { name: "Terraform", level: 2 },
        { name: "GitHub Actions", level: 4 },
        { name: "Grafana / Loki", level: 3 },
      ],
      isActive: true,
      order: 2,
    },
    {
      title: "Craft & tooling",
      skills: [
        { name: "Figma + dev hand-off", level: 3 },
        { name: "Vitest / Playwright", level: 3 },
        { name: "Linear / Notion", level: 4 },
        { name: "Cmd-line / Neovim", level: 4 },
        { name: "Design systems", level: 4 },
      ],
      isActive: true,
      order: 3,
    },
  ],

  credentials: [],
};

const parsed = pageDataSchema.parse(seed);

if (DRY_RUN) {
  console.log("[dry-run] Would write portfolio PageData:");
  console.log(JSON.stringify(parsed, null, 2));
  process.exit(0);
}

await writePortfolioPageData(parsed);

// Flush the portfolio's tag-based cache so it sees the new shape immediately.
// CLI arg `--portfolio-url=...` overrides; otherwise prefer the env var, then
// fall back to the dev port (3001 per CLAUDE.local.md).
const urlArg = process.argv.find((a) => a.startsWith("--portfolio-url="));
const portfolioUrl =
  urlArg?.slice("--portfolio-url=".length) ||
  process.env.NEXT_PUBLIC_BLOG_ORIGIN ||
  "http://localhost:3001";
const token = process.env.SERVER_TOKEN;
if (token) {
  try {
    const res = await fetch(`${portfolioUrl}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", acs_tkn: token },
      body: JSON.stringify({ tag: "page-data" }),
    });
    console.log(
      `Cache flush at ${portfolioUrl}: ${res.status} ${res.statusText}`,
    );
  } catch (err) {
    console.warn(
      `Cache flush failed at ${portfolioUrl}:`,
      err instanceof Error ? err.message : err,
    );
  }
} else {
  console.warn("Skipped cache flush: SERVER_TOKEN missing.");
}

console.log("Portfolio PageData replaced with new schema.");
process.exit(0);
