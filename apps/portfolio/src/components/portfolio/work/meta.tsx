import Link from "next/link";
import type { Project } from "@tabsircg/schemas/portfolio";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/ui/rich-text";
import { LINK_BG, LINK_ICONS } from "./glyphs";

export function WorkMeta({
  projects,
  className,
}: {
  projects: Project[];
  className?: string;
}) {
  return (
    <div data-reveal className={cn("grid delay-200", className)}>
      {projects.map((project, i) => (
        <div
          key={project.title + i}
          data-work-meta-idx={i}
          style={{ "--i": i } as React.CSSProperties}
          className="work-meta grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-10 max-lg:gap-5 items-start"
        >
          <div>
            <p className="text-lg max-lg:text-base text-cream-2 opacity-85 text-pretty pr-3 border-l border-accent pl-6 max-lg:pl-0 max-lg:pr-0 max-lg:border-none">
              <RichText text={project.dek} />
            </p>

            <div className="flex gap-2">
              {project.links.map((l, j) => {
                const className = cn(
                  "group/link inline-flex mt-6 items-center gap-2 px-4 py-2 max-lg:py-1.5 max-lg:px-2.5 max-lg:text-xxs border border-line rounded-xs font-mono text-xs tracking-widest uppercase text-cream-2 bg-transparent transition-all duration-250 ease-out hover:border-accent hover:text-accent hover:-translate-y-px",
                  LINK_BG[l.type],
                );
                const inner = (
                  <>
                    <span className="font-mono text-xs text-accent">
                      {LINK_ICONS[l.type] || "→"}
                    </span>
                    <span>
                      <RichText text={l.text} />
                    </span>
                    <span className="opacity-50 transition-[translate,opacity] duration-250 ease-out group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:opacity-100">
                      ↗
                    </span>
                  </>
                );
                return (
                  <Link key={j} href={l.url} className={className}>
                    {inner}
                  </Link>
                );
              })}
            </div>
          </div>

          <dl className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-x-10 gap-y-7 [&_dt]:font-mono [&_dt]:text-xxs [&_dt]:tracking-widest [&_dt]:uppercase [&_dt]:text-muted-2 [&_dt]:mb-2.5 [&_dd]:font-mono [&_dd]:text-sm/relaxed [&_dd]:text-muted [&_dd]:tracking-wide max-lg:gap-x-5 max-lg:gap-y-3 max-lg:[&_dd]:text-xs">
            <div className="pt-3.5">
              <dt>Role</dt>
              <dd>
                <RichText text={project.role} />
              </dd>
            </div>
            <div className="pt-3.5">
              <dt>Stack</dt>
              <dd className="flex flex-wrap gap-2">
                {project.skills.map((skill, j) => (
                  <span
                    key={j}
                    className="rounded-xs border border-line px-2.5 py-1 text-xs max-lg:text-xxs leading-none text-muted transition-colors hover:text-accent/70 hover:border-accent/50"
                  >
                    <RichText text={skill} />
                  </span>
                ))}
              </dd>
            </div>
            {project.metrics.length > 0 && (
              <div className="border-t border-line pt-6 col-span-full">
                <dt>Metrics</dt>
                <dd className="flex flex-wrap gap-8 mt-4">
                  {project.metrics.map((m, j) => (
                    <span className="flex flex-col gap-2 min-w-[140px]" key={j}>
                      <span className="font-serif text-3xl max-lg:text-2xl leading-none text-cream-2 opacity-80 tracking-tight">
                        <RichText text={m.value} />
                      </span>
                      <span className="font-mono text-xxs tracking-widest uppercase text-muted-2">
                        <RichText text={m.label} />
                      </span>
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      ))}
    </div>
  );
}
