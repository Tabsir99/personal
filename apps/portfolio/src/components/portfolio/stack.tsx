import type { SkillGroup } from "@tabsircg/schemas/portfolio";

import { cn } from "@/lib/utils";
import { H2, H3 } from "../ui/H2";

export function Stack({ groups }: { groups: SkillGroup[] }) {
  return (
    <section id="stack" className="page-shell">
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
          the deadline, and the problem. These are the ones I&apos;ve shipped to
          production this year.
        </p>
      </div>
      <div
        data-reveal-stagger
        className="grid grid-cols-4 border-t border-l border-line max-xl:grid-cols-2"
      >
        {groups.map((cat, i) => (
          <div
            key={cat.title + i}
            style={{ "--i": i } as React.CSSProperties}
            className="border-r border-b border-line p-7 min-h-60 transition-[background] hover:bg-accent/3"
          >
            <H3 className="flex items-center gap-3 mb-5 text-accent after:content-[''] after:flex-1 after:h-px after:bg-line">
              {String(i + 1).padStart(2, "0")} · {cat.title}
            </H3>
            <div className="flex flex-col gap-4">
              {cat.skills.map(({ name, level }, j) => (
                <div
                  key={name + j}
                  className="flex items-center justify-between font-mono text-sm transition-colors duration-200 hover:text-accent"
                >
                  <span>{name}</span>
                  <span className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((k) => (
                      <span
                        key={k}
                        className={cn(
                          "size-1 rounded-full",
                          k < level ? "bg-accent" : "bg-line",
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
