import type { Project } from "./work";

/* ---------------------------------------------------------------------
   ProjectStill — placeholder "still" for the viewing window.
   Renders a viewfinder-style frame: striped tint background,
   big ghosted serif word, mono spec line. One unique tint per project.
   --------------------------------------------------------------------- */
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
  return (
    <div
      className={`work-still ${active ? "on" : ""}`}
      data-glyph={project.glyph}
    >
      <div className="work-still-pattern" aria-hidden="true"></div>
      <div className="work-still-grid" aria-hidden="true"></div>
      <div className="work-still-ghost display" aria-hidden="true">
        {project.title}
      </div>
      <div className="work-still-glyph" aria-hidden="true">
        {project.glyph}
      </div>

      <div className="work-still-spec">
        <span>{still?.label}</span>
        <span className="work-still-spec-sep">·</span>
        <span>{isVideo ? "00:42 · 24fps" : "1920×1080 · 16:9"}</span>
      </div>

      {isVideo && (
        <div className="work-still-play">
          <span className="work-still-play-ring"></span>
          <span className="work-still-play-icon">▶</span>
          <span className="work-still-play-label">PREVIEW</span>
        </div>
      )}
    </div>
  );
}
