"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ScrambleWord } from "./scramble-word";

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

function IntroInner({ onDone }: { onDone: () => void }) {
  const wordWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heroWord = document.querySelector<HTMLElement>("[data-hero-word]");
    const heroL = heroWord?.querySelector<HTMLElement>(
      "[data-hero-bracket='l']",
    );
    const heroR = heroWord?.querySelector<HTMLElement>(
      "[data-hero-bracket='r']",
    );
    const src = wordWrapRef.current;

    if (heroWord && heroL && heroR && src) {
      const hwRect = heroWord.getBoundingClientRect();
      const lRect = heroL.getBoundingClientRect();
      const rRect = heroR.getBoundingClientRect();
      const sr = src.getBoundingClientRect();

      const tLeft = lRect.left;
      const tRight = rRect.right;
      const tWidth = tRight - tLeft;
      const tHeight = hwRect.height;

      if (tWidth > 0 && sr.width > 0) {
        const scale = tWidth / sr.width;
        const sCx = sr.left + sr.width / 2;
        const sCy = sr.top + sr.height / 2;
        const tCx = tLeft + tWidth / 2;
        const tCy = hwRect.top + tHeight / 2;
        const dx = tCx - sCx;
        const dy = tCy - sCy;
        /* Setting the inline transform after first paint triggers the CSS
           transition (delayed in intro.css) into the morph target. */
        src.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scale})`;
      }
    }

    const t = setTimeout(onDone, INTRO_DURATION);
    return () => clearTimeout(t);
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

      <div
        ref={wordWrapRef}
        className={cn(
          "intro-word absolute top-1/2 left-1/2 z-10",
          "inline-flex items-baseline gap-[0.04em]",
          "font-mono font-medium text-accent uppercase whitespace-nowrap",
        )}
      >
        <span className="intro-bracket intro-bracket--l inline-block font-normal text-accent-2">
          [
        </span>
        <span className="intro-word-inner inline-block text-center">
          <ScrambleWord
            words={["TABSIR · CG", "FRICTION"]}
            hold={1300}
            duration={900}
            delay={2850}
            loop={false}
          />
        </span>
        <span className="intro-bracket intro-bracket--r inline-block font-normal text-accent-2">
          ]
        </span>
      </div>
    </div>
  );
}

export function Intro() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (document.documentElement.dataset.skipIntro === "1") setShow(false);
  }, []);

  const handleDone = useCallback(() => {
    localStorage.setItem("intro-played", String(Date.now()));
    document.documentElement.dataset.skipIntro = "1";
    setShow(false);
  }, []);

  if (!show) return null;

  return (
    <div id="intro-root">
      <IntroInner onDone={handleDone} />
    </div>
  );
}
