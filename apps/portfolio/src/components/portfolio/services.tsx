"use client";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ServiceVisual } from "./service-visual";

/* ===== Services — pinned scroll experience =====
   Wrap is 400vh tall. As user scrolls through it, services advance.
*/

const SERVICES = [
  {
    label: "Build",
    title: "Web products,\nend-to-end.",
    desc: 'From the first wireframe to the final deploy script — I take projects from "what if" to "v1 in production". One developer, fewer hand-off seams.',
    frameNum: "S/01",
    frameLabel: "Full-stack delivery",
    frameTitle: "Marketplace, dashboard, or SaaS — I bring it up.",
    items: [
      "Spec → architecture",
      "Design system + UI",
      "API, auth, payments",
      "CI/CD + monitoring",
    ],
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
  },
  {
    label: "Sparring",
    title: "Technical\nsparring partner.",
    desc: 'Already have a team? I plug in for tricky weeks — architecture reviews, hairy bug-hunts, design-system audits, "is this PR sane?" calls.',
    frameNum: "S/04",
    frameLabel: "Advisory & audits",
    frameTitle: "A senior pair of eyes, by the hour or sprint.",
    items: [
      "Architecture review",
      "Performance audit",
      "Code-review on retainer",
      "Hiring & tech interviews",
    ],
  },
];

// Per-property timing + delay don't translate to a single Tailwind utility,
// so the title/desc cross-fade transitions live as arbitrary `[transition:...]`.
const TITLE_TRANSITION_EXIT =
  "[transition:opacity_220ms_ease-out,translate_220ms_ease-out]";
const TITLE_TRANSITION_ACTIVE =
  "[transition:opacity_320ms_cubic-bezier(0.22,1,0.36,1)_120ms,translate_360ms_cubic-bezier(0.22,1,0.36,1)_120ms]";
const DESC_TRANSITION_EXIT =
  "[transition:opacity_220ms_ease-out,translate_220ms_ease-out]";
const DESC_TRANSITION_ACTIVE =
  "[transition:opacity_320ms_cubic-bezier(0.22,1,0.36,1)_220ms,translate_360ms_cubic-bezier(0.22,1,0.36,1)_220ms]";

export function Services() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [subProgress, setSubProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;
      const idx = Math.min(
        SERVICES.length - 1,
        Math.floor(p * SERVICES.length),
      );
      const sub = p * SERVICES.length - idx;
      setStep(idx);
      setSubProgress(sub);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="services"
      data-screen-label="03 Services"
      style={{ padding: 0 }}
    >
      <div ref={wrapRef} className="relative h-[400vh]">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="mx-auto grid w-full max-w-(--max-w) grid-cols-[0.85fr_1fr] items-center gap-16 pr-(--gutter) pl-(--rail-gutter) max-[1100px]:grid-cols-[1fr] max-[1100px]:gap-10">
            <div className="sticky top-0">
              <div className="mb-6 font-mono text-[11px] tracking-[0.16em] text-muted">
                <span className="text-accent">
                  {String(step + 1).padStart(2, "0")}
                </span>
                <span style={{ margin: "0 6px" }}>/</span>
                <span>{String(SERVICES.length).padStart(2, "0")}</span>
                <span style={{ margin: "0 10px" }}>—</span>
                <span>{SERVICES[step].label}</span>
              </div>
              <div className="relative mb-1 min-h-[clamp(130px,14vw,200px)]">
                {SERVICES.map((s, i) => (
                  <h2
                    key={i}
                    className={cn(
                      "absolute top-0 left-0 font-serif font-normal font-features-['liga','kern'] text-[clamp(48px,6vw,88px)] leading-none tracking-[-0.02em] whitespace-pre-line",
                      i === step
                        ? `opacity-100 translate-y-0 pointer-events-auto ${TITLE_TRANSITION_ACTIVE}`
                        : i < step
                          ? `opacity-0 translate-y-[-8px] pointer-events-none ${TITLE_TRANSITION_EXIT}`
                          : `opacity-0 translate-y-[14px] pointer-events-none ${TITLE_TRANSITION_EXIT}`,
                    )}
                  >
                    {s.title}
                  </h2>
                ))}
              </div>
              <div className="relative mt-5 min-h-[120px] max-w-[460px] text-[17px] leading-[1.55] text-cream-2">
                {SERVICES.map((s, i) => (
                  <p
                    key={i}
                    className={cn(
                      "absolute inset-0",
                      i === step
                        ? `opacity-100 translate-y-0 pointer-events-auto ${DESC_TRANSITION_ACTIVE}`
                        : i < step
                          ? `opacity-0 translate-y-[-6px] pointer-events-none ${DESC_TRANSITION_EXIT}`
                          : `opacity-0 translate-y-[12px] pointer-events-none ${DESC_TRANSITION_EXIT}`,
                    )}
                  >
                    {s.desc}
                  </p>
                ))}
              </div>
            </div>
            <div className="relative aspect-4/5 max-h-[70vh] overflow-hidden rounded-[4px] border border-line bg-ink-2 before:absolute before:inset-0 before:content-[''] before:opacity-40 before:bg-[linear-gradient(45deg,var(--color-ink-3)_25%,transparent_25%),linear-gradient(-45deg,var(--color-ink-3)_25%,transparent_25%)] before:bg-size-[12px_12px]">
              {SERVICES.map((s, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute inset-0 flex flex-col justify-end p-7 transition-opacity duration-[0.6s]",
                    i === step ? "opacity-100" : "opacity-0",
                  )}
                >
                  <div className="absolute top-7 right-7 font-mono text-[11px] tracking-widest text-muted">
                    {s.frameNum}
                  </div>
                  <ServiceVisual
                    idx={i}
                    active={i === step}
                    sub={i === step ? subProgress : 0}
                  />
                  <div style={{ position: "relative", zIndex: 2 }}>
                    <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
                      {s.frameLabel}
                    </div>
                    <h4 className="mb-3.5 font-serif text-[28px] font-normal leading-[1.1] tracking-[-0.01em]">
                      {s.frameTitle}
                    </h4>
                    <ul className="list-none font-mono text-[11px] tracking-[0.06em] text-cream-2">
                      {s.items.map((it, j) => (
                        <li
                          key={j}
                          className="flex items-center gap-2.5 border-t border-line py-1.5 before:text-accent before:content-['→']"
                        >
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute right-(--gutter) bottom-10 left-(--rail-gutter) mx-auto flex max-w-(--max-w) gap-2">
            {SERVICES.map((_, i) => (
              <div
                className="relative h-0.5 flex-1 overflow-hidden bg-line"
                key={i}
              >
                <span
                  className="absolute inset-0 origin-left bg-accent transition-transform duration-[0.4s]"
                  style={{
                    transform: `scaleX(${i < step ? 1 : i === step ? subProgress : 0})`,
                  }}
                ></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
