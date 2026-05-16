import { cn } from "@/lib/utils";

/* ===== About ===== */
export function About() {
  const text =
    "I write code for the messy middle — where product specs collide with reality. I care about response budgets, accessible focus rings, sensible primary keys, and shipping things small enough to fix on a Friday. Two years in, mostly across SaaS dashboards, marketplaces, and a handful of internal tools nobody ever sees but everyone depends on.";
  const words = text.split(" ");

  return (
    <section id="about" className="py-[200px]" data-screen-label="02 About">
      <span className="margin-note top-[220px]">no frameworks worshipped.</span>

      <div className={"container"}>
        <div
          className={cn(
            "grid items-start gap-[120px]",
            "grid-cols-[1fr_2fr] max-[1100px]:grid-cols-1 max-[1100px]:gap-10",
          )}
        >
          <div data-reveal>
            <div
              className={cn(
                "inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted",
                "before:content-[''] before:w-6 before:h-px before:bg-muted",
              )}
            >
              A short note
            </div>
            <div
              className={cn(
                "grid grid-cols-2 gap-x-10 gap-y-7",
                "mt-16 pt-10 border-t border-line",
              )}
            >
              <div className="flex flex-col gap-1.5">
                <span className="font-serif text-[48px] leading-none text-cream">
                  ∼2
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  Years shipping
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-serif text-[48px] leading-none text-cream">
                  17
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  Projects merged
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-serif text-[48px] leading-none text-cream">
                  4
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  Stacks daily
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-serif text-[48px] leading-none text-cream">
                  0
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  Frameworks worshipped
                </span>
              </div>
            </div>
          </div>
          <div
            data-reveal-words
            className={cn(
              "font-serif text-[clamp(28px,3.2vw,42px)] leading-[1.22] tracking-[-0.015em] text-cream",
            )}
          >
            {words.map((w, i) => {
              const isAccent = ["quiet", "craft", "reality.", "middle"].some(
                (t) => w.toLowerCase().includes(t),
              );
              return (
                <span
                  key={i}
                  className="word"
                  style={{ "--word-i": i } as React.CSSProperties}
                >
                  {isAccent ? <em className="text-accent italic">{w}</em> : w}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
