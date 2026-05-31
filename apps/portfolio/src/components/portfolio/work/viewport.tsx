import type { Project } from "@tabsircg/schemas/portfolio";
import { ProjectStill } from "./project-still";

/* Stacked ProjectStills; only the one matching --work-active paints. */
export function WorkViewport({ projects }: { projects: Project[] }) {
  return (
    <div className="work-frame relative aspect-16/10 bg-ink-2 border border-line overflow-hidden rounded-sm">
      {projects.map((p, i) => (
        <ProjectStill key={p.title + i} project={p} idx={i} />
      ))}

      <div className="absolute w-full bottom-0 z-5 flex items-center rounded-sm">
        {projects.map((p, i) => (
          <div
            key={p.title + i}
            data-work-pack-proj={i}
            style={{ "--i": i } as React.CSSProperties}
            className="work-thumb-pack"
          >
            {p.stills.length > 1 &&
              p.stills.map((s, j) => (
                <button
                  key={j}
                  type="button"
                  data-work-thumb-idx={j}
                  style={{ "--i": j } as React.CSSProperties}
                  aria-label={s.label}
                  className="work-thumb relative flex flex-1 items-center justify-center gap-1 h-6 max-sm:h-4 border font-mono text-xxs tracking-widest cursor-pointer"
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
