import { cn } from "@/lib/utils";
import { PROJECTS, ROW_STATUS_STYLES } from "./data";
import { H3 } from "@/components/ui/H2";

/* Project index — the numbered row list on the left of the stage. Server
   component. Per-row styles (active gradient, ::before bar height, glyph
   rotation, title opacity, meta visibility, bottom rule) all derive from
   `--i` vs `--work-active` in work.css. Hover/focus is captured by the
   state island via [data-work-row-idx]. */
export function WorkList() {
  return (
    <ol
      data-reveal-stagger
      className="flex flex-col list-none border-t border-line"
    >
      {PROJECTS.map((p, i) => (
        <li
          key={i}
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
            {p.glyph}
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
  );
}
