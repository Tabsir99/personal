import type { Project } from "./work";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------
   ProjectStill — placeholder "still" for the viewing window.
   Renders a viewfinder-style frame: striped tint background,
   big ghosted serif word, mono spec line. One unique tint per project.
   --------------------------------------------------------------------- */

/* Per-glyph tint pair, baked into oklch so variety stays within the
   brand range (low chroma, warm-to-cool). Pushed inline via CSS vars on
   the still root so the `::before` gradient picks them up cheaply. */
const GLYPH_TINTS: Record<string, { tint: string; tint2: string }> = {
  "◢": { tint: "oklch(0.34 0.06 38)", tint2: "oklch(0.22 0.02 38)" },
  "◇": { tint: "oklch(0.32 0.04 80)", tint2: "oklch(0.20 0.015 80)" },
  "◐": { tint: "oklch(0.30 0.04 140)", tint2: "oklch(0.20 0.012 140)" },
  "◉": { tint: "oklch(0.30 0.05 210)", tint2: "oklch(0.18 0.015 210)" },
  "◔": { tint: "oklch(0.30 0.04 320)", tint2: "oklch(0.18 0.015 320)" },
};

export function ProjectStill({
  project,
  active,
  stillIdx,
}: {
  project: Project;
  active: boolean;
  stillIdx: number;
}) {
  const still = project.stills[stillIdx] || project.stills[0];
  const isVideo = still?.kind === "video";
  const tints = GLYPH_TINTS[project.glyph];
  return (
    <div
      className={cn(
        "absolute inset-0 z-1 opacity-0 transition-opacity duration-550 ease-out flex items-center justify-center",
        active && "opacity-100 z-2",
        // Tint background pseudo: a 135deg gradient between the two
        // per-project tint vars set inline below. On the active still
        // it slowly breathes via the ken-burns animation.
        "before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(135deg,var(--p-tint)_0%,var(--p-tint-2)_100%)]",
        active && "before:animate-ken-burns",
      )}
      data-glyph={project.glyph}
      style={
        tints
          ? ({
              ["--p-tint" as string]: tints.tint,
              ["--p-tint-2" as string]: tints.tint2,
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* Diagonal stripe pattern overlay */}
      <div
        className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent_0px,transparent_18px,color-mix(in_oklab,var(--color-accent)_5%,transparent)_18px,color-mix(in_oklab,var(--color-accent)_5%,transparent)_19px)]"
        aria-hidden="true"
      ></div>
      {/* Dot-grid overlay, masked to a soft ellipse */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,color-mix(in_oklab,var(--color-accent)_10%,transparent)_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_80%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"
        aria-hidden="true"
      ></div>
      {/* Big ghosted serif title — like a frame slate */}
      <div
        className="display relative z-2 text-[clamp(64px,9vw,132px)] text-cream opacity-[0.08] tracking-[-0.02em] italic text-center select-none"
        aria-hidden="true"
      >
        {project.title}
      </div>
      {/* Project glyph — large in top-left */}
      <div
        className="absolute top-[18px] left-[50px] text-[22px] text-accent opacity-70 z-3"
        aria-hidden="true"
      >
        {project.glyph}
      </div>

      {/* Mono spec strip — top-right */}
      <div className="absolute top-[18px] right-[50px] z-3 font-mono text-[9px] tracking-[0.16em] uppercase text-cream-2 opacity-70 flex gap-2 items-center">
        <span>{still?.label}</span>
        <span className="text-accent opacity-60">·</span>
        <span>{isVideo ? "00:42 · 24fps" : "1920×1080 · 16:9"}</span>
      </div>

      {isVideo && (
        <div className="absolute inset-0 z-3 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <span className="absolute w-24 h-24 border border-accent rounded-full opacity-60 animate-ring-pulse"></span>
          <span className="relative z-1 text-[28px] text-accent [text-shadow:0_0_24px_color-mix(in_oklab,var(--color-accent)_60%,transparent)]">
            ▶
          </span>
          <span className="relative z-1 font-mono text-[9px] tracking-[0.24em] text-accent mt-9">
            PREVIEW
          </span>
        </div>
      )}
    </div>
  );
}
