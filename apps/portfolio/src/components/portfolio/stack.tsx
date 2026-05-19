import { cn } from "@/lib/utils";

/* =====================================================================
   Tech stack — categories of tools, with proficiency dots.
   ===================================================================== */

const STACK_CATEGORIES: { label: string; items: [string, number][] }[] = [
  {
    label: "Front-end",
    items: [
      ["React / Next.js", 4],
      ["TypeScript", 4],
      ["Tailwind / CSS", 4],
      ["Framer / Motion", 3],
      ["Vue (legacy)", 2],
    ],
  },
  {
    label: "Back-end",
    items: [
      ["Node.js / Express", 4],
      ["Go", 3],
      ["Python / FastAPI", 3],
      ["PostgreSQL", 4],
      ["Redis / BullMQ", 3],
    ],
  },
  {
    label: "Infra & DevOps",
    items: [
      ["Docker / Compose", 4],
      ["AWS (ECS, RDS, S3)", 3],
      ["Terraform", 2],
      ["GitHub Actions", 4],
      ["Grafana / Loki", 3],
    ],
  },
  {
    label: "Craft & tooling",
    items: [
      ["Figma + dev hand-off", 3],
      ["Vitest / Playwright", 3],
      ["Linear / Notion", 4],
      ["Cmd-line / Neovim", 4],
      ["Design systems", 4],
    ],
  },
];

export function Stack() {
  return (
    <section
      id="stack"
      className={cn(
        "py-[180px]",
        "bg-[linear-gradient(180deg,transparent,color-mix(in_oklab,var(--color-accent)_2%,transparent),transparent)]",
      )}
    >
      <span className="margin-note top-[260px]">
        stack-fluent,
        <br />
        not stack-religious.
      </span>
      <div className="page-shell">
        <div
          className={cn(
            "grid grid-cols-2 gap-20 mb-20 items-end",
            "max-xl:grid-cols-1",
          )}
        >
          <h2
            className={cn(
              "font-serif font-normal tracking-tight font-features-['liga','kern']",
              "text-[clamp(40px,5.5vw,76px)] leading-[1.02]",
            )}
          >
            The tools
            <br />I lean on
            <br />
            <em className="text-accent italic">most days.</em>
          </h2>
          <p
            className={cn("text-base text-cream-2 max-w-[420px] leading-[1.6]")}
          >
            Stack-fluent rather than stack-religious. I use what fits the team,
            the deadline, and the problem. These are the ones I've shipped to
            production this year.
          </p>
        </div>
        <div
          data-reveal-stagger
          className={cn(
            "grid grid-cols-4 border-t border-l border-line",
            "max-xl:grid-cols-2",
          )}
        >
          {STACK_CATEGORIES.map((cat, i) => (
            <div
              key={i}
              style={{ "--i": i } as React.CSSProperties}
              className={cn(
                "border-r border-b border-line",
                "px-6 py-7 min-h-[220px]",
                "transition-[background] duration-300",
                "hover:bg-accent/3",
              )}
            >
              <h3
                className={cn(
                  "flex items-center gap-2 mb-[22px] font-normal",
                  "font-mono text-xxs uppercase tracking-widest text-accent",
                  "after:content-[''] after:flex-1 after:h-px after:bg-line",
                )}
              >
                {String(i + 1).padStart(2, "0")} · {cat.label}
              </h3>
              <div className="flex flex-col gap-2.5">
                {cat.items.map(([name, lvl], j) => (
                  <div
                    key={j}
                    className={cn(
                      "flex items-center justify-between py-1",
                      "font-mono text-sm text-cream-2",
                      "border-b border-dashed border-transparent",
                      "transition-[color,border-color] duration-200",
                      "hover:text-accent hover:border-line",
                    )}
                  >
                    <span>{name}</span>
                    <span className="flex gap-0.5">
                      {[0, 1, 2, 3, 4].map((k) => (
                        <span
                          key={k}
                          className={cn(
                            "w-1 h-1 rounded-full",
                            k < lvl ? "bg-accent" : "bg-line",
                          )}
                        />
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
