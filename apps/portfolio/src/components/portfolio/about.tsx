import { cn } from "@/lib/utils";

const STATS = [
  { value: "∼2", label: "Years shipping" },
  { value: "17", label: "Projects merged" },
  { value: "4", label: "Stacks daily" },
  { value: "0", label: "Frameworks worshipped" },
];

/* ===== About ===== */
export function About() {
  const text =
    "I write code for the messy middle — where product specs collide with reality. I care about response budgets, accessible focus rings, sensible primary keys, and shipping things small enough to fix on a Friday. Two years in, mostly across SaaS dashboards, marketplaces, and a handful of internal tools nobody ever sees but everyone depends on.";
  const words = text.split(" ");

  return (
    <section id="about" className="py-[200px]">
      <span className="margin-note top-[220px]">no frameworks worshipped.</span>

      <div className="page-shell">
        <div
          className={cn(
            "grid items-start gap-[120px]",
            "grid-cols-[1fr_2fr] max-xl:grid-cols-1 max-xl:gap-10",
          )}
        >
          <div data-reveal>
            <div
              className={cn(
                "inline-flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted",
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
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col gap-1.5">
                  <span className="font-serif text-[48px] leading-none text-cream">
                    {s.value}
                  </span>
                  <span className="font-mono text-xxs uppercase tracking-widest text-muted">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div
            data-reveal-words
            className={cn(
              "font-serif text-[clamp(28px,3.2vw,42px)] leading-[1.22] tracking-tight text-cream",
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
