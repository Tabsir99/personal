import Link from "next/link";
import type { Project } from "@tabsircg/schemas/portfolio";

import { ProjectStill } from "./project-still";
import { LINK_ICONS } from "./glyphs";

const CORNER = "absolute size-5 border-accent opacity-85 z-5";

/* Stacked ProjectStills; only the one matching --work-active paints. */
export function WorkViewport({ projects }: { projects: Project[] }) {
  return (
    <div className="work-frame relative aspect-16/10 bg-ink-2 border border-line overflow-hidden rounded-[3px]">
      <span className={`${CORNER} top-3 left-3 border-l border-t`}></span>
      <span className={`${CORNER} top-3 right-3 border-r border-t`}></span>
      <span
        className={`${CORNER} bottom-16 left-3 border-l border-b max-xl:bottom-3`}
      ></span>
      <span
        className={`${CORNER} bottom-16 right-3 border-r border-b max-xl:bottom-3`}
      ></span>

      {projects.map((p, i) => (
        <ProjectStill key={p.title + i} project={p} idx={i} />
      ))}

      {projects.map((p, i) => (
        <div
          key={`links-${p.title}-${i}`}
          style={{ "--i": i } as React.CSSProperties}
          className="work-link-strip absolute top-3 right-10 z-5 flex items-center gap-1.5"
        >
          {p.links.map((l, j) => {
            const isReal = !!l.url && l.url !== "#";
            const icon = LINK_ICONS[l.type] || "→";
            const cls =
              "inline-flex items-center justify-center size-7 border border-accent/40 rounded-xs bg-ink/85 backdrop-blur-sm font-mono text-xs text-accent transition-colors hover:bg-accent hover:text-ink";
            return isReal ? (
              <Link
                key={j}
                href={l.url}
                title={l.text}
                aria-label={l.text}
                className={cls}
              >
                {icon}
              </Link>
            ) : (
              <span
                key={j}
                title={l.text}
                aria-label={l.text}
                className={`${cls} opacity-40`}
              >
                {icon}
              </span>
            );
          })}
        </div>
      ))}

      {/* Plain overlay (not mix-blend) — blend forces an extra paint pass. */}
      <div
        className="absolute inset-0 pointer-events-none z-4 bg-[repeating-linear-gradient(to_bottom,transparent_0px,transparent_2px,color-mix(in_oklab,black_28%,transparent)_3px,transparent_4px)]"
        aria-hidden="true"
      ></div>
      <div
        className="absolute inset-0 pointer-events-none z-3 bg-[radial-gradient(ellipse_at_center,transparent_55%,color-mix(in_oklab,var(--color-ink)_65%,transparent)_100%)]"
        aria-hidden="true"
      ></div>

      <div className="work-thumb-strip absolute bottom-3.5 left-3.5 right-3.5 z-5 flex items-center px-3 py-2 bg-ink/92 border border-line rounded-xs max-xl:static max-xl:-mt-0.5">
        {projects.map((p, i) => (
          <div
            key={p.title + i}
            data-work-pack-proj={i}
            style={{ "--i": i } as React.CSSProperties}
            className="work-thumb-pack"
          >
            {p.stills.map((s, j) => (
              <button
                key={j}
                type="button"
                data-work-thumb-idx={j}
                style={{ "--i": j } as React.CSSProperties}
                aria-label={s.label}
                className="work-thumb relative flex flex-1 items-center justify-center gap-1 h-[30px] border font-mono text-xxs tracking-widest cursor-pointer"
              >
                <span className="font-medium">
                  {String(j + 1).padStart(2, "0")}
                </span>
                {s.kind === "video" && (
                  <span className="thumb-play text-[8px]">▶</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
