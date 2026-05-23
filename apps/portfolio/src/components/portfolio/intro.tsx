"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ScrambleWord } from "./scramble-word";

type Stage =
  | "void"
  | "rings"
  | "brackets"
  | "scramble"
  | "morph"
  | "reveal"
  | "done";

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
            style={{ animationDelay: `${r.delay}s` }}
          />
        ))}
      </g>
      <circle cx="420" cy="780" r="3.6" fill="rgba(232, 148, 85, 0.95)" />
    </svg>
  );
}

const SCRAMBLE_WORDS = ["TABSIR · CG", "FRICTION"] as const;

/* Must stay in sync with .intro-scan's animation-delay and hero/terminal
   `delay-*` utilities so the overlay doesn't slam in on paint. */
const INTRO_DELAY = 1000;

/* `done` must fire before ScrambleWord's auto-loop triggers its second
   scramble (~100ms later). */
const TIMINGS = {
  rings: INTRO_DELAY + 900,
  brackets: INTRO_DELAY + 1500,
  scramble: INTRO_DELAY + 1850,
  morph: INTRO_DELAY + 4100,
  reveal: INTRO_DELAY + 4700,
  done: INTRO_DELAY + 5250,
} as const;

function IntroInner({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState<Stage>("void");
  const [morphTransform, setMorphTransform] = useState<string | null>(null);
  const wordWrapRef = useRef<HTMLDivElement>(null);

  /* FLIP: measure hero brackets, compute translate+scale onto them. */
  const computeMorph = useCallback(() => {
    const heroWord = document.querySelector<HTMLElement>("[data-hero-word]");
    const heroL = heroWord?.querySelector<HTMLElement>(
      "[data-hero-bracket='l']",
    );
    const heroR = heroWord?.querySelector<HTMLElement>(
      "[data-hero-bracket='r']",
    );
    const src = wordWrapRef.current;
    if (!heroWord || !heroL || !heroR || !src) return null;

    const hwRect = heroWord.getBoundingClientRect();
    const lRect = heroL.getBoundingClientRect();
    const rRect = heroR.getBoundingClientRect();
    const sr = src.getBoundingClientRect();

    const tLeft = lRect.left;
    const tRight = rRect.right;
    const tWidth = tRight - tLeft;
    const tHeight = hwRect.height;
    if (tWidth === 0 || sr.width === 0) return null;

    const scale = tWidth / sr.width;
    const sCx = sr.left + sr.width / 2;
    const sCy = sr.top + sr.height / 2;
    const tCx = tLeft + tWidth / 2;
    const tCy = hwRect.top + tHeight / 2;
    const dx = tCx - sCx;
    const dy = tCy - sCy;

    return `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scale})`;
  }, []);

  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setStage("done");
      return;
    }
    document.documentElement.classList.add("intro-active");

    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setStage("rings"), TIMINGS.rings),
      setTimeout(() => setStage("brackets"), TIMINGS.brackets),
      setTimeout(() => setStage("scramble"), TIMINGS.scramble),
      setTimeout(() => {
        const m = computeMorph();
        if (m) setMorphTransform(m);
        setStage("morph");
      }, TIMINGS.morph),
      setTimeout(() => setStage("reveal"), TIMINGS.reveal),
      setTimeout(() => setStage("done"), TIMINGS.done),
    ];

    return () => timers.forEach(clearTimeout);
  }, [computeMorph]);

  useEffect(() => {
    function onResize() {
      if (stage === "morph" || stage === "reveal") {
        const m = computeMorph();
        if (m) setMorphTransform(m);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [stage, computeMorph]);

  useEffect(() => {
    if (stage === "done") {
      document.documentElement.classList.remove("intro-active");
      onDone();
    }
  }, [stage, onDone]);

  if (stage === "done") return null;

  const wordStyle: React.CSSProperties | undefined =
    (stage === "morph" || stage === "reveal") && morphTransform
      ? { transform: morphTransform }
      : undefined;

  const showScramble =
    stage === "scramble" || stage === "morph" || stage === "reveal";

  return (
    <div
      className={cn(
        "intro-overlay fixed inset-0 font-mono",
        "pointer-events-auto select-none",
      )}
      data-stage={stage}
      aria-hidden="true"
    >
      <div className="intro-bg absolute inset-0 bg-ink"></div>
      <div className="intro-scan pointer-events-none absolute inset-x-0 top-0 h-0.5"></div>

      <div className="intro-rings pointer-events-none absolute inset-x-0 top-[-20vh] h-[240vh] opacity-0">
        <IntroRings />
      </div>

      <div
        ref={wordWrapRef}
        style={wordStyle}
        className={cn(
          "intro-word absolute top-1/2 left-1/2 z-10",
          "inline-flex items-baseline gap-[0.04em]",
          "font-mono font-medium text-accent uppercase whitespace-nowrap",
        )}
      >
        <span className="intro-bracket intro-bracket--l inline-block font-normal text-accent-2 opacity-0">
          [
        </span>
        <span className="intro-word-inner inline-block text-center opacity-0">
          {showScramble && (
            <ScrambleWord
              words={[...SCRAMBLE_WORDS]}
              hold={1300}
              duration={900}
            />
          )}
        </span>
        <span className="intro-bracket intro-bracket--r inline-block font-normal text-accent-2 opacity-0">
          ]
        </span>
      </div>
    </div>
  );
}

/* Unmount once `done` so timers and listeners are torn down. */
export function Intro() {
  const [mounted, setMounted] = useState(true);
  const handleDone = useCallback(() => setMounted(false), []);
  if (!mounted) return null;
  return <IntroInner onDone={handleDone} />;
}
