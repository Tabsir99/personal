import { cn } from "@/lib/utils";
import { PROJECTS } from "./data";
import { ProjectStill } from "./project-still";

/* Viewing window — the right column. Server component. Frame holds 5
   stacked ProjectStills (only the one matching --work-active is visible
   via CSS) plus a single thumb strip containing one pack per project
   (only the active pack is displayed). Scan-line wipe runs via
   [data-work-transit="1"] .work-frame::after in work.css. */
export function WorkViewport() {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="work-frame relative aspect-16/10 bg-ink-2 border border-line overflow-hidden rounded-[3px]">
        {/* Viewfinder corner brackets */}
        <span className="absolute top-3 left-3 w-[18px] h-[18px] border-l border-t border-accent opacity-85 z-5"></span>
        <span className="absolute top-3 right-3 w-[18px] h-[18px] border-r border-t border-accent opacity-85 z-5"></span>
        <span className="absolute bottom-16 left-3 w-[18px] h-[18px] border-l border-b border-accent opacity-85 z-5 max-[1100px]:bottom-3"></span>
        <span className="absolute bottom-16 right-3 w-[18px] h-[18px] border-r border-b border-accent opacity-85 z-5 max-[1100px]:bottom-3"></span>

        {PROJECTS.map((p, i) => (
          <ProjectStill key={i} project={p} idx={i} />
        ))}

        {/* Scan-line overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-4 mix-blend-multiply opacity-50 bg-[repeating-linear-gradient(to_bottom,transparent_0px,transparent_2px,color-mix(in_oklab,black_16%,transparent)_3px,transparent_4px)]"
          aria-hidden="true"
        ></div>
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-3 bg-[radial-gradient(ellipse_at_center,transparent_55%,color-mix(in_oklab,var(--color-ink)_65%,transparent)_100%)]"
          aria-hidden="true"
        ></div>

        <div className="work-thumb-strip absolute bottom-3.5 left-3.5 right-3.5 z-5 flex items-center px-3 py-2 bg-ink/78 backdrop-blur-sm border border-line rounded-[2px] max-[1100px]:static max-[1100px]:-mt-0.5">
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
                  className={cn(
                    "work-thumb relative flex-1 h-[30px] border font-mono text-[10px] tracking-widest cursor-pointer",
                    "flex items-center justify-center gap-1",
                  )}
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
    </div>
  );
}
