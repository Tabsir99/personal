"use client";

import { useEffect, useRef, useState } from "react";
import { getFaviconUrl } from "@/components/ui/favicon";
import { CHART } from "../shared/chartTheme";
import { formatCount } from "../shared/chartFormat";

interface ChannelDonutProps {
  items: { name: string; value: number }[];
  /** channel name -> ordered representative referrer sources */
  sources?: Record<string, string[]>;
  revealed: boolean;
}

const THICKEN = 7.5; // px the band grows on EACH edge on hover (outer + inner)
const CORNER = 7; // px corner radius on each ring segment
const PAD = 0.04; // angular gap between slices (radians)
const GAP = 26; // min vertical px between labels
const STEP = 0.19; // angular spacing between stacked logos
const LBL = "fill-foreground text-[12.5px] font-medium";
const NUM = "fill-foreground text-[30px] font-semibold tabular-nums";
const SUB = "fill-muted-foreground text-[11.5px]";
// Soft, slow ease-out so the band "fluffs" thicker rather than snapping. Morphs
// the path `d` (CSS d property) so the band grows about its mid-radius in place.
const SLICE_TRANSITION = "d .55s cubic-bezier(.22,1,.36,1), opacity .25s";

function useSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

export function ChannelDonut({
  items,
  sources = {},
  revealed,
}: ChannelDonutProps) {
  const [containerRef, { w }] = useSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const data = items.filter((i) => i.value > 0);
  const total = data.reduce((s, i) => s + i.value, 0) || 1;

  type Slice = (typeof data)[number] & {
    i: number;
    t0: number;
    t1: number;
    mid: number;
    sweep: number;
  };
  const slices: Slice[] = [];
  let acc = 0;
  for (let i = 0; i < data.length; i++) {
    const it = data[i];
    const t0 = (acc / total) * 2 * Math.PI;
    acc += it.value;
    const t1 = (acc / total) * 2 * Math.PI;
    slices.push({ ...it, i, t0, t1, mid: (t0 + t1) / 2, sweep: t1 - t0 });
  }

  const ready = revealed && w > 0 && slices.length > 0;

  // Only the width is reliably measurable — the donut sits in containers whose
  // height collapses to content (e.g. premium-ds `.tab-panel__inner`), so the
  // height is derived from the width and applied explicitly. This fills the
  // parent's width and scales smoothly with it instead of locking to a fixed
  // viewBox aspect ratio.
  const H = Math.round(Math.max(260, Math.min(w * 0.66, 400)));
  const CX = w / 2;
  const CY = H / 2;
  // Side labels need ~112px of horizontal room; the ring is bounded by
  // whichever axis is tighter.
  const OUTER = Math.max(60, Math.min(w / 2 - 112, H / 2 - 20, 200));
  const THICK = OUTER * 0.39;
  const INNER = OUTER - THICK;
  const MID = (INNER + OUTER) / 2;

  const polar = (r: number, t: number) => ({
    x: CX + r * Math.sin(t),
    y: CY - r * Math.cos(t),
  });

  // Filled ring segment from a0→a1 between radii ri..ro, with `rc`-radius
  // rounded corners (quadratic) — so rounding stays small regardless of how
  // thick the band is, unlike round stroke caps.
  const sector = (
    a0: number,
    a1: number,
    ri: number,
    ro: number,
    rc: number,
  ) => {
    const daO = rc / ro;
    const daI = rc / ri;
    const largeO = a1 - daO - (a0 + daO) > Math.PI ? 1 : 0;
    const largeI = a1 - daI - (a0 + daI) > Math.PI ? 1 : 0;
    const P = (r: number, t: number) => {
      const p = polar(r, t);
      return `${p.x} ${p.y}`;
    };
    return [
      `M ${P(ro, a0 + daO)}`,
      `A ${ro} ${ro} 0 ${largeO} 1 ${P(ro, a1 - daO)}`,
      `Q ${P(ro, a1)} ${P(ro - rc, a1)}`,
      `L ${P(ri + rc, a1)}`,
      `Q ${P(ri, a1)} ${P(ri, a1 - daI)}`,
      `A ${ri} ${ri} 0 ${largeI} 0 ${P(ri, a0 + daI)}`,
      `Q ${P(ri, a0)} ${P(ri + rc, a0)}`,
      `L ${P(ro - rc, a0)}`,
      `Q ${P(ro, a0)} ${P(ro, a0 + daO)}`,
      "Z",
    ].join(" ");
  };

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
  const big = formatCount(a ? a.value : total);
  const sub = a
    ? `${a.name} · ${Math.round((a.value / total) * 100)}%`
    : "Visitors";
  const dimOf = (i: number) => (hover !== null && hover !== i ? 0.55 : 1);

  return (
    <div ref={containerRef} className="w-full">
      {slices.length === 0 ? (
        <div className="flex min-h-60 items-center justify-center text-xs text-muted-foreground/50">
          No data for this period
        </div>
      ) : (
        ready && (
          <svg viewBox={`0 0 ${w} ${H}`} width={w} height={H} className="block">
            <defs>
              <clipPath id="chip" clipPathUnits="objectBoundingBox">
                <circle cx="0.5" cy="0.5" r="0.5" />
              </clipPath>
            </defs>

            {slices.map((s) => {
              const a0 = s.t0 + PAD / 2;
              const a1 = s.t1 - PAD / 2;
              const rc = Math.max(
                0,
                Math.min(CORNER, THICK / 2 - 1, ((a1 - a0) / 2 - 0.02) * INNER),
              );
              const g = hover === s.i ? THICKEN : 0;
              const d = a1 > a0 ? sector(a0, a1, INNER - g, OUTER + g, rc) : "";
              return (
                <g key={s.name} opacity="0">
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    dur="0.4s"
                    begin={`${s.i * 0.08}s`}
                    fill="freeze"
                  />
                  <path
                    d={d}
                    fill={CHART.ramp[s.i % CHART.ramp.length]}
                    opacity={dimOf(s.i)}
                    onMouseEnter={() => setHover(s.i)}
                    onMouseLeave={() => setHover(null)}
                    className="cursor-pointer"
                    style={{ d: `path("${d}")`, transition: SLICE_TRANSITION }}
                  />
                </g>
              );
            })}

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
                    <g
                      key={`${s.name}-${k}`}
                      opacity={dimOf(s.i)}
                      className="[transition:opacity_.25s]"
                    >
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
        )
      )}
    </div>
  );
}
