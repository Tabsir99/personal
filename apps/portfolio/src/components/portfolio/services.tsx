import { cn } from "@/lib/utils";
import { ServiceVisual } from "./service-visual";

/* Services — pinned scroll experience. The wrap is 400vh tall and
   declares data-pin-steps="4"; the active-section island writes
   data-pin-step + --pin-sub. Cross-fades, frame visibility, and the
   bottom progress bars all read those signals via services.css. */

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

export function Services() {
  return (
    <section id="services" data-screen-label="03 Services" style={{ padding: 0 }}>
      <div
        className="relative h-[400vh]"
        data-pin-steps="4"
        data-pin-step="0"
      >
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="mx-auto grid w-full max-w-(--max-w) grid-cols-[0.85fr_1fr] items-center gap-16 pr-(--gutter) pl-(--rail-gutter) max-[1100px]:grid-cols-[1fr] max-[1100px]:gap-10">
            <div data-reveal className="sticky top-0">
              {/* Index label stack */}
              <div className="relative h-[18px] mb-6">
                {SERVICES.map((s, i) => (
                  <div
                    key={i}
                    style={{ "--i": i } as React.CSSProperties}
                    className="svc-label absolute inset-0 font-mono text-[11px] tracking-[0.16em] text-muted"
                  >
                    <span className="text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ margin: "0 6px" }}>/</span>
                    <span>{String(SERVICES.length).padStart(2, "0")}</span>
                    <span style={{ margin: "0 10px" }}>—</span>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Title stack */}
              <div className="relative mb-1 min-h-[clamp(130px,14vw,200px)]">
                {SERVICES.map((s, i) => (
                  <h2
                    key={i}
                    style={{ "--i": i } as React.CSSProperties}
                    className={cn(
                      "svc-title absolute top-0 left-0 font-serif font-normal font-features-['liga','kern']",
                      "text-[clamp(48px,6vw,88px)] leading-none tracking-[-0.02em] whitespace-pre-line",
                    )}
                  >
                    {s.title}
                  </h2>
                ))}
              </div>

              {/* Desc stack */}
              <div className="relative mt-5 min-h-[120px]">
                {SERVICES.map((s, i) => (
                  <p
                    key={i}
                    style={{ "--i": i } as React.CSSProperties}
                    className="svc-desc absolute inset-0 max-w-[460px] text-[17px] leading-[1.55] text-cream-2"
                  >
                    {s.desc}
                  </p>
                ))}
              </div>
            </div>

            {/* Frame stack */}
            <div className="relative aspect-4/5 max-h-[70vh] overflow-hidden rounded-[4px] border border-line bg-ink-2 before:absolute before:inset-0 before:content-[''] before:opacity-40 before:bg-[linear-gradient(45deg,var(--color-ink-3)_25%,transparent_25%),linear-gradient(-45deg,var(--color-ink-3)_25%,transparent_25%)] before:bg-size-[12px_12px]">
              {SERVICES.map((s, i) => (
                <div
                  key={i}
                  style={{ "--i": i } as React.CSSProperties}
                  className="svc-frame absolute inset-0 flex flex-col justify-end p-7"
                >
                  <div className="absolute top-7 right-7 font-mono text-[11px] tracking-widest text-muted">
                    {s.frameNum}
                  </div>
                  <ServiceVisual idx={i} />
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

          {/* Bottom progress bars */}
          <div className="absolute right-(--gutter) bottom-10 left-(--rail-gutter) mx-auto flex max-w-(--max-w) gap-2">
            {SERVICES.map((_, i) => (
              <div
                key={i}
                className="svc-bar relative h-0.5 flex-1 overflow-hidden bg-line"
              >
                <span
                  style={{ "--i": i } as React.CSSProperties}
                  className="svc-bar-fill absolute inset-0 bg-accent"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
