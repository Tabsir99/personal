import type { Service } from "@tabsircg/schemas/portfolio";
import { H2, H3 } from "@/components/ui/H2";
import { RichText } from "@/components/ui/rich-text";
import { ServiceVisual } from "./service-visual";

export function Services({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <section
      id="services"
      className="page-shell"
      style={{ height: `${services.length * 150}vh` }}
      data-pin-steps={services.length}
    >
      <div className="sticky top-0 h-screen overflow-hidden w-full grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] items-center gap-16">
        <div data-reveal className="max-sm:hidden">
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
                <span>
                  <RichText text={s.label} />
                </span>
              </div>
            ))}
          </div>

          <div className="relative mb-1 min-h-[clamp(130px,14vw,200px)]">
            {services.map((s, i) => (
              <H2
                key={s.title + i}
                style={{ "--i": i } as React.CSSProperties}
                className="svc-title absolute top-0 left-0 whitespace-pre-line"
              >
                <RichText text={s.title} />
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
                <RichText text={s.desc} />
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
                <H3 variant="serif" className="mb-3.5">
                  <RichText text={s.frameTitle} />
                </H3>
                <ul className="list-none font-mono text-xs max-lg:text-xxs tracking-wider text-cream-2">
                  {s.items.map((it, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2.5 border-t border-line py-1.5 before:text-accent before:content-['→']"
                    >
                      <RichText text={it} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
