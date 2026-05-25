import { cn } from "@/lib/utils";
import { ContourSVG } from "./contour-svg";
import { CoordOverlay } from "./coord-overlay";

/* Taller than viewport so parallax never reveals an empty edge. */
const PLANE = "absolute inset-x-0 top-[-20vh] h-[240vh] will-change-transform";
const ORB =
  "absolute rounded-full will-change-transform motion-reduce:animate-none";

// size, position, hue, outer%, inner%, dx, dy, ds, duration(s), reverse?
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

/* Parallax planes get their translate written by scroll-island.tsx;
   section tint is pure CSS off [data-active-section] on <html>. */
export function Atmosphere() {
  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-ink"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_110%,color-mix(in_oklab,var(--color-accent)_4.5%,transparent),transparent_55%),radial-gradient(90%_70%_at_50%_-10%,color-mix(in_oklab,var(--color-ink-3)_55%,transparent),transparent_65%),linear-gradient(180deg,#0c0b0a_0%,#100e0c_50%,#14110e_100%)]"></div>

      <div id="atm-far" className={cn(PLANE)}>
        <ContourSVG />
      </div>

      <div id="atm-near" className={cn(PLANE)}>
        <CoordOverlay />
      </div>

      <div className="atm-tint absolute inset-0"></div>

      <div id="atm-mid" className={PLANE}>
        {ORBS.map(([size, pos, hue, outer, inner, dx, dy, ds, dur, rev], i) => (
          <div
            key={i}
            style={orbStyle(size, hue, outer, inner, dx, dy, ds, dur, rev)}
            className={cn(ORB, pos, "animate-drift")}
          ></div>
        ))}
      </div>

      <div className="atm-grain"></div>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_55%,color-mix(in_oklab,black_35%,transparent)_100%),radial-gradient(ellipse_at_top,transparent_70%,color-mix(in_oklab,black_25%,transparent)_100%)]"></div>
    </div>
  );
}
