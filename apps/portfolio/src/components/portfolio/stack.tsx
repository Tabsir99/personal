import type { SkillGroup } from "@tabsircg/schemas/portfolio";
import { cn } from "@/lib/utils";
import { H2, H3 } from "../ui/H2";
import { RichText } from "../ui/rich-text";

export function Stack({ groups }: { groups: SkillGroup[] }) {
  return (
    <section id="stack" className="page-shell flex flex-col gap-16">
      <span className="margin-note">No frameworks worshipped.</span>
      <H2>
        The tools
        <br />I lean on
        <br />
        <em className="text-accent italic">most days.</em>
      </H2>
      <div
        data-reveal-stagger
        className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] border-t border-l border-line"
      >
        {groups.map((cat, i) => (
          <div
            key={cat.title + i}
            style={{ "--i": i } as React.CSSProperties}
            className="border-r border-b border-line p-7 min-h-60 transition-[background] hover:bg-accent/3"
          >
            <H3 className="flex items-center gap-3 mb-5 text-accent after:content-[''] after:flex-1 after:h-px after:bg-line">
              {String(i + 1).padStart(2, "0")} · <RichText text={cat.title} />
            </H3>
            <div className="flex flex-col gap-4">
              {cat.skills.map(({ name, level }, j) => (
                <div
                  key={name + j}
                  className="flex items-center justify-between font-mono text-sm max-lg:text-xs transition-colors duration-200 hover:text-accent"
                >
                  <span>
                    <RichText text={name} />
                  </span>
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
