import type { Service } from "@tabsircg/schemas/portfolio";
import { H2, H3 } from "@/components/ui/H2";
import { ServiceVisual } from "./service-visual";

export function Services({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <section id="services">
      <div
        className="relative"
        style={{ height: `${services.length * 150}vh` }}
        data-pin-steps={services.length}
        data-pin-step="0"
      >
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="page-shell w-full grid grid-cols-[0.85fr_1fr] items-center gap-16 max-xl:grid-cols-[1fr] max-xl:gap-10">
            <div data-reveal className="sticky top-0">
              <div className="relative h-5 mb-6">
                {services.map((s, i) => (
                  <div
                    key={s.title + i}
                    style={{ "--i": i } as React.CSSProperties}
                    className="svc-label absolute inset-0 font-mono text-xs tracking-widest text-muted"
                  >
                    <span className="text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="mx-1.5">/</span>
                    <span>{String(services.length).padStart(2, "0")}</span>
                    <span className="mx-2.5">—</span>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="relative mb-1 min-h-[clamp(130px,14vw,200px)]">
                {services.map((s, i) => (
                  <H2
                    key={s.title + i}
                    style={{ "--i": i } as React.CSSProperties}
                    className="svc-title absolute top-0 left-0 text-[clamp(48px,6vw,88px)] leading-none whitespace-pre-line"
                  >
                    {s.title}
                  </H2>
                ))}
              </div>

              <div className="relative mt-5 min-h-[120px]">
                {services.map((s, i) => (
                  <p
                    key={s.title + i}
                    style={{ "--i": i } as React.CSSProperties}
                    className="svc-desc absolute inset-0 max-w-[460px] text-cream-2"
                  >
                    {s.desc}
                  </p>
                ))}
              </div>
            </div>

            <div className="relative aspect-4/5 max-h-[70vh] overflow-hidden rounded-sm border border-line bg-ink-2 before:absolute before:inset-0 before:content-[''] before:opacity-40 before:bg-[linear-gradient(45deg,var(--color-ink-3)_25%,transparent_25%),linear-gradient(-45deg,var(--color-ink-3)_25%,transparent_25%)] before:bg-size-[12px_12px]">
              {services.map((s, i) => (
                <div
                  key={s.title + i}
                  style={{ "--i": i } as React.CSSProperties}
                  className="svc-frame absolute inset-0 flex flex-col justify-end p-7"
                >
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

          <div className="absolute right-(--gutter) bottom-10 left-(--rail-gutter) mx-auto flex max-w-(--max-w) gap-2">
            {services.map((s, i) => (
              <div
                key={s.title + i}
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
