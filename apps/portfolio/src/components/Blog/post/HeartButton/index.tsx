import "./style.css";
import { useId, useRef, useState, type CSSProperties } from "react";

const H =
  "M50 87C22 71 4 51 4 30 4 16 15 6 28 6 38 6 46 12 50 22 54 12 62 6 72 6 85 6 96 16 96 30 96 51 78 71 50 87Z";
const W =
  "M-100 5 Q-75 2 -50 5 Q-25 8 0 5 Q25 2 50 5 Q75 8 100 5 Q125 2 150 5 Q175 8 200 5 V110 H-100 Z";

// Lets you put CSS custom properties (--foo) in a style object without TS complaining.
type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

interface BurstParticle {
  i: number;
  tx: number;
  ty: number;
  s: number;
}

interface Burst {
  id: number;
  parts: BurstParticle[];
}

interface WaveHeartProps {
  fill: number; // 0..1, owned by parent — single source of truth
  size?: number;
  onTap?: () => void;
  ariaLabel?: string;
}

export function HeartButton({
  fill,
  size = 96,
  onTap,
  ariaLabel = "Like",
}: WaveHeartProps) {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [pulse, setPulse] = useState(false);
  const u = useId(); // stable, unique per instance, SSR-safe
  const burstId = useRef(0); // per-instance burst counter
  const full = fill >= 0.999;

  const click = () => {
    onTap?.();
    setPulse(false);
    requestAnimationFrame(() => setPulse(true));
    setTimeout(() => setPulse(false), 470);

    const id = ++burstId.current;
    const parts: BurstParticle[] = Array.from({ length: 9 }, (_, i) => {
      const a =
        -Math.PI / 2 + (i / 9) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const d = 42 + Math.random() * 32;
      return {
        i,
        tx: Math.cos(a) * d,
        ty: Math.sin(a) * d - 6,
        s: 0.5 + Math.random() * 0.8,
      };
    });

    setBursts((b) => [...b, { id, parts }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1200);
  };

  return (
    <button
      type="button"
      className={`heart-btn${pulse ? " is-pulsing" : ""}${full ? " is-full" : ""}`}
      style={{ width: size, height: size }}
      onClick={click}
      aria-label={ariaLabel}
      aria-pressed={full}
    >
      <span className="heart-stage" style={{ "--fill": fill } as CSSVars}>
        <svg className="heart-svg" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <radialGradient id={"b" + u} cx="36%" cy="26%" r="78%">
              <stop offset="0%" className="heart-empty-top" />
              <stop offset="48%" className="heart-empty-mid" />
              <stop offset="100%" className="heart-empty-bot" />
            </radialGradient>
            <linearGradient id={"w" + u} x2="0" y2="1">
              <stop offset="0%" className="heart-fill-top" />
              <stop offset="40%" className="heart-fill-mid" />
              <stop offset="100%" className="heart-fill-bot" />
            </linearGradient>
            <radialGradient id={"v" + u} cx="50%" cy="48%" r="60%">
              <stop
                offset="55%"
                className="heart-vignette-stop"
                stopOpacity="0"
              />
              <stop
                offset="100%"
                className="heart-vignette-stop"
                stopOpacity=".42"
              />
            </radialGradient>
            <clipPath id={"c" + u}>
              <path d={H} />
            </clipPath>
          </defs>
          <path d={H} fill={`url(#b${u})`} />
          <g clipPath={`url(#c${u})`}>
            <g className="water-rise">
              <path className="wave" d={W} fill={`url(#w${u})`} />
            </g>
            <rect width="100" height="100" fill={`url(#v${u})`} />
          </g>
          <path d={H} fill="none" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
        {bursts.map((b) => (
          <span className="burst" key={b.id} aria-hidden="true">
            <span className="splash-ring" />
            {b.parts.map((p) => (
              <span
                key={p.i}
                className="particle"
                style={
                  {
                    "--tx": p.tx + "px",
                    "--ty": p.ty + "px",
                    "--s": p.s,
                  } as CSSVars
                }
              />
            ))}
            <span className="plus-one">+1</span>
          </span>
        ))}
      </span>
    </button>
  );
}
