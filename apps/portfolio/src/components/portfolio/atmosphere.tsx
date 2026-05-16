"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ContourSVG } from "./contour-svg";
import { CoordOverlay } from "./coord-overlay";

/* Shared plane class group — taller than viewport so parallax never reveals
   an empty edge. The parallax rAF loop overrides `transform` per frame. */
const PLANE =
  "absolute left-0 right-0 top-[-20vh] h-[240vh] will-change-transform";

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

export function Atmosphere() {
  const farRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  const tintRef = useRef<HTMLDivElement>(null);

  /* Section → tint color (very subtle). The alpha is the dial; keep < 0.05.
     - hero:    base (no tint)
     - about:   cool drift (memo-pad blue-gray)
     - services: deeper amber (workshop fire)
     - stack:   phosphor (terminal greens dominate that section)
     - writing: sepia warm (paper)
     - now:     cool again (present-tense, blue hour)
     - contact: deep amber (signal flare)                            */
  useEffect(() => {
    type Tint = [number, number, number, number];
    const SECTION_TINTS: Array<[string, Tint]> = [
      ["hero", [232, 148, 85, 0.0]],
      ["about", [160, 180, 210, 0.022]],
      ["services", [232, 148, 85, 0.038]],
      ["stack", [184, 216, 156, 0.03]],
      ["writing", [220, 180, 130, 0.03]],
      ["now", [140, 175, 200, 0.024]],
      ["contact", [232, 148, 85, 0.048]],
    ];

    /* Parallax speed per plane. Lower = slower drift = deeper feel.
       Tuned so the near plane is still clearly slower than content (which
       moves at 1.0) but never feels like it's "lagging behind" the page. */
    const PARALLAX_FAR = 0.025;
    const PARALLAX_MID = 0.1;
    const PARALLAX_NEAR = 0.2;

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
    function ensureRaf() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

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
        tintRef.current.style.background = `rgba(${Math.round(cur[0])}, ${Math.round(cur[1])}, ${Math.round(cur[2])}, ${cur[3].toFixed(4)})`;
      }

      const tintSettled =
        Math.abs(tgt[0] - cur[0]) +
          Math.abs(tgt[1] - cur[1]) +
          Math.abs(tgt[2] - cur[2]) <
          0.4 && Math.abs(tgt[3] - cur[3]) < 0.0004;

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
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(settleTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  /* Shared orb base: position + circular shape + `will-change`. Per-orb
     size, placement, radial-gradient paint and animation are appended. */
  const ORB = "absolute rounded-full will-change-transform";

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-ink"
      aria-hidden="true"
    >
      {/* Base wash — top-to-bottom luminance shift; bottom is fractionally
          warmer/lighter than top so content sits ON the page. */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-[radial-gradient(120%_80%_at_50%_110%,color-mix(in_oklab,var(--color-accent)_4.5%,transparent),transparent_55%),radial-gradient(90%_70%_at_50%_-10%,color-mix(in_oklab,var(--color-ink-3)_55%,transparent),transparent_65%),linear-gradient(180deg,#0c0b0a_0%,#100e0c_50%,#14110e_100%)]",
        )}
      ></div>

      {/* Far: topographic contours — deepest plane */}
      <div className={cn(PLANE, "opacity-85")} ref={farRef}>
        <ContourSVG />
      </div>

      {/* Subtle section-driven tint (background set per-frame from JS) */}
      <div className="absolute inset-0 bg-transparent" ref={tintRef}></div>

      {/* Mid: drifting signal-fire orbs */}
      <div className={PLANE} ref={midRef}>
        <div
          className={cn(
            ORB,
            "w-[720px] h-[720px] top-[4vh] left-[-160px]",
            "bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-accent)_22%,transparent)_0%,color-mix(in_oklab,var(--color-accent)_10%,transparent)_30%,transparent_70%)]",
            "animate-atm-orb-drift-a motion-reduce:animate-none",
          )}
        ></div>
        <div
          className={cn(
            ORB,
            "w-[620px] h-[620px] top-[60vh] right-[-120px]",
            "bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-phosphor)_12%,transparent)_0%,color-mix(in_oklab,var(--color-phosphor)_5%,transparent)_30%,transparent_70%)]",
            "animate-atm-orb-drift-b motion-reduce:animate-none",
          )}
        ></div>
        <div
          className={cn(
            ORB,
            "w-[860px] h-[860px] top-[130vh] left-[28vw]",
            "bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-accent-2)_14%,transparent)_0%,color-mix(in_oklab,var(--color-accent-2)_6%,transparent)_30%,transparent_70%)]",
            "animate-atm-orb-drift-c motion-reduce:animate-none",
          )}
        ></div>
        <div
          className={cn(
            ORB,
            "w-[560px] h-[560px] top-[195vh] right-[16vw]",
            "bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-accent)_18%,transparent)_0%,color-mix(in_oklab,var(--color-accent)_7%,transparent)_30%,transparent_70%)]",
            "animate-[atm-orb-drift-a_32s_ease-in-out_infinite_reverse] motion-reduce:animate-none",
          )}
        ></div>
      </div>

      {/* Near: coordinate waypoints */}
      <div className={cn(PLANE, "opacity-85")} ref={nearRef}>
        <CoordOverlay />
      </div>

      {/* Optics layer (fixed): grain (CSS residue — SVG data-URI) + vignette */}
      <div className="atm-grain"></div>
      <div
        className={cn(
          "absolute inset-0 pointer-events-none",
          "bg-[radial-gradient(ellipse_at_center,transparent_55%,color-mix(in_oklab,black_35%,transparent)_100%),radial-gradient(ellipse_at_top,transparent_70%,color-mix(in_oklab,black_25%,transparent)_100%)]",
        )}
      ></div>
    </div>
  );
}
