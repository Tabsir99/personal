import Link from "next/link";

import type { Project } from "@tabsircg/schemas/portfolio";

import { cn } from "@/lib/utils";
import { LINK_BG, LINK_ICONS } from "./glyphs";

/* All stacks share one grid cell; only the active one has opacity 1. */
export function WorkMeta({
  projects,
  className,
}: {
  projects: Project[];
  className?: string;
}) {
  return (
    <div
      data-reveal
      className={cn("grid", className)}
      style={{ animationDelay: "100ms" }}
    >
      {projects.map((project, i) => (
        <div
          key={project.title + i}
          data-work-meta-idx={i}
          style={{ "--i": i } as React.CSSProperties}
          className="work-meta grid grid-cols-[0.78fr_1.22fr] gap-14 items-start max-xl:grid-cols-1 max-xl:gap-8"
        >
          <p className="font-serif text-[clamp(20px,1.7vw,26px)] leading-[1.4] text-cream-2 opacity-85 tracking-[-0.005em] text-pretty pr-3 border-l border-accent pl-6 max-xl:border-l-0 max-xl:pl-0 max-xl:border-t max-xl:border-t-accent max-xl:pt-4">
            {project.dek}
          </p>

          <dl className="grid grid-cols-2 gap-x-10 gap-y-7 [&_dt]:font-mono [&_dt]:text-xxs [&_dt]:tracking-widest [&_dt]:uppercase [&_dt]:text-muted-2 [&_dt]:mb-2.5 [&_dd]:font-mono [&_dd]:text-sm/relaxed [&_dd]:text-muted [&_dd]:tracking-wide">
            <div className="border-t border-line pt-3.5">
              <dt>Role</dt>
              <dd>{project.role}</dd>
            </div>
            <div className="border-t border-line pt-3.5">
              <dt>Stack</dt>
              <dd>{project.skills.join(" · ")}</dd>
            </div>
            {project.metrics.length > 0 && (
              <div className="border-t border-line pt-3.5 col-span-full">
                <dt>Metrics</dt>
                <dd className="flex flex-wrap gap-8">
                  {project.metrics.map((m, j) => (
                    <span className="flex flex-col gap-1 min-w-[140px]" key={j}>
                      <span className="font-serif italic text-[clamp(28px,2.6vw,38px)] leading-none text-cream-2 opacity-80 tracking-tight">
                        {m.value}
                      </span>
                      <span className="font-mono text-xxs tracking-widest uppercase text-muted-2">
                        {m.label}
                      </span>
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>

          <div className="col-span-full flex flex-wrap gap-2.5 pl-6 max-xl:pl-0">
            {project.links.map((l, j) => {
              const isReal = !!l.url && l.url !== "#";
              const className = cn(
                "group/link inline-flex items-center gap-2.5 px-4 py-2.5 border border-line rounded-xs font-mono text-xs tracking-widest uppercase text-cream-2 bg-transparent transition-all duration-250 ease-out hover:border-accent hover:text-accent hover:-translate-y-px",
                LINK_BG[l.type],
              );
              const inner = (
                <>
                  <span className="font-mono text-xs text-accent">
                    {LINK_ICONS[l.type] || "→"}
                  </span>
                  <span>{l.text}</span>
                  <span className="opacity-50 transition-[translate,opacity] duration-250 ease-out group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:opacity-100">
                    ↗
                  </span>
                </>
              );
              return isReal ? (
                <Link key={j} href={l.url} className={className}>
                  {inner}
                </Link>
              ) : (
                <span key={j} className={className} aria-disabled="true">
                  {inner}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
