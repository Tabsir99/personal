import { cn } from "@/lib/utils";
import { ContourSVG } from "./contour-svg";
import { CoordOverlay } from "./coord-overlay";

/* Shared plane class group — taller than viewport so parallax never reveals
   an empty edge. Parallax transform lives in atmosphere.css and reads
   --scroll-y from the active-section island. */
const PLANE =
  "absolute left-0 right-0 top-[-20vh] h-[240vh] will-change-transform";

/* =====================================================================
   Atmosphere — parallax background story.

   Three parallax planes are translated in the SAME direction as scroll
   but at fractional speeds, so the world reads as DEEPER than content.
   A grain pass and edge vignette sit fixed in the optics.

   A very subtle section-driven tint shifts the wash by section —
   barely-perceptible drift that an attentive eye reads as "this section
   feels different". All alphas < 0.05 on purpose.

   Sits at z-index 0; <main> is z-index 1. Pointer-events: none so
   nothing here ever steals interactivity.

   No JS: parallax + tint are pure CSS driven by --scroll-y +
   [data-active-section] signals from active-section.tsx.
   ===================================================================== */

export function Atmosphere() {
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
      <div className={cn(PLANE, "atm-far opacity-85")}>
        <ContourSVG />
      </div>

      {/* Subtle section-driven tint (background set via CSS attribute selectors) */}
      <div className="atm-tint absolute inset-0"></div>

      {/* Mid: drifting signal-fire orbs */}
      <div className={cn(PLANE, "atm-mid")}>
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
      <div className={cn(PLANE, "atm-near opacity-85")}>
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
