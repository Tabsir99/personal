import { cn } from "@/lib/utils";
import { ContourSVG } from "./contour-svg";
import { CoordOverlay } from "./coord-overlay";

/* Shared plane class group — taller than viewport so parallax never reveals
   an empty edge. Parallax transform lives in atmosphere.css and reads
   --scroll-y from the active-section island. */
const PLANE = "absolute inset-x-0 top-[-20vh] h-[240vh] will-change-transform";
const ORB =
  "absolute rounded-full will-change-transform motion-reduce:animate-none";

// One row per orb: size, position utilities, hue var, outer%, inner%,
// drift-x (px), drift-y (px), drift-scale, duration (s), reverse?. All orbs
// share the `drift` keyframe in atmosphere.css; per-orb motion is
// parameterized via CSS vars, and duration / direction live in inline style
// (Tailwind's JIT can't follow dynamic class strings).
const ORBS = [
  [
    720,
    "top-[4vh] left-[-160px]",
    "var(--color-accent)",
    22,
    10,
    40,
    -30,
    1.08,
    28,
    false,
  ],
  [
    620,
    "top-[60vh] right-[-120px]",
    "var(--color-phosphor)",
    12,
    5,
    -50,
    40,
    0.92,
    34,
    false,
  ],
  [
    860,
    "top-[130vh] left-[28vw]",
    "var(--color-accent-2)",
    14,
    6,
    30,
    -50,
    1.05,
    40,
    false,
  ],
  [
    560,
    "top-[195vh] right-[16vw]",
    "var(--color-accent)",
    18,
    7,
    40,
    -30,
    1.08,
    32,
    true,
  ],
] as const;

const orbStyle = (
  size: number,
  hue: string,
  outer: number,
  inner: number,
  dx: number,
  dy: number,
  ds: number,
  dur: number,
  reverse: boolean,
): React.CSSProperties =>
  ({
    width: size,
    height: size,
    backgroundImage: `radial-gradient(circle,color-mix(in oklab,${hue} ${outer}%,transparent) 0%,color-mix(in oklab,${hue} ${inner}%,transparent) 30%,transparent 70%)`,
    "--drift-x": `${dx}px`,
    "--drift-y": `${dy}px`,
    "--drift-s": ds,
    animationDuration: `${dur}s`,
    animationDirection: reverse ? "reverse" : undefined,
  }) as React.CSSProperties;

/* =====================================================================
   Atmosphere — parallax background story.

   Three parallax planes are translated in the SAME direction as scroll
   but at fractional speeds, so the world reads as DEEPER than content.
   A grain pass and edge vignette sit fixed in the optics.

   Sits at z-index 0; <main> is z-index 1. Pointer-events: none so
   nothing here ever steals interactivity.

   No JS: parallax + tint are pure CSS driven by --scroll-y +
   [data-active-section] signals from active-section.tsx.
   ===================================================================== */

export function Atmosphere() {
  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-ink"
      aria-hidden="true"
    >
      {/* Base wash — top-to-bottom luminance shift; bottom is fractionally
          warmer/lighter than top so content sits ON the page. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_110%,color-mix(in_oklab,var(--color-accent)_4.5%,transparent),transparent_55%),radial-gradient(90%_70%_at_50%_-10%,color-mix(in_oklab,var(--color-ink-3)_55%,transparent),transparent_65%),linear-gradient(180deg,#0c0b0a_0%,#100e0c_50%,#14110e_100%)]"></div>

      {/* Far: topographic contours — deepest plane */}
      <div className={cn(PLANE, "atm-far opacity-85")}>
        <ContourSVG />
      </div>

      {/* Subtle section-driven tint (background set via CSS attribute selectors) */}
      <div className="atm-tint absolute inset-0"></div>

      {/* Mid: drifting signal-fire orbs */}
      <div className={cn(PLANE, "atm-mid")}>
        {ORBS.map(([size, pos, hue, outer, inner, dx, dy, ds, dur, rev], i) => (
          <div
            key={i}
            style={orbStyle(size, hue, outer, inner, dx, dy, ds, dur, rev)}
            className={cn(ORB, pos, "animate-drift")}
          ></div>
        ))}
      </div>

      {/* Near: coordinate waypoints */}
      <div className={cn(PLANE, "atm-near opacity-85")}>
        <CoordOverlay />
      </div>

      {/* Optics layer (fixed): grain + vignette */}
      <div className="atm-grain"></div>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_55%,color-mix(in_oklab,black_35%,transparent)_100%),radial-gradient(ellipse_at_top,transparent_70%,color-mix(in_oklab,black_25%,transparent)_100%)]"></div>
    </div>
  );
}
