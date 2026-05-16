"use client";
import { useEffect, useRef } from "react";

const useEffectA = useEffect;
const useRefA = useRef;

/* =====================================================================
   Atmosphere — parallax background story.

   The portfolio's vocabulary is field-station/terminal/topographic:
   "Field station · Dhaka", coordinate-style section labels ("00 — Index"),
   terminal phosphor, terracotta accent. The atmosphere extends that —
   the page sits ON something: a slow-breathing topographic map seen
   from far away, with signal-fire glows drifting on a closer plane and
   sparse coordinate waypoints nearest to the viewer.

   Three parallax planes are translated in the SAME direction as scroll
   but at fractional speeds (0.025 / 0.10 / 0.20), so the world reads as
   DEEPER than the content. A grain pass and edge vignette sit fixed in
   the optics.

   A very subtle section-driven RGB tint shifts the wash by section —
   barely-perceptible drift that an attentive eye reads as "this section
   feels different". All alphas are < 0.05 on purpose.

   Sits at z-index 0; <main> is z-index 1. Pointer-events: none so
   nothing here ever steals interactivity.
   ===================================================================== */

/* --------- Distant topographic contours (far plane) ----------
   Two "summits": one in upper-left, one in lower-right. Each is a stack
   of concentric, slightly-rotated ellipses — reads like a topo map at low
   contrast. We don't draw a literal mountain; the abstraction is what makes
   it sit quietly in the background. */
function ContourSVG() {
  // pre-built ring arrays so the JSX stays readable
  const summitA: { rx: number; ry: number; rot: number; opacity: number }[] = [];
  for (let i = 0; i < 16; i++) {
    summitA.push({
      rx: 70 + i * 58,
      ry: 50 + i * 42,
      rot: -14 + i * 0.6,
      opacity: 0.65 - i * 0.025,
    });
  }
  const summitB: { rx: number; ry: number; rot: number; opacity: number }[] = [];
  for (let i = 0; i < 14; i++) {
    summitB.push({
      rx: 60 + i * 64,
      ry: 80 + i * 48,
      rot: 24 - i * 0.4,
      opacity: 0.55 - i * 0.025,
    });
  }
  const summitC: { rx: number; ry: number; rot: number; opacity: number }[] = [];
  for (let i = 0; i < 10; i++) {
    summitC.push({
      rx: 40 + i * 44,
      ry: 30 + i * 32,
      rot: 4 + i * 0.8,
      opacity: 0.4 - i * 0.02,
    });
  }

  return (
    <svg
      className="atm-topo"
      viewBox="0 0 1600 2400"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g fill="none" strokeWidth="1" stroke="rgba(232, 148, 85, 0.10)">
        {summitA.map((r, i) => (
          <ellipse
            key={`a${i}`}
            cx="420"
            cy="780"
            rx={r.rx}
            ry={r.ry}
            transform={`rotate(${r.rot} 420 780)`}
            opacity={r.opacity}
          />
        ))}
      </g>
      <g fill="none" strokeWidth="1" stroke="rgba(184, 216, 156, 0.07)">
        {summitB.map((r, i) => (
          <ellipse
            key={`b${i}`}
            cx="1240"
            cy="1780"
            rx={r.rx}
            ry={r.ry}
            transform={`rotate(${r.rot} 1240 1780)`}
            opacity={r.opacity}
          />
        ))}
      </g>
      <g fill="none" strokeWidth="1" stroke="rgba(232, 148, 85, 0.08)">
        {summitC.map((r, i) => (
          <ellipse
            key={`c${i}`}
            cx="1380"
            cy="380"
            rx={r.rx}
            ry={r.ry}
            transform={`rotate(${r.rot} 1380 380)`}
            opacity={r.opacity}
          />
        ))}
      </g>
      {/* a few stray triangulation lines connecting peaks */}
      <g stroke="rgba(168, 161, 139, 0.06)" strokeWidth="0.5" strokeDasharray="2 6">
        <line x1="420" y1="780" x2="1240" y2="1780" />
        <line x1="420" y1="780" x2="1380" y2="380" />
        <line x1="1240" y1="1780" x2="1380" y2="380" />
      </g>
    </svg>
  );
}

/* --------- Coordinate waypoints (near plane) ----------
   Sparse field-survey marks. A few crosshairs, a few small filled
   circles, a couple of tiny serif coordinate labels. Placed at
   hand-chosen positions so the eye finds three or four per viewport;
   anything denser would compete with content. */
type Waypoint = [number, number, 'cross' | 'dot' | 'tick', string?];
const WAYPOINTS: Waypoint[] = [
  // [x%, y%, kind, label?]
  [8, 12, 'cross'],
  [92, 18, 'dot'],
  [22, 34, 'cross', '23° 14′'],
  [78, 46, 'dot'],
  [6, 58, 'tick'],
  [88, 64, 'cross'],
  [14, 78, 'dot'],
  [82, 86, 'cross', '90° E'],
  [42, 22, 'tick'],
  [58, 72, 'dot'],
  [4, 92, 'cross'],
  [96, 38, 'tick'],
  // a second tier of waypoints lower down (since the layer is 220vh tall)
  [12, 112, 'cross', '47° N'],
  [82, 128, 'dot'],
  [28, 146, 'tick'],
  [76, 158, 'cross'],
  [10, 172, 'dot'],
  [90, 184, 'cross'],
  [44, 196, 'tick'],
  [18, 208, 'cross', '06° W'],
];

function CoordOverlay() {
  return (
    <svg
      className="atm-coords"
      viewBox="0 0 100 220"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {WAYPOINTS.map((w, i) => {
        const [x, y, kind, label] = w;
        if (kind === 'cross') {
          return (
            <g key={i} stroke="rgba(232, 227, 216, 0.20)" strokeWidth="0.08">
              <line x1={x - 0.7} y1={y} x2={x + 0.7} y2={y} />
              <line x1={x} y1={y - 0.7} x2={x} y2={y + 0.7} />
              <circle cx={x} cy={y} r="0.15" fill="rgba(232, 148, 85, 0.6)" stroke="none" />
              {label && (
                <text
                  x={x + 1.2}
                  y={y + 0.3}
                  fill="rgba(168, 161, 139, 0.35)"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="0.65"
                  letterSpacing="0.05"
                >
                  {label}
                </text>
              )}
            </g>
          );
        }
        if (kind === 'dot') {
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="0.22"
              fill="rgba(184, 216, 156, 0.30)"
              stroke="none"
            />
          );
        }
        return (
          <line
            key={i}
            x1={x - 0.5}
            y1={y}
            x2={x + 0.5}
            y2={y}
            stroke="rgba(168, 161, 139, 0.25)"
            strokeWidth="0.06"
          />
        );
      })}
    </svg>
  );
}

/* --------- Main component ----------- */
export function Atmosphere() {
  const farRef = useRefA<HTMLDivElement>(null);
  const midRef = useRefA<HTMLDivElement>(null);
  const nearRef = useRefA<HTMLDivElement>(null);
  const tintRef = useRefA<HTMLDivElement>(null);

  /* Section → tint color (very subtle). The alpha is the dial; keep < 0.05.
     - hero:    base (no tint)
     - about:   cool drift (memo-pad blue-gray)
     - services: deeper amber (workshop fire)
     - stack:   phosphor (terminal greens dominate that section)
     - writing: sepia warm (paper)
     - now:     cool again (present-tense, blue hour)
     - contact: deep amber (signal flare)                            */
  useEffectA(() => {
    type Tint = [number, number, number, number];
    const SECTION_TINTS: Array<[string, Tint]> = [
      ['hero',     [232, 148,  85, 0.000]],
      ['about',    [160, 180, 210, 0.022]],
      ['services', [232, 148,  85, 0.038]],
      ['stack',    [184, 216, 156, 0.030]],
      ['writing',  [220, 180, 130, 0.030]],
      ['now',      [140, 175, 200, 0.024]],
      ['contact',  [232, 148,  85, 0.048]],
    ];

    /* Parallax speed per plane. Lower = slower drift = deeper feel.
       Tuned so the near plane is still clearly slower than content (which
       moves at 1.0) but never feels like it's "lagging behind" the page. */
    const PARALLAX_FAR  = 0.025;
    const PARALLAX_MID  = 0.10;
    const PARALLAX_NEAR = 0.20;

    let scrollY = window.scrollY;
    let lastAppliedY = -1;
    let raf = 0;
    let cur: Tint = [15, 14, 12, 0];
    let tgt: Tint = [15, 14, 12, 0];

    /* Cache section offsets. Reading `el.offsetTop` triggers layout, and
       we'd otherwise do it on every scroll event. Re-measured on resize +
       once after fonts/images settle. */
    let sectionTops: { top: number; tint: Tint }[] = [];
    function measure() {
      sectionTops = SECTION_TINTS.map(([id, tint]) => {
        const el = document.getElementById(id);
        return { top: el ? el.offsetTop : Infinity, tint };
      });
      readSection();
      ensureRaf();
    }

    function readSection() {
      const y = scrollY + window.innerHeight * 0.5;
      let pick = sectionTops[0] || { tint: SECTION_TINTS[0][1] };
      for (const s of sectionTops) {
        if (s.top <= y) pick = s;
      }
      tgt = pick.tint;
    }

    /* Single rAF loop that PAUSES itself when there's nothing to do. We
       only need to tick when scrollY changed since last paint OR the tint
       hasn't fully settled to its target. Saves a frame every 16ms when
       the user is sitting still. */
    function ensureRaf() { if (!raf) raf = requestAnimationFrame(tick); }

    function tick() {
      const k = 0.05;
      cur[0] += (tgt[0] - cur[0]) * k;
      cur[1] += (tgt[1] - cur[1]) * k;
      cur[2] += (tgt[2] - cur[2]) * k;
      cur[3] += (tgt[3] - cur[3]) * k;

      if (scrollY !== lastAppliedY) {
        if (farRef.current)
          farRef.current.style.transform = `translate3d(0, ${-scrollY * PARALLAX_FAR}px, 0)`;
        if (midRef.current)
          midRef.current.style.transform = `translate3d(0, ${-scrollY * PARALLAX_MID}px, 0)`;
        if (nearRef.current)
          nearRef.current.style.transform = `translate3d(0, ${-scrollY * PARALLAX_NEAR}px, 0)`;
        lastAppliedY = scrollY;
      }

      if (tintRef.current) {
        tintRef.current.style.background =
          `rgba(${Math.round(cur[0])}, ${Math.round(cur[1])}, ${Math.round(cur[2])}, ${cur[3].toFixed(4)})`;
      }

      const tintSettled =
        Math.abs(tgt[0] - cur[0]) +
        Math.abs(tgt[1] - cur[1]) +
        Math.abs(tgt[2] - cur[2]) < 0.4 &&
        Math.abs(tgt[3] - cur[3]) < 0.0004;

      /* If tint is settled AND we just painted the current scroll, stop.
         Next scroll/resize re-arms via ensureRaf(). */
      if (tintSettled && scrollY === lastAppliedY) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    function onScroll() {
      scrollY = window.scrollY;
      readSection();
      ensureRaf();
    }

    measure();
    // re-measure once fonts/images settle (page height may have grown)
    const settleTimer = setTimeout(measure, 800);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(settleTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div className="atm" aria-hidden="true">
      <div className="atm-base"></div>

      {/* Far: topographic contours — deepest plane */}
      <div className="atm-plane atm-far" ref={farRef}>
        <ContourSVG />
      </div>

      {/* Subtle section-driven tint */}
      <div className="atm-tint" ref={tintRef}></div>

      {/* Mid: drifting signal-fire orbs */}
      <div className="atm-plane atm-mid" ref={midRef}>
        <div className="atm-orb atm-orb-1"></div>
        <div className="atm-orb atm-orb-2"></div>
        <div className="atm-orb atm-orb-3"></div>
        <div className="atm-orb atm-orb-4"></div>
      </div>

      {/* Near: coordinate waypoints */}
      <div className="atm-plane atm-near" ref={nearRef}>
        <CoordOverlay />
      </div>

      {/* Optics layer (fixed): grain + vignette */}
      <div className="atm-grain"></div>
      <div className="atm-vignette"></div>
    </div>
  );
}
