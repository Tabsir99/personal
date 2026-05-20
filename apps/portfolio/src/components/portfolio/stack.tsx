import { cn } from "@/lib/utils";
import { H2 } from "../ui/H2";

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
    <section id="stack" className={cn("page-shell")}>
      <span className="margin-note top-[260px]">
        stack-fluent,
        <br />
        not stack-religious.
      </span>
      <div className="grid grid-cols-2 gap-20 mb-20 items-end max-xl:grid-cols-1">
        <H2>
          The tools
          <br />I lean on
          <br />
          <em className="text-accent italic">most days.</em>
        </H2>
        <p className="max-w-[420px]">
          Stack-fluent rather than stack-religious. I use what fits the team,
          the deadline, and the problem. These are the ones I've shipped to
          production this year.
        </p>
      </div>
      <div
        data-reveal-stagger
        className="grid grid-cols-4 border-t border-l border-line max-xl:grid-cols-2"
      >
        {STACK_CATEGORIES.map((cat, i) => (
          <div
            key={i}
            style={{ "--i": i } as React.CSSProperties}
            className="border-r border-b border-line p-7 min-h-60 transition-[background] hover:bg-accent/3"
          >
            <h3 className="flex items-center gap-3 mb-5 font-mono text-xs uppercase tracking-widest text-accent after:content-[''] after:flex-1 after:h-px after:bg-line">
              {String(i + 1).padStart(2, "0")} · {cat.label}
            </h3>
            <div className="flex flex-col gap-4">
              {cat.items.map(([name, lvl], j) => (
                <div
                  key={j}
                  className="flex items-center justify-between font-mono text-sm transition-colors duration-200 hover:text-accent"
                >
                  <span>{name}</span>
                  <span className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((k) => (
                      <span
                        key={k}
                        className={cn(
                          "size-1 rounded-full",
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
    </section>
  );
}
