import type { Project } from "@tabsircg/schemas/portfolio";
import { WorkViewport } from "./viewport";
import { WorkMeta } from "./meta";
import { WorkStateIsland } from "./state-island";
import { H2, H3 } from "@/components/ui/H2";
import { NavLink } from "@/components/ui/nav-link";
import { glyphFor, ROW_STATUS_STYLES } from "./glyphs";
import { cn } from "@/lib/utils";

/* List/viewport/meta are server-rendered; state-island writes data-*
   + CSS vars on the section, CSS does the cross-fade choreography. */
export function Work({ projects }: { projects: Project[] }) {
  return (
    <section
      id="work"
      data-work-section=""
      data-work-active="0"
      data-work-still="0"
      data-work-transit="0"
      style={
        {
          "--work-active": 0,
          "--work-still": 0,
        } as React.CSSProperties
      }
      className="page-shell grid grid-cols-[0.75fr_1.25fr] gap-8 max-xl:grid-cols-1"
    >
      <WorkStateIsland />

      <span className="margin-note">
        {projects.length} recent,
        <br />
        many more to come.
      </span>

      <header data-reveal className="flex justify-between col-span-2 mb-8">
        <H2>
          <em>Selected</em>
          <br />
          work.
        </H2>
        <div className="flex flex-col gap-4">
          <p className="max-w-md leading-relaxed">
            Quiet UIs, opinionated back-ends, and a couple of weekends that
            quietly turned into demos. Hover the index to wander.
          </p>
          <NavLink href="#work" underline>
            The full archive
          </NavLink>
        </div>
      </header>

      <ol
        data-reveal-stagger
        className="flex flex-col list-none border-t border-line"
      >
        {projects.map((p, i) => (
          <li
            key={p.title + i}
            data-work-row-idx={i}
            tabIndex={0}
            role="button"
            aria-label={`Show ${p.title} (${p.type}, ${p.year}, ${p.status})`}
            style={{ "--i": i } as React.CSSProperties}
            className="work-row group/row relative grid grid-cols-[auto_auto_1fr_auto] items-center gap-5 py-[22px] pr-1.5 border-b border-line cursor-pointer outline-hidden focus-visible:outline-2 focus-visible:outline-accent max-xl:grid-cols-[auto_1fr_auto]"
          >
            <span
              className="row-glyph font-mono text-[14px] w-5 text-center max-xl:hidden"
              aria-hidden="true"
            >
              {glyphFor(p.tag, i)}
            </span>
            <H3 className="row-title" variant="serif">
              {p.title}
            </H3>
            <span className="row-meta inline-flex items-center gap-1.5 font-mono text-xxs tracking-widest uppercase text-muted-2 whitespace-nowrap">
              <span>{p.type}</span>
              <span className="text-line">·</span>
              <span>{p.year}</span>
              <span className="text-line">·</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 border rounded-xs",
                  ROW_STATUS_STYLES[p.status] ?? "text-muted border-line",
                )}
              >
                {p.status}
              </span>
            </span>
            <span className="row-rule absolute -bottom-px left-0 h-px bg-accent"></span>
          </li>
        ))}
      </ol>

      <WorkViewport projects={projects} />

      <WorkMeta projects={projects} className="col-span-2" />
    </section>
  );
}
