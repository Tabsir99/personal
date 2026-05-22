import { PROJECTS } from "./data";
import { ProjectStill } from "./project-still";

const CORNER =
  "absolute size-5 border-accent opacity-85 z-5";

/* 5 stacked ProjectStills; only the one matching --work-active paints. */
export function WorkViewport() {
  return (
    <div className="work-frame relative aspect-16/10 bg-ink-2 border border-line overflow-hidden rounded-[3px]">
      <span className={`${CORNER} top-3 left-3 border-l border-t`}></span>
      <span className={`${CORNER} top-3 right-3 border-r border-t`}></span>
      <span className={`${CORNER} bottom-16 left-3 border-l border-b max-xl:bottom-3`}></span>
      <span className={`${CORNER} bottom-16 right-3 border-r border-b max-xl:bottom-3`}></span>

      {PROJECTS.map((p, i) => (
        <ProjectStill key={i} project={p} idx={i} />
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
        {PROJECTS.map((p, i) => (
          <div
            key={i}
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
