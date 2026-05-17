import { cn } from "@/lib/utils";
import { PROJECTS, ROW_STATUS_STYLES } from "./data";

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
          style={{ "--i": i } as React.CSSProperties}
          className={cn(
            "work-row group/row relative grid grid-cols-[auto_auto_1fr_auto] items-center gap-[18px] py-[22px] pr-1.5 border-b border-line cursor-pointer outline-none",
            "max-[1100px]:grid-cols-[auto_1fr_auto]",
          )}
        >
          <span
            className="row-glyph font-mono text-[14px] w-[18px] text-center max-[1100px]:hidden"
            aria-hidden="true"
          >
            {p.glyph}
          </span>
          <span
            className={cn(
              "row-title display font-serif text-[clamp(28px,3.2vw,44px)] leading-none tracking-[-0.015em] text-cream whitespace-nowrap overflow-hidden text-ellipsis",
              "max-[1100px]:text-[28px]",
            )}
          >
            {p.title}
          </span>
          <span className="row-meta inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-muted-2 whitespace-nowrap">
            <span>{p.type}</span>
            <span className="text-line">·</span>
            <span>{p.year}</span>
            <span className="text-line">·</span>
            <span
              className={cn(
                "px-1.5 py-0.5 border rounded-[2px]",
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
