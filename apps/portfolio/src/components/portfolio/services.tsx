import { H2, H3 } from "@/components/ui/H2";
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
    <section id="services">
      <div className="relative h-[400vh]" data-pin-steps="4" data-pin-step="0">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="page-shell w-full grid grid-cols-[0.85fr_1fr] items-center gap-16 max-xl:grid-cols-[1fr] max-xl:gap-10">
            <div data-reveal className="sticky top-0">
              {/* Index label stack */}
              <div className="relative h-5 mb-6">
                {SERVICES.map((s, i) => (
                  <div
                    key={i}
                    style={{ "--i": i } as React.CSSProperties}
                    className="svc-label absolute inset-0 font-mono text-xs tracking-widest text-muted"
                  >
                    <span className="text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="mx-1.5">/</span>
                    <span>{String(SERVICES.length).padStart(2, "0")}</span>
                    <span className="mx-2.5">—</span>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Title stack */}
              <div className="relative mb-1 min-h-[clamp(130px,14vw,200px)]">
                {SERVICES.map((s, i) => (
                  <H2
                    key={i}
                    style={{ "--i": i } as React.CSSProperties}
                    className="svc-title absolute top-0 left-0 text-[clamp(48px,6vw,88px)] leading-none whitespace-pre-line"
                  >
                    {s.title}
                  </H2>
                ))}
              </div>

              {/* Desc stack */}
              <div className="relative mt-5 min-h-[120px]">
                {SERVICES.map((s, i) => (
                  <p
                    key={i}
                    style={{ "--i": i } as React.CSSProperties}
                    className="svc-desc absolute inset-0 max-w-[460px] text-cream-2"
                  >
                    {s.desc}
                  </p>
                ))}
              </div>
            </div>

            {/* Frame stack */}
            <div className="relative aspect-4/5 max-h-[70vh] overflow-hidden rounded-sm border border-line bg-ink-2 before:absolute before:inset-0 before:content-[''] before:opacity-40 before:bg-[linear-gradient(45deg,var(--color-ink-3)_25%,transparent_25%),linear-gradient(-45deg,var(--color-ink-3)_25%,transparent_25%)] before:bg-size-[12px_12px]">
              {SERVICES.map((s, i) => (
                <div
                  key={i}
                  style={{ "--i": i } as React.CSSProperties}
                  className="svc-frame absolute inset-0 flex flex-col justify-end p-7"
                >
                  <div className="absolute top-7 right-7 font-mono text-xs tracking-widest text-muted">
                    {s.frameNum}
                  </div>
                  <ServiceVisual idx={i} />
                  <div className="relative z-2">
                    <div className="mb-2.5 font-mono text-xs uppercase tracking-widest text-accent">
                      {s.frameLabel}
                    </div>
                    <H3 variant="serif" className="mb-3.5">
                      {s.frameTitle}
                    </H3>
                    <ul className="list-none font-mono text-xs tracking-wider text-cream-2">
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
