import type { Project } from "@tabsircg/schemas/portfolio";
import { GLYPH_TINTS, glyphFor } from "./glyphs";

export function ProjectStill({
  project,
  idx,
}: {
  project: Project;
  idx: number;
}) {
  const glyph = glyphFor(project.tag, idx);
  const tints = GLYPH_TINTS[glyph];
  return (
    <div
      data-work-proj-idx={idx}
      data-glyph={glyph}
      className="work-still absolute inset-0 flex items-center justify-center"
      style={
        {
          "--i": idx,
          ...(tints && {
            ["--p-tint" as string]: tints.tint,
            ["--p-tint-2" as string]: tints.tint2,
          }),
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent_0px,transparent_18px,color-mix(in_oklab,var(--color-accent)_5%,transparent)_18px,color-mix(in_oklab,var(--color-accent)_5%,transparent)_19px)]"
        aria-hidden="true"
      ></div>
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,color-mix(in_oklab,var(--color-accent)_10%,transparent)_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"
        aria-hidden="true"
      ></div>
      <div
        className="h-serif relative z-2 text-[clamp(64px,9vw,132px)] text-cream opacity-[0.08] tracking-tight italic text-center select-none"
        aria-hidden="true"
      >
        {project.title}
      </div>
      {project.stills.map(
        (s, j) =>
          s.url && (
            <div
              key={`media-${j}`}
              style={{ "--i": j } as React.CSSProperties}
              className="work-still-media absolute inset-0 z-2"
            >
              {s.kind === "video" ? (
                <video
                  src={s.url}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={s.alt || s.label}
                />
              ) : (
                <img
                  src={s.url}
                  alt={s.alt || s.label}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
          ),
      )}

      {project.stills.map((s, j) => (
        <div
          key={j}
          style={{ "--i": j } as React.CSSProperties}
          className="work-still-meta absolute top-[18px] right-[50px] z-3 font-mono text-xxs tracking-widest uppercase text-cream-2 flex gap-2 items-center"
        >
          <span>{s.label}</span>
          <span className="text-accent opacity-60">·</span>
          <span>
            {s.kind === "video" ? "00:42 · 24fps" : "1920×1080 · 16:9"}
          </span>
        </div>
      ))}
      {project.stills.map(
        (s, j) =>
          s.kind === "video" &&
          !s.url && (
            <div
              key={j}
              style={{ "--i": j } as React.CSSProperties}
              className="work-still-play absolute inset-0 z-3 flex flex-col items-center justify-center gap-3 pointer-events-none"
            >
              <span className="absolute w-24 h-24 border border-accent rounded-full opacity-60 animate-expand-pulse"></span>
              <span className="relative z-1 text-3xl text-accent [text-shadow:0_0_24px_color-mix(in_oklab,var(--color-accent)_60%,transparent)]">
                ▶
              </span>
              <span className="relative z-1 font-mono text-xxs tracking-[0.24em] text-accent mt-9">
                PREVIEW
              </span>
            </div>
          ),
      )}
    </div>
  );
}
