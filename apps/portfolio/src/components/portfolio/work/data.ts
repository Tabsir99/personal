export const PROJECTS = [
  {
    title: "Northwind",
    dek: "Real-time logistics console tracking 2k+ daily shipments across South-East Asia. Operator dashboard, alert routing, replay scrubber, live-ETA model — and a satellite-friendly offline mode for the warehouse floor.",
    type: "Freelance",
    status: "shipped",
    role: "Sole engineer",
    year: "2025",
    metrics: [
      { label: "shipments / day", value: "2.1k" },
      { label: "p95 read", value: "180ms" },
      { label: "uptime, 12 mo", value: "99.94%" },
    ],
    skills: ["Next.js", "Postgres", "Mapbox", "WebSockets", "tRPC"],
    links: [
      { text: "Live console", url: "#", type: "live" },
      { text: "Case study", url: "#", type: "case-study" },
    ],
    stills: [
      { label: "Operator console", kind: "image" },
      { label: "Route replay", kind: "video" },
      { label: "Alert rules", kind: "image" },
      { label: "Driver mobile", kind: "image" },
    ],
    tag: "Operations",
    glyph: "◢",
  },
  {
    title: "Atlas Atelier",
    dek: "A design-system handoff tool — paste a Figma file, get a typed component library, theming tokens, and a documentation site that updates itself on every commit.",
    type: "Demo",
    status: "shipped",
    role: "Designer · engineer",
    year: "2024",
    metrics: [
      { label: "components generated", value: "142" },
      { label: "beta studios", value: "11" },
      { label: "avg. sync time", value: "6.4s" },
    ],
    skills: ["React", "Figma API", "TypeScript", "Vite", "Stitches"],
    links: [
      { text: "Try it", url: "#", type: "live" },
      { text: "GitHub", url: "#", type: "repo" },
      { text: "Demo video", url: "#", type: "video" },
    ],
    stills: [
      { label: "Token explorer", kind: "image" },
      { label: "Component preview", kind: "image" },
      { label: "Diff timeline", kind: "image" },
    ],
    tag: "Tooling",
    glyph: "◇",
  },
  {
    title: "Sentinel",
    dek: "A quiet observability dashboard for solo founders and two-person infra teams. Boring graphs, sensible defaults, and incident-mode that turns the whole UI into a calm checklist instead of a Christmas tree.",
    type: "Personal",
    status: "in-progress",
    role: "Solo build",
    year: "2025",
    metrics: [
      { label: "private-beta teams", value: "8" },
      { label: "log ingest / day", value: "14 GB" },
      { label: "rules in trial", value: "40+" },
    ],
    skills: ["Go", "Clickhouse", "Svelte", "Grafana panels", "Loki"],
    links: [
      { text: "Waitlist", url: "#", type: "live" },
      { text: "Build log", url: "#", type: "case-study" },
    ],
    stills: [
      { label: "Overview", kind: "image" },
      { label: "Incident mode", kind: "image" },
      { label: "Latency board", kind: "image" },
      { label: "On-call sheet", kind: "image" },
      { label: "Alert routing", kind: "video" },
    ],
    tag: "Observability",
    glyph: "◐",
  },
  {
    title: "Looplab",
    dek: "A browser-native generative audio playground. Visual patch cords, MIDI in/out, a sampler that survives a refresh. Built mostly on weekends; ended up in two universities’ sound-design syllabi.",
    type: "Personal",
    status: "shipped",
    role: "Solo · ongoing",
    year: "2024",
    metrics: [
      { label: "monthly patches", value: "3.6k" },
      { label: "syllabi listed", value: "2" },
      { label: "lines of DSP", value: "~7k" },
    ],
    skills: ["Web Audio", "WebMIDI", "TypeScript", "Canvas", "IndexedDB"],
    links: [
      { text: "Play", url: "#", type: "live" },
      { text: "Source", url: "#", type: "repo" },
    ],
    stills: [
      { label: "Patch surface", kind: "image" },
      { label: "Sampler view", kind: "image" },
      { label: "Granular mode", kind: "video" },
    ],
    tag: "Audio",
    glyph: "◉",
  },
  {
    title: "Quartermile",
    dek: 'A small habit-tracker for runners, built for a friend’s coaching practice. Quiet daily prompts, weekly summaries, and a "compassionate streaks" model that doesn’t punish you for life happening.',
    type: "Freelance",
    status: "archived",
    role: "Engineer · designer",
    year: "2023",
    metrics: [
      { label: "active runners", value: "420" },
      { label: "streak threshold", value: "forgiving" },
    ],
    skills: ["Remix", "SQLite", "Tailwind", "Resend", "Fly.io"],
    links: [{ text: "Retrospective", url: "#", type: "case-study" }],
    stills: [
      { label: "Daily prompt", kind: "image" },
      { label: "Weekly review", kind: "image" },
      { label: "Coach view", kind: "image" },
    ],
    tag: "Habit",
    glyph: "◔",
  },
];

export type Project = (typeof PROJECTS)[number];

export const LINK_ICONS: Record<string, string> = {
  live: "↗",
  repo: "⟨/⟩",
  "case-study": "¶",
  video: "▶",
  other: "→",
};

export const ROW_STATUS_STYLES: Record<string, string> = {
  shipped: "text-phosphor border-phosphor/35",
  "in-progress": "text-accent border-accent/40",
  archived: "text-muted-2 line-through decoration-line decoration-1",
  discontinued: "text-muted-2 opacity-60",
};

export const LINK_BG: Record<string, string> = {
  live: "bg-accent/6",
};
