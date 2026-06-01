"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* Mirrors ContourSVG's Summit A so rings align with Atmosphere on fade. */
function IntroRings() {
  const summit = Array.from({ length: 16 }, (_, i) => ({
    rx: 70 + i * 58,
    ry: 50 + i * 42,
    rot: -14 + i * 0.6,
    opacity: 0.25,
    delay: 0.04 + i * 0.05,
  }));
  return (
    <svg
      className="absolute inset-0 size-full animate-breathe motion-reduce:animate-none"
      viewBox="0 0 1600 2400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g fill="none" strokeWidth="1.1" className="stroke-accent/65">
        {summit.map((r, i) => (
          <ellipse
            key={i}
            cx="420"
            cy="780"
            rx={r.rx}
            ry={r.ry}
            transform={`rotate(${r.rot} 420 780)`}
            opacity={r.opacity}
            pathLength="1"
            style={{ "--ring-d": `${r.delay}s` } as React.CSSProperties}
          />
        ))}
      </g>
      <circle cx="420" cy="780" r="3.6" fill="rgba(232, 148, 85, 0.95)" />
    </svg>
  );
}

/* Total intro length; must outlast the longest animation in intro.css and
   stay in step with --hero-stagger. */
const INTRO_DURATION = 6000;
/* When the word starts flying to the header — slightly before the rings fade,
   so it's clearly travelling (not lingering) as they clear. */
const MORPH_AT = 4850;

function IntroInner({ onDone }: { onDone: () => void }) {
  const wordWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* FLIP morph: just before the backdrop fades, measure the live source
       and the header brand ([data-brand]) and translate+scale the word onto
       it. Measuring at morph time (not mount) keeps it correct at any
       viewport, so it's responsive by construction. The word then sits on the
       brand as the overlay unmounts — one TabsirCG, no double. */
    const morph = setTimeout(() => {
      const brand = document.querySelector<HTMLElement>("[data-brand]");
      const src = wordWrapRef.current;
      if (!brand || !src) return;
      const br = brand.getBoundingClientRect();
      const sr = src.getBoundingClientRect();
      if (br.width > 0 && sr.width > 0) {
        const scale = br.width / sr.width;
        const dx = br.left + br.width / 2 - (sr.left + sr.width / 2);
        const dy = br.top + br.height / 2 - (sr.top + sr.height / 2);
        src.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scale})`;
      }
    }, MORPH_AT);

    const done = setTimeout(onDone, INTRO_DURATION);
    return () => {
      clearTimeout(morph);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div
      className={cn(
        "intro-overlay fixed inset-0 font-mono",
        "pointer-events-auto select-none",
      )}
      aria-hidden="true"
    >
      <div className="intro-bg absolute inset-0 bg-ink"></div>
      <div className="intro-scan pointer-events-none absolute inset-x-0 top-0 h-0.5"></div>

      <div className="intro-rings pointer-events-none absolute inset-x-0 top-[-20vh] h-[240vh]">
        <IntroRings />
      </div>

      {/* Mirrors the header brand exactly (cream Tabsir + accent CG, mono,
          tracking-tighter) so the morph lands as a seamless single word. Each
          character types in one at a time (staggered via --char-i). Width is
          fixed from the start (chars only fade), so the centred word never
          shifts and the morph measures a stable box. */}
      <div
        ref={wordWrapRef}
        className="intro-word absolute top-1/2 left-1/2 z-10 font-mono leading-none tracking-tighter text-cream whitespace-nowrap"
      >
        {"TabsirCG".split("").map((ch, i) => (
          <span
            key={i}
            className={cn("intro-char inline-block", i >= 6 && "text-accent")}
            style={{ "--char-i": i } as React.CSSProperties}
          >
            {ch}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Intro() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (document.documentElement.dataset.skipIntro === "1" || reduced) {
      /* Skip the intro entirely. Setting data-skip-intro zeroes --hero-stagger
         (hero animates immediately) and un-hides the header brand, so a
         reduced-motion user never sees the word stuck at center. */
      document.documentElement.dataset.skipIntro = "1";
      setShow(false);
    }
  }, []);

  const handleDone = useCallback(() => {
    localStorage.setItem("intro-played", String(Date.now()));
    /* Reveal the header brand in the SAME commit that unmounts the overlay, so
       the landed word and the real brand swap on a single frame — they're never
       both visible. */
    document.documentElement.dataset.introDone = "1";
    setShow(false);
    /* Defer the skip flag until the hero entrance has finished. Flipping
       --hero-stagger to 0ms mid-handoff would recompute the hero animation
       delays into the past and snap them in; flipping it after they've played
       is invisible, and lets later in-session remounts skip the intro. */
    window.setTimeout(() => {
      document.documentElement.dataset.skipIntro = "1";
    }, 2000);
  }, []);

  if (!show) return null;

  return (
    <div id="intro-root">
      <IntroInner onDone={handleDone} />
    </div>
  );
}
