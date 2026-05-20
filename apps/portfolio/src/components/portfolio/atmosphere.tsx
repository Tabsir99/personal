import { cn } from "@/lib/utils";
import { ContourSVG } from "./contour-svg";
import { CoordOverlay } from "./coord-overlay";

/* Shared plane class group — taller than viewport so parallax never reveals
   an empty edge. Parallax transform lives in atmosphere.css and reads
   --scroll-y from the active-section island. */
const PLANE = "absolute inset-x-0 top-[-20vh] h-[240vh] will-change-transform";
const ORB = "absolute rounded-full will-change-transform motion-reduce:animate-none";

// One row per orb: size, position utilities, hue var, outer%, inner%, anim utility.
// Background gradient goes through inline style — Tailwind's JIT can't follow
// dynamic class concatenation, so per-orb arbitrary-value gradients must live
// outside the class string.
const ORBS = [
  [720, "top-[4vh] left-[-160px]",   "var(--color-accent)",   22, 10, "animate-atm-orb-drift-a"],
  [620, "top-[60vh] right-[-120px]", "var(--color-phosphor)", 12,  5, "animate-atm-orb-drift-b"],
  [860, "top-[130vh] left-[28vw]",   "var(--color-accent-2)", 14,  6, "animate-atm-orb-drift-c"],
  [560, "top-[195vh] right-[16vw]",  "var(--color-accent)",   18,  7, "animate-[atm-orb-drift-a_32s_ease-in-out_infinite_reverse]"],
] as const;

const orbStyle = (
  size: number,
  hue: string,
  outer: number,
  inner: number,
): React.CSSProperties => ({
  width: size,
  height: size,
  backgroundImage: `radial-gradient(circle,color-mix(in oklab,${hue} ${outer}%,transparent) 0%,color-mix(in oklab,${hue} ${inner}%,transparent) 30%,transparent 70%)`,
});

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
        {ORBS.map(([size, pos, hue, outer, inner, anim], i) => (
          <div
            key={i}
            style={orbStyle(size, hue, outer, inner)}
            className={cn(ORB, pos, anim)}
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
