"use client";
import { useState, useEffect, useRef } from "react";
import { useReveal } from "./core";

const useStateW = useState;
const useEffectW = useEffect;
const useRefW = useRef;

/* =====================================================================
   Selected work — "The Reel"
   --------------------------------------------------------------------
   A two-column showcase:
   - Left: numbered project index (the film-reel frame list)
   - Right: viewing window (image/video with scan-line + Ken-Burns idle),
           a thumb strip for the gallery, and a meta block underneath
           (dek, role, stack, metrics, links).

   Auto-advances every ~9s; pauses on hover. Switching active project
   triggers a scan-line wipe + serif title cross-fade.
   ===================================================================== */

const PROJECTS = [
{
  title: 'Northwind',
  dek: 'Real-time logistics console tracking 2k+ daily shipments across South-East Asia. Operator dashboard, alert routing, replay scrubber, live-ETA model — and a satellite-friendly offline mode for the warehouse floor.',
  type: 'Freelance',
  status: 'shipped',
  role: 'Sole engineer',
  year: '2025',
  metrics: [
  { label: 'shipments / day', value: '2.1k' },
  { label: 'p95 read', value: '180ms' },
  { label: 'uptime, 12 mo', value: '99.94%' }],

  skills: ['Next.js', 'Postgres', 'Mapbox', 'WebSockets', 'tRPC'],
  links: [
  { text: 'Live console', url: '#', type: 'live' },
  { text: 'Case study', url: '#', type: 'case-study' }],

  stills: [
  { label: 'Operator console', kind: 'image' },
  { label: 'Route replay', kind: 'video' },
  { label: 'Alert rules', kind: 'image' },
  { label: 'Driver mobile', kind: 'image' }],

  tag: 'Operations',
  glyph: '◢'
},
{
  title: 'Atlas Atelier',
  dek: 'A design-system handoff tool — paste a Figma file, get a typed component library, theming tokens, and a documentation site that updates itself on every commit.',
  type: 'Demo',
  status: 'shipped',
  role: 'Designer · engineer',
  year: '2024',
  metrics: [
  { label: 'components generated', value: '142' },
  { label: 'beta studios', value: '11' },
  { label: 'avg. sync time', value: '6.4s' }],

  skills: ['React', 'Figma API', 'TypeScript', 'Vite', 'Stitches'],
  links: [
  { text: 'Try it', url: '#', type: 'live' },
  { text: 'GitHub', url: '#', type: 'repo' },
  { text: 'Demo video', url: '#', type: 'video' }],

  stills: [
  { label: 'Token explorer', kind: 'image' },
  { label: 'Component preview', kind: 'image' },
  { label: 'Diff timeline', kind: 'image' }],

  tag: 'Tooling',
  glyph: '◇'
},
{
  title: 'Sentinel',
  dek: 'A quiet observability dashboard for solo founders and two-person infra teams. Boring graphs, sensible defaults, and incident-mode that turns the whole UI into a calm checklist instead of a Christmas tree.',
  type: 'Personal',
  status: 'in-progress',
  role: 'Solo build',
  year: '2025',
  metrics: [
  { label: 'private-beta teams', value: '8' },
  { label: 'log ingest / day', value: '14 GB' },
  { label: 'rules in trial', value: '40+' }],

  skills: ['Go', 'Clickhouse', 'Svelte', 'Grafana panels', 'Loki'],
  links: [
  { text: 'Waitlist', url: '#', type: 'live' },
  { text: 'Build log', url: '#', type: 'case-study' }],

  stills: [
  { label: 'Overview', kind: 'image' },
  { label: 'Incident mode', kind: 'image' },
  { label: 'Latency board', kind: 'image' },
  { label: 'On-call sheet', kind: 'image' },
  { label: 'Alert routing', kind: 'video' }],

  tag: 'Observability',
  glyph: '◐'
},
{
  title: 'Looplab',
  dek: 'A browser-native generative audio playground. Visual patch cords, MIDI in/out, a sampler that survives a refresh. Built mostly on weekends; ended up in two universities’ sound-design syllabi.',
  type: 'Personal',
  status: 'shipped',
  role: 'Solo · ongoing',
  year: '2024',
  metrics: [
  { label: 'monthly patches', value: '3.6k' },
  { label: 'syllabi listed', value: '2' },
  { label: 'lines of DSP', value: '~7k' }],

  skills: ['Web Audio', 'WebMIDI', 'TypeScript', 'Canvas', 'IndexedDB'],
  links: [
  { text: 'Play', url: '#', type: 'live' },
  { text: 'Source', url: '#', type: 'repo' }],

  stills: [
  { label: 'Patch surface', kind: 'image' },
  { label: 'Sampler view', kind: 'image' },
  { label: 'Granular mode', kind: 'video' }],

  tag: 'Audio',
  glyph: '◉'
},
{
  title: 'Quartermile',
  dek: 'A small habit-tracker for runners, built for a friend’s coaching practice. Quiet daily prompts, weekly summaries, and a "compassionate streaks" model that doesn’t punish you for life happening.',
  type: 'Freelance',
  status: 'archived',
  role: 'Engineer · designer',
  year: '2023',
  metrics: [
  { label: 'active runners', value: '420' },
  { label: 'streak threshold', value: 'forgiving' }],

  skills: ['Remix', 'SQLite', 'Tailwind', 'Resend', 'Fly.io'],
  links: [
  { text: 'Retrospective', url: '#', type: 'case-study' }],

  stills: [
  { label: 'Daily prompt', kind: 'image' },
  { label: 'Weekly review', kind: 'image' },
  { label: 'Coach view', kind: 'image' }],

  tag: 'Habit',
  glyph: '◔'
}];


type ProjectType = (typeof PROJECTS)[number];

const LINK_ICONS: Record<string, string> = {
  'live': '↗',
  'repo': '⟨/⟩',
  'case-study': '¶',
  'video': '▶',
  'other': '→'
};

const AUTO_MS = 9000;

export function Work() {
  const [revealRef, vis] = useReveal<HTMLElement>({ threshold: 0.18 });
  const [active, setActive] = useStateW(0);
  const [stillIdx, setStillIdx] = useStateW(0);
  const [tick, setTick] = useStateW(0); // 0..1 auto-advance progress
  const [paused, setPaused] = useStateW(false);
  const [transit, setTransit] = useStateW(false);
  const lastActive = useRefW(0);

  const project = PROJECTS[active];

  // Reset still index when project changes; flash a brief scan-line wipe.
  useEffectW(() => {
    if (lastActive.current !== active) {
      lastActive.current = active;
      setStillIdx(0);
      setTransit(true);
      const t = setTimeout(() => setTransit(false), 620);
      return () => clearTimeout(t);
    }
  }, [active]);

  // Auto-advance timer. Pauses if section not visible or hovered.
  useEffectW(() => {
    if (!vis || paused) return;
    const start = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      const p = (t - start) / AUTO_MS;
      if (p >= 1) {
        setTick(0);
        setActive((a) => (a + 1) % PROJECTS.length);
      } else {
        setTick(p);
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [vis, paused, active]);

  function pick(i: number) {
    if (i === active) return;
    setTick(0);
    setActive(i);
  }

  return (
    <section id="work" className="work" data-screen-label="04 Work" ref={revealRef}>
      <span className="section-tag">/ 03 — Selected work</span>
      <span className="margin-note" style={{ top: '260px' }}>five recent,<br />seventeen total.</span>

      <div className="container">
        {/* ---- Header ---- */}
        <header className={`work-header ${vis ? 'in' : ''}`}>
          <h2 className="work-title display">
            <em>Selected</em><br />work.
          </h2>
          <div className="work-intro">
            <p className="work-blurb">
              Five from the last two years. Quiet UIs, opinionated back-ends, and a couple of weekends
              that quietly turned into demos. Hover the index to wander; the reel auto-advances otherwise.
            </p>
            <a className="work-archive-link" href="#">
              <span>All 17 projects · the full archive</span>
              <span className="arrow">↗</span>
            </a>
          </div>
        </header>

        {/* ---- Stage: index + viewport ---- */}
        <div
          className={`work-stage ${vis ? 'in' : ''}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}>

          {/* INDEX */}
          <ol className="work-index">
            {PROJECTS.map((p, i) => {
              const state = i === active ? 'on' : i < active ? 'past' : 'next';
              return (
                <li
                  key={i}
                  className={`work-row work-row--${state}`}
                  onMouseEnter={() => pick(i)}
                  onFocus={() => pick(i)}
                  tabIndex={0}>

                  <span className="work-row-glyph" aria-hidden="true">{p.glyph}</span>
                  <span className="work-row-title display">{p.title}</span>
                  <span className="work-row-meta">
                    <span>{p.type}</span>
                    <span className="work-row-dot">·</span>
                    <span>{p.year}</span>
                    <span className="work-row-dot">·</span>
                    <span className={`work-row-status work-row-status--${p.status}`}>{p.status}</span>
                  </span>
                  <span className="work-row-rule"></span>
                </li>);

            })}
          </ol>

          {/* VIEWPORT */}
          <div className="work-viewer">
            <div className={`work-vp-frame ${transit ? 'transit' : ''}`}>
              {/* Brackets — viewfinder corners */}
              <span className="vp-corner vp-corner--tl"></span>
              <span className="vp-corner vp-corner--tr"></span>
              <span className="vp-corner vp-corner--bl"></span>
              <span className="vp-corner vp-corner--br"></span>

              {/* Stacked stills — one active at a time, cross-fade */}
              {PROJECTS.map((p, i) =>
              <ProjectStill
                key={i}
                project={p}
                active={i === active}
                stillIdx={i === active ? stillIdx : 0} />

              )}

              {/* Scan-line overlay (constant), and "transit" wipe pulse */}
              <div className="work-vp-scan" aria-hidden="true"></div>
              <div className="work-vp-vignette" aria-hidden="true"></div>

              {/* Thumb strip */}
              {project.stills.length > 1 &&
              <div className="work-vp-thumbs">
                  <div className="work-vp-thumbs-row">
                    {project.stills.map((s, j) =>
                  <button
                    key={j}
                    className={`work-thumb ${j === stillIdx ? 'on' : ''}`}
                    onMouseEnter={() => setStillIdx(j)}
                    onClick={() => setStillIdx(j)}
                    aria-label={s.label}>

                        <span className="work-thumb-num">{String(j + 1).padStart(2, '0')}</span>
                        {s.kind === 'video' && <span className="work-thumb-play">▶</span>}
                      </button>
                  )}
                  </div>
                </div>
              }

              {/* Auto-advance timer bar */}
              <div className="work-vp-timer" aria-hidden="true">
                <span style={{ transform: `scaleX(${paused ? 0 : tick})` }}></span>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Meta block: dek + role/stack/metrics + links ---- */}
        <div className={`work-meta ${vis ? 'in' : ''}`} key={`meta-${active}`}>
          <p className="work-meta-dek">{project.dek}</p>

          <dl className="work-meta-grid">
            <div className="work-meta-cell">
              <dt>Role</dt>
              <dd>{project.role}</dd>
            </div>
            <div className="work-meta-cell">
              <dt>Stack</dt>
              <dd>{project.skills.join(' · ')}</dd>
            </div>
            {project.metrics.length > 0 &&
            <div className="work-meta-cell work-meta-cell--metrics">
                <dt>Metrics</dt>
                <dd>
                  {project.metrics.map((m, j) =>
                <span className="work-metric" key={j}>
                      <span className="work-metric-val">{m.value}</span>
                      <span className="work-metric-lbl">{m.label}</span>
                    </span>
                )}
                </dd>
              </div>
            }
          </dl>

          <div className="work-meta-links">
            {project.links.map((l, j) =>
            <a key={j} href={l.url || '#'} className={`work-link work-link--${l.type}`}>
                <span className="work-link-icon">{LINK_ICONS[l.type] || '→'}</span>
                <span className="work-link-text">{l.text}</span>
                <span className="work-link-arrow">↗</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>);

}

/* ---------------------------------------------------------------------
   ProjectStill — placeholder "still" for the viewing window.
   Renders a viewfinder-style frame: striped tint background,
   big ghosted serif word, mono spec line. One unique tint per project.
   --------------------------------------------------------------------- */
export function ProjectStill({ project, active, stillIdx }: { project: ProjectType; active: boolean; stillIdx: number }) {
  const still = project.stills[stillIdx] || project.stills[0];
  const isVideo = still?.kind === 'video';
  return (
    <div className={`work-still ${active ? 'on' : ''}`} data-glyph={project.glyph}>
      <div className="work-still-pattern" aria-hidden="true"></div>
      <div className="work-still-grid" aria-hidden="true"></div>
      <div className="work-still-ghost display" aria-hidden="true">{project.title}</div>
      <div className="work-still-glyph" aria-hidden="true">{project.glyph}</div>

      <div className="work-still-spec">
        <span>{still?.label}</span>
        <span className="work-still-spec-sep">·</span>
        <span>{isVideo ? '00:42 · 24fps' : '1920×1080 · 16:9'}</span>
      </div>

      {isVideo &&
      <div className="work-still-play">
          <span className="work-still-play-ring"></span>
          <span className="work-still-play-icon">▶</span>
          <span className="work-still-play-label">PREVIEW</span>
        </div>
      }
    </div>);

}
