"use client";
import { useState, useEffect, useRef } from "react";
import { useReveal } from "./useReveal";
import { ProjectStill } from "./project-still";
import { cn } from "@/lib/utils";

/* =====================================================================
   Selected work — "The Reel"
   --------------------------------------------------------------------
   A two-column showcase:
   - Left: numbered project index (the film-reel frame list)
   - Right: viewing window (image/video with scan-line + Ken-Burns idle),
           a thumb strip for the gallery, and a meta block underneath
           (dek, role, stack, metrics, links).

   Auto-advances every ~9s; pauses on hover. Switching active project
   triggers a scan-line wipe + serif title cross-fade.
   ===================================================================== */

const PROJECTS = [
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

const LINK_ICONS: Record<string, string> = {
  live: "↗",
  repo: "⟨/⟩",
  "case-study": "¶",
  video: "▶",
  other: "→",
};

const AUTO_MS = 9000;

/* Per-row stagger delays for the cascade-in animation. */
const ROW_DELAYS = ["delay-[180ms]", "delay-[260ms]", "delay-[340ms]", "delay-[420ms]", "delay-[500ms]"];

/* Row status pill — color + border per status. */
const ROW_STATUS_STYLES: Record<string, string> = {
  shipped: "text-phosphor border-phosphor/35",
  "in-progress": "text-accent border-accent/40",
  archived: "text-muted-2 line-through decoration-line decoration-1",
  discontinued: "text-muted-2 opacity-60",
};

/* Meta-link variant tint: only `live` gets the warm tint background. */
const LINK_BG: Record<string, string> = {
  live: "bg-accent/6",
};

export function Work() {
  const [revealRef, vis] = useReveal<HTMLElement>({ threshold: 0.18 });
  const [active, setActive] = useState(0);
  const [stillIdx, setStillIdx] = useState(0);
  const [tick, setTick] = useState(0); // 0..1 auto-advance progress
  const [paused, setPaused] = useState(false);
  const [transit, setTransit] = useState(false);
  const lastActive = useRef(0);

  const project = PROJECTS[active];

  // Reset still index when project changes; flash a brief scan-line wipe.
  useEffect(() => {
    if (lastActive.current !== active) {
      lastActive.current = active;
      setStillIdx(0);
      setTransit(true);
      const t = setTimeout(() => setTransit(false), 620);
      return () => clearTimeout(t);
    }
  }, [active]);

  // Auto-advance timer. Pauses if section not visible or hovered.
  useEffect(() => {
    if (!vis || paused) return;
    const start = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      const p = (t - start) / AUTO_MS;
      if (p >= 1) {
        setTick(0);
        setActive((a) => (a + 1) % PROJECTS.length);
      } else {
        setTick(p);
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [vis, paused, active]);

  function pick(i: number) {
    if (i === active) return;
    setTick(0);
    setActive(i);
  }

  return (
    <section
      id="work"
      className={cn(
        "relative pt-[200px] pb-[180px]",
        // Faint hue ramp so this section reads as its own "act" between
        // the dense Services pinned-scroll and the geometric Stack grid.
        "bg-[radial-gradient(900px_600px_at_80%_0%,color-mix(in_oklab,var(--color-accent)_3.5%,transparent),transparent_60%),linear-gradient(180deg,transparent,color-mix(in_oklab,var(--color-phosphor)_1.5%,transparent)_70%,transparent)]",
      )}
      data-screen-label="04 Work"
      ref={revealRef}
    >
      <span
        className="margin-note pointer-events-none absolute right-8 z-5 top-[260px] max-w-[160px] text-right font-serif italic text-[13px] tracking-[0.005em] leading-[1.35] text-accent opacity-60 before:content-[''] before:block before:w-3.5 before:h-px before:bg-accent before:opacity-45 before:mb-2 before:ml-auto max-[1100px]:hidden"
      >
        five recent,
        <br />
        seventeen total.
      </span>

      <div className="container">
        {/* ---- Header ---- */}
        <header
          className={cn(
            "grid grid-cols-[0.9fr_1fr] items-end gap-20 mb-[72px] opacity-0 translate-y-5",
            "transition-[opacity,translate] duration-[900ms] ease-soft",
            "max-[1100px]:grid-cols-1 max-[1100px]:gap-8",
            vis && "opacity-100 translate-y-0",
          )}
        >
          <h2 className="display font-serif text-[clamp(48px,6.4vw,96px)] leading-[0.98] tracking-[-0.02em] [&>em]:not-italic [&>em]:italic [&>em]:text-accent">
            <em>Selected</em>
            <br />
            work.
          </h2>
          <div className="flex flex-col gap-[22px] pb-3">
            <p className="text-base leading-[1.6] text-cream-2 max-w-[480px]">
              Five from the last two years. Quiet UIs, opinionated back-ends,
              and a couple of weekends that quietly turned into demos. Hover the
              index to wander; the reel auto-advances otherwise.
            </p>
            <a
              className={cn(
                "inline-flex items-center gap-2.5 w-max font-mono text-[11px] tracking-[0.16em] uppercase text-muted-2 pb-1 border-b border-transparent",
                "transition-[color,gap,border-color] duration-[250ms] ease-out",
                "hover:text-accent hover:gap-3.5 hover:border-b-accent/40",
                "[&_.arrow]:opacity-70",
              )}
              href="#"
            >
              <span>All 17 projects · the full archive</span>
              <span className="arrow">↗</span>
            </a>
          </div>
        </header>

        {/* ---- Stage: index + viewport ---- */}
        <div
          className={cn(
            "grid grid-cols-[0.78fr_1.22fr] gap-14 items-stretch opacity-0 translate-y-7",
            "transition-[opacity,translate] duration-1000 ease-soft delay-[120ms]",
            "max-[1100px]:grid-cols-1 max-[1100px]:gap-10",
            vis && "opacity-100 translate-y-0",
          )}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* INDEX */}
          <ol className="flex flex-col list-none border-t border-line">
            {PROJECTS.map((p, i) => {
              const state = i === active ? "on" : i < active ? "past" : "next";
              const isOn = state === "on";
              const isPast = state === "past";
              return (
                <li
                  key={i}
                  className={cn(
                    "group/row relative grid grid-cols-[auto_auto_1fr_auto] items-center gap-[18px] py-[22px] pr-1.5 border-b border-line cursor-pointer outline-none",
                    "transition-[background,padding-left] duration-500 ease-out",
                    // Cascade-in: rows fall into place top → bottom on reveal.
                    "opacity-0 translate-y-3.5",
                    "[transition:opacity_0.6s_var(--ease-soft),translate_0.7s_var(--ease-soft),background_0.5s_ease,padding-left_0.5s_var(--ease-soft)]",
                    vis && "opacity-100 translate-y-0",
                    vis && ROW_DELAYS[i],
                    // Accent bar (left edge) — only visible when --on.
                    "before:content-[''] before:absolute before:left-0 before:top-1/2 before:w-[3px] before:bg-accent before:-translate-y-1/2 before:transition-[height] before:duration-[400ms] before:ease-soft",
                    isOn ? "before:h-[64%]" : "before:h-0",
                    // --on: shift right, warm gradient wash. Padding + bg
                    // mutually exclusive between states (focus-visible bg
                    // is handled in the non-on branch so it doesn't
                    // conflict with the on-state gradient).
                    isOn
                      ? "pl-[22px] bg-[linear-gradient(90deg,color-mix(in_oklab,var(--color-accent)_4%,transparent),transparent_70%)]"
                      : "pl-3.5 focus-visible:bg-accent/4",
                    "max-[1100px]:grid-cols-[auto_1fr_auto]",
                  )}
                  onMouseEnter={() => pick(i)}
                  onFocus={() => pick(i)}
                  tabIndex={0}
                >
                  <span
                    className={cn(
                      "font-mono text-[14px] w-[18px] text-center transition-[color,rotate] duration-[400ms]",
                      "max-[1100px]:hidden",
                      isOn ? "text-accent rotate-45 duration-[600ms] ease-soft" : "text-muted-2",
                    )}
                    aria-hidden="true"
                  >
                    {p.glyph}
                  </span>
                  <span
                    className={cn(
                      "display font-serif text-[clamp(28px,3.2vw,44px)] leading-none tracking-[-0.015em] text-cream whitespace-nowrap overflow-hidden text-ellipsis",
                      "transition-[opacity,color,letter-spacing,font-style] duration-500",
                      "max-[1100px]:text-[28px]",
                      isOn && "opacity-100 italic",
                      isPast && "opacity-[0.22]",
                      !isOn && !isPast && "opacity-[0.32]",
                      // Hover handling: non-active rows lift to 0.78, active stays at 1.
                      !isOn && "group-hover/row:opacity-[0.78]",
                    )}
                  >
                    {p.title}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-muted-2 whitespace-nowrap",
                      "transition-[opacity,translate] duration-[400ms] delay-[50ms]",
                      isOn ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2",
                    )}
                  >
                    <span>{p.type}</span>
                    <span className="text-line">·</span>
                    <span>{p.year}</span>
                    <span className="text-line">·</span>
                    <span
                      className={cn(
                        "px-1.5 py-0.5 border rounded-[2px]",
                        ROW_STATUS_STYLES[p.status] ?? "text-muted border-line",
                      )}
                    >
                      {p.status}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "absolute -bottom-px left-0 h-px bg-accent",
                      "transition-[width] duration-500 ease-soft",
                      isOn ? "w-full" : "w-0",
                    )}
                  ></span>
                </li>
              );
            })}
          </ol>

          {/* VIEWPORT */}
          <div className="flex flex-col gap-3.5">
            {/* Head: mono spec line above the frame */}
            {/* (Originally `.work-vp-head`, currently not rendered in JSX —
                keeping spec parity but no DOM node was emitted.) */}

            <div
              className={cn(
                "relative aspect-[16/10] bg-ink-2 border border-line overflow-hidden rounded-[3px]",
                // Transit wipe — when active project switches.
                transit &&
                  "after:content-[''] after:absolute after:inset-0 after:z-6 after:pointer-events-none after:bg-[linear-gradient(to_bottom,transparent_0%,color-mix(in_oklab,var(--color-accent)_18%,transparent)_48%,color-mix(in_oklab,var(--color-accent)_42%,transparent)_50%,color-mix(in_oklab,var(--color-accent)_18%,transparent)_52%,transparent_100%)] after:animate-vp-wipe",
              )}
            >
              {/* Brackets — viewfinder corners */}
              <span className="absolute top-3 left-3 w-[18px] h-[18px] border-l border-t border-accent opacity-85 z-5"></span>
              <span className="absolute top-3 right-3 w-[18px] h-[18px] border-r border-t border-accent opacity-85 z-5"></span>
              <span className="absolute bottom-16 left-3 w-[18px] h-[18px] border-l border-b border-accent opacity-85 z-5 max-[1100px]:bottom-3"></span>
              <span className="absolute bottom-16 right-3 w-[18px] h-[18px] border-r border-b border-accent opacity-85 z-5 max-[1100px]:bottom-3"></span>

              {/* Stacked stills — one active at a time, cross-fade */}
              {PROJECTS.map((p, i) => (
                <ProjectStill
                  key={i}
                  project={p}
                  active={i === active}
                  stillIdx={i === active ? stillIdx : 0}
                />
              ))}

              {/* Scan-line overlay (constant) */}
              <div
                className="absolute inset-0 pointer-events-none z-4 mix-blend-multiply opacity-50 bg-[repeating-linear-gradient(to_bottom,transparent_0px,transparent_2px,color-mix(in_oklab,black_16%,transparent)_3px,transparent_4px)]"
                aria-hidden="true"
              ></div>
              {/* Vignette */}
              <div
                className="absolute inset-0 pointer-events-none z-3 bg-[radial-gradient(ellipse_at_center,transparent_55%,color-mix(in_oklab,var(--color-ink)_65%,transparent)_100%)]"
                aria-hidden="true"
              ></div>

              {/* Thumb strip */}
              {project.stills.length > 1 && (
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-5 flex items-center gap-3.5 px-3 py-2 bg-ink/[0.78] backdrop-blur-sm border border-line rounded-[2px] max-[1100px]:static max-[1100px]:-mt-0.5">
                  <div className="flex gap-1.5 flex-1">
                    {project.stills.map((s, j) => (
                      <button
                        key={j}
                        className={cn(
                          "relative flex-1 h-[30px] border font-mono text-[10px] tracking-[0.1em] cursor-pointer",
                          "transition-all duration-[250ms] ease-out",
                          "flex items-center justify-center gap-1",
                          j === stillIdx
                            ? "bg-accent border-accent text-ink"
                            : "bg-ink-3 border-line text-muted hover:border-accent hover:text-cream",
                        )}
                        onMouseEnter={() => setStillIdx(j)}
                        onClick={() => setStillIdx(j)}
                        aria-label={s.label}
                      >
                        <span className="font-medium">
                          {String(j + 1).padStart(2, "0")}
                        </span>
                        {s.kind === "video" && (
                          <span
                            className={cn(
                              "text-[8px]",
                              j === stillIdx ? "text-ink" : "text-accent",
                            )}
                          >
                            ▶
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Auto-advance timer bar */}
              <div
                className="absolute left-0 right-0 bottom-0 h-0.5 bg-line z-7"
                aria-hidden="true"
              >
                <span
                  className="block h-full bg-accent origin-left transition-transform duration-100 ease-linear"
                  style={{ transform: `scaleX(${paused ? 0 : tick})` }}
                ></span>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Meta block: dek + role/stack/metrics + links ---- */}
        <div
          className={cn(
            "mt-14 grid grid-cols-[0.78fr_1.22fr] gap-14 items-start opacity-0 translate-y-5",
            "transition-[opacity,translate] duration-700 ease-out delay-100",
            "max-[1100px]:grid-cols-1 max-[1100px]:gap-8",
            vis && "opacity-100 translate-y-0",
          )}
          key={`meta-${active}`}
        >
          <p className="font-serif text-[clamp(20px,1.7vw,26px)] leading-[1.4] text-cream-2 opacity-85 tracking-[-0.005em] text-pretty pr-3 border-l border-accent pl-6 max-[1100px]:border-l-0 max-[1100px]:pl-0 max-[1100px]:border-t max-[1100px]:border-t-accent max-[1100px]:pt-4">
            {project.dek}
          </p>

          <dl className="grid grid-cols-2 gap-x-10 gap-y-7 [&_dt]:font-mono [&_dt]:text-[10px] [&_dt]:tracking-[0.18em] [&_dt]:uppercase [&_dt]:text-muted-2 [&_dt]:mb-2.5 [&_dd]:font-mono [&_dd]:text-[13px] [&_dd]:leading-[1.55] [&_dd]:text-muted [&_dd]:tracking-[0.02em]">
            <div className="border-t border-line pt-3.5">
              <dt>Role</dt>
              <dd>{project.role}</dd>
            </div>
            <div className="border-t border-line pt-3.5">
              <dt>Stack</dt>
              <dd>{project.skills.join(" · ")}</dd>
            </div>
            {project.metrics.length > 0 && (
              <div className="border-t border-line pt-3.5 col-span-full">
                <dt>Metrics</dt>
                <dd className="flex flex-wrap gap-8">
                  {project.metrics.map((m, j) => (
                    <span className="flex flex-col gap-1 min-w-[140px]" key={j}>
                      <span className="font-serif italic text-[clamp(28px,2.6vw,38px)] leading-none text-cream-2 opacity-80 tracking-[-0.01em]">
                        {m.value}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-2">
                        {m.label}
                      </span>
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>

          <div className="col-start-1 flex flex-wrap gap-2.5 mt-[22px] pl-6 max-[1100px]:col-start-1 max-[1100px]:pl-0">
            {project.links.map((l, j) => (
              <a
                key={j}
                href={l.url || "#"}
                className={cn(
                  "group/link inline-flex items-center gap-2.5 px-4 py-2.5 border border-line rounded-[2px] font-mono text-[11px] tracking-[0.12em] uppercase text-cream-2 bg-transparent",
                  "transition-all duration-[250ms] ease-out",
                  "hover:border-accent hover:text-accent hover:-translate-y-px",
                  LINK_BG[l.type],
                )}
              >
                <span className="font-mono text-[11px] text-accent">
                  {LINK_ICONS[l.type] || "→"}
                </span>
                <span>{l.text}</span>
                <span className="opacity-50 transition-[translate,opacity] duration-[250ms] ease-out group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:opacity-100">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
