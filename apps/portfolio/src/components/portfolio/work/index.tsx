import type { Project } from "@tabsircg/schemas/portfolio";
import { WorkViewport } from "./viewport";
import { WorkMeta } from "./meta";
import { WorkStateIsland } from "./state-island";
import { H2, H3 } from "@/components/ui/H2";
import { NavLink } from "@/components/ui/nav-link";
import { RichText } from "@/components/ui/rich-text";
import { glyphFor } from "./glyphs";

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
      className="page-shell grid grid-cols-[0.75fr_1.25fr] max-lg:flex flex-col gap-8"
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
        <div className="flex flex-col gap-4 max-md:hidden">
          <p className="max-w-md leading-relaxed">
            A production SaaS built for an agency, two developer tools I built
            and published, and the site you&rsquo;re reading — shipped end to
            end. Hover the index to look closer.
          </p>
          <NavLink href="https://github.com/Tabsir99" underline>
            More on GitHub
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
            className="work-row group/row relative grid grid-cols-[auto_auto_1fr_auto] items-center gap-4 py-[22px] pr-1.5 border-b border-line cursor-pointer outline-hidden focus-visible:outline-2 focus-visible:outline-accent"
          >
            <span
              className="row-glyph font-mono text-sm w-5 text-center"
              aria-hidden="true"
            >
              {glyphFor(p.tag, i)}
            </span>
            <H3 className="row-title" variant="serif">
              <RichText text={p.title} />
            </H3>
            <span className="row-meta inline-flex items-center gap-2 font-mono text-xxs tracking-widest uppercase text-muted-2 whitespace-nowrap">
              <span>
                <RichText text={p.type} />
              </span>
              <span className="text-line">·</span>
              <span>
                <RichText text={p.year} />
              </span>
              <span className="text-line">·</span>
            </span>
            <span className="row-rule absolute -bottom-px left-0 h-px bg-accent"></span>
          </li>
        ))}
      </ol>

      <WorkViewport projects={projects} />

      <WorkMeta projects={projects} className="col-span-full" />
    </section>
  );
}
