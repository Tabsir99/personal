import type { Project } from "@tabsircg/schemas/portfolio";
import { ProjectStill } from "./project-still";

/* The stage (stacked ProjectStills) owns the 16:9 aspect ratio and fills with
   the asset; the thumb switcher stacks in its own row below — no overlap. */
export function WorkViewport({ projects }: { projects: Project[] }) {
  return (
    <div className="work-frame group/frame relative self-start bg-ink-2 border border-line w-full overflow-hidden rounded-sm">
      <div className="work-stage relative aspect-video">
        {projects.map((p, i) => (
          <ProjectStill key={p.title + i} project={p} idx={i} />
        ))}

        <button
          type="button"
          data-work-fullscreen
          aria-label="View larger"
          className="absolute top-2.5 right-2.5 z-10 grid size-7 place-items-center rounded-sm border border-line bg-ink/50 text-cream-2 opacity-0 backdrop-blur-sm transition hover:text-accent group-hover/frame:opacity-100 focus-visible:opacity-100"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="size-3.5"
            aria-hidden="true"
          >
            <path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5" />
          </svg>
        </button>
      </div>

      <div className="flex items-center">
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
                  className="work-thumb relative flex flex-1 items-center justify-center gap-1 h-5 max-sm:h-4 border font-mono text-xxs tracking-widest cursor-pointer"
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
