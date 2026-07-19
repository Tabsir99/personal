"use client";

import { useState } from "react";
import { getFaviconUrl } from "../../ui/favicon";

interface ChannelDonutProps {
  items: { name: string; value: number }[];
  /** channel name -> ordered representative referrer sources */
  sources?: Record<string, string[]>;
}

// One translucent teal (brand hue 198) at stepped alpha, so the ring reads as
// washed haze rather than solid fills. Largest slice least faint.
const RAMP = [0.36, 0.27, 0.21, 0.16, 0.13, 0.1].map(
  (a) => `oklch(0.76 0.085 198 / ${a})`,
);

const W = 560;
const H = 380;
const CX = W / 2;
const CY = H / 2;
const OUTER = 144;
const INNER = 86;
const MID = (INNER + OUTER) / 2;
const THICK = OUTER - INNER;
const GROW = 10; // stroke-width added on hover -> ±7px animated thicken
const PAD = 0.04; // angular gap between slices (radians)
const GAP = 26; // min vertical px between labels
const STEP = 0.19; // angular spacing between stacked logos
const LBL = "fill-foreground text-[12.5px] font-medium";
const NUM = "fill-foreground text-[30px] font-semibold tabular-nums";
const SUB = "fill-muted-foreground text-[11.5px]";
const TW = "[transition:stroke-width_.2s,opacity_.2s]";

const polar = (r: number, t: number) => ({
  x: CX + r * Math.sin(t),
  y: CY - r * Math.cos(t),
});

const arc = (t0: number, t1: number, r: number) => {
  const a = polar(r, t0);
  const b = polar(r, t1);
  const big = t1 - t0 > Math.PI ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${big} 1 ${b.x} ${b.y}`;
};

const fmt = (n: number) =>
  n >= 1e6
    ? `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`
    : n >= 1e3
      ? `${(n / 1e3).toFixed(1).replace(/\.0$/, "")}k`
      : n.toLocaleString();

export function ChannelDonut({ items, sources = {} }: ChannelDonutProps) {
  const [hover, setHover] = useState<number | null>(null);

  const data = items.filter((i) => i.value > 0);
  const total = data.reduce((s, i) => s + i.value, 0) || 1;

  let acc = 0;
  const slices = data.map((it, i) => {
    const t0 = (acc / total) * 2 * Math.PI;
    acc += it.value;
    const t1 = (acc / total) * 2 * Math.PI;
    return { ...it, i, t0, t1, mid: (t0 + t1) / 2, sweep: t1 - t0 };
  });

  if (slices.length === 0)
    return (
      <div className="flex h-full min-h-50 items-center justify-center text-[12px] text-muted-foreground/50">
        No data for this period
      </div>
    );

  const laid = slices.map((s) => ({
    ...s,
    right: Math.sin(s.mid) >= 0,
    y: CY - (OUTER + 16) * Math.cos(s.mid),
  }));
  for (const side of [true, false]) {
    const col = laid.filter((s) => s.right === side).sort((a, b) => a.y - b.y);
    for (let i = 1; i < col.length; i++)
      col[i].y = Math.max(col[i].y, col[i - 1].y + GAP);
    const over = col.length ? col[col.length - 1].y - (H - 12) : 0;
    if (over > 0) col.forEach((s) => (s.y -= over));
  }

  const a = hover !== null ? slices[hover] : null;
  const big = fmt(a ? a.value : total);
  const sub = a
    ? `${a.name} · ${Math.round((a.value / total) * 100)}%`
    : "Visitors";
  const dimOf = (i: number) => (hover !== null && hover !== i ? 0.55 : 1);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
        <defs>
          <clipPath id="chip" clipPathUnits="objectBoundingBox">
            <circle cx="0.5" cy="0.5" r="0.5" />
          </clipPath>
        </defs>

        {slices.map((s) => (
          <path
            key={s.name}
            d={arc(s.t0, Math.max(s.t0, s.t1 - PAD), MID)}
            fill="none"
            stroke={RAMP[s.i % RAMP.length]}
            strokeWidth={THICK + (hover === s.i ? GROW : 0)}
            opacity={dimOf(s.i)}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1}
            onMouseEnter={() => setHover(s.i)}
            onMouseLeave={() => setHover(null)}
            className={`cursor-pointer ${TW}`}
          >
            <animate
              attributeName="stroke-dashoffset"
              from="1"
              to="0"
              dur="0.12s"
              begin={`${s.i * 0.12}s`}
              fill="freeze"
            />
          </path>
        ))}

        {laid.map((s) => {
          const tx = s.right ? CX + OUTER + 24 : CX - OUTER - 24;
          const e = polar(OUTER + 3, s.mid);
          const k = polar(OUTER + 13, s.mid);
          const pts = `${e.x},${e.y} ${k.x},${s.y} ${s.right ? tx - 6 : tx + 6},${s.y}`;
          return (
            <g
              key={s.name}
              opacity={dimOf(s.i)}
              className="[transition:opacity_.2s]"
            >
              <polyline
                points={pts}
                fill="none"
                className="stroke-muted-foreground/40"
              />
              <text
                x={tx}
                y={s.y + 4}
                textAnchor={s.right ? "start" : "end"}
                className={LBL}
              >
                {s.name}
              </text>
            </g>
          );
        })}

        <g className="pointer-events-none">
          {slices.flatMap((s) => {
            const list = sources[s.name] ?? [];
            const n = Math.min(3, list.length, Math.floor(s.sweep / STEP));
            return list.slice(0, n).map((src, k) => {
              const p = polar(MID, s.mid + (k - (n - 1) / 2) * STEP);
              const url = getFaviconUrl(src, 64);
              return url ? (
                <g key={`${s.name}-${k}`} opacity={dimOf(s.i)}>
                  <circle cx={p.x} cy={p.y} r={11} className="fill-white" />
                  <image
                    href={url}
                    x={p.x - 9}
                    y={p.y - 9}
                    width={18}
                    height={18}
                    clipPath="url(#chip)"
                  />
                </g>
              ) : null;
            });
          })}
        </g>

        <text x={CX} y={CY - 6} textAnchor="middle" className={NUM}>
          {big}
        </text>
        <text x={CX} y={CY + 15} textAnchor="middle" className={SUB}>
          {sub}
        </text>
      </svg>
    </div>
  );
}
