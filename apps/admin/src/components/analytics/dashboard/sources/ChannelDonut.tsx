"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { getFaviconUrl } from "@/components/ui/favicon";
import type { ChannelMetric, SourceMetric } from "@/lib/analyticsTypes";
import { donutBand } from "../shared/chartTheme";
import { FloatingTooltipPortal } from "../shared/AnalyticsTooltip";
import { buildChannelSliceTooltip } from "../shared/tooltipBuilders";
import type { MetricId } from "../shared/MetricToggle";

interface ChannelDonutProps {
  channels: ChannelMetric[];
  referrers: SourceMetric[];
  /** "all", or a channel name to break down by its referrers */
  channel: string;
  metric: MetricId;
  revealed: boolean;
}

const MAX_SLICES = 8;
const THICKEN = 7.5; // px the band grows on EACH edge on hover
const CORNER = 7; // px corner radius on each ring segment
const PAD = 0.04; // angular gap between slices (radians)
const GAP = 26; // min vertical px between labels
const DIM = 0.72; // opacity of non-hovered bands
const MIN_LABEL_SHARE = 0.015; // smaller slices are tooltip-only
const LBL = "fill-foreground text-[12.5px] font-medium";
const SLICE_TRANSITION = "d .55s cubic-bezier(.22,1,.36,1), opacity .25s";

const uv = (v: { newVisitors: number; returningVisitors: number }) =>
  v.newVisitors + v.returningVisitors;

// Ring labels live in a fixed side gutter, so hosts shed their scheme and `www.`.
const hostLabel = (raw: string) =>
  /^(?:https?:\/\/)?(?:www\.)?([^/\s]+\.[^/\s]+)/i.exec(raw)?.[1] ?? raw;

const toRow = (v: ChannelMetric | SourceMetric) => ({
  name: hostLabel(v.name),
  visitors: uv(v),
  revenue: v.revenue,
  newVisitors: v.newVisitors,
  returningVisitors: v.returningVisitors,
});

type Row = ReturnType<typeof toRow>;

const splitRow = (name: string, n: number, back: boolean): Row => ({
  name,
  visitors: n,
  revenue: 0,
  newVisitors: back ? 0 : n,
  returningVisitors: back ? n : 0,
});

function rowsFor(
  channels: ChannelMetric[],
  referrers: SourceMetric[],
  channel: string,
): Row[] {
  if (channel === "all") return channels.map(toRow);
  const drill = referrers.filter((r) => r.channel === channel && r.name);
  if (drill.length > 1) return drill.map(toRow);
  const c = channels.find((x) => x.name === channel);
  if (!c) return [];
  // No referrers to split by, so fall back to the one axis every channel has.
  return [
    splitRow("New visitors", c.newVisitors, false),
    splitRow("Returning visitors", c.returningVisitors, true),
  ];
}

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
  channels,
  referrers,
  channel,
  metric,
  revealed,
}: ChannelDonutProps) {
  const [containerRef, { w }] = useSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const sized = rowsFor(channels, referrers, channel)
    .map((r) => ({ ...r, size: metric === "revenue" ? r.revenue : r.visitors }))
    .filter((r) => r.size > 0)
    .sort((a, b) => b.size - a.size);

  const data = sized.slice(0, MAX_SLICES);
  const total = data.reduce((s, i) => s + i.size, 0) || 1;
  // Shares stay against every source, not just the ones that fit on the ring.
  const visitorTotal = sized.reduce((s, i) => s + i.visitors, 0) || 1;

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
    acc += it.size;
    const t1 = (acc / total) * 2 * Math.PI;
    slices.push({ ...it, i, t0, t1, mid: (t0 + t1) / 2, sweep: t1 - t0 });
  }

  const ready = revealed && w > 0 && slices.length > 0;

  // Height derives from width: the donut sits in containers that collapse to content.
  const H = Math.round(Math.max(260, Math.min(w * 0.66, 400)));
  const CX = w / 2;
  const CY = H / 2;
  const OUTER = Math.max(60, Math.min(w / 2 - 112, H / 2 - 20, 200));
  const THICK = OUTER * 0.39;
  const INNER = OUTER - THICK;
  const MID = (INNER + OUTER) / 2;

  const CIRCUMFERENCE = 2 * Math.PI * MID;
  const MASK_STROKE = THICK + THICKEN * 2 + 8;

  const CHIP = Math.round(Math.max(12, Math.min(THICK * 0.26, 16)));
  const PITCH = CHIP + 2;
  const chipRoom = THICK >= PITCH * 2 + 4;

  const polar = (r: number, t: number) => ({
    x: CX + r * Math.sin(t),
    y: CY - r * Math.cos(t),
  });

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
    const corner = `A ${rc} ${rc} 0 0 1`;
    return [
      `M ${P(ro - rc, a0)}`,
      `${corner} ${P(ro, a0 + daO)}`,
      `A ${ro} ${ro} 0 ${largeO} 1 ${P(ro, a1 - daO)}`,
      `${corner} ${P(ro - rc, a1)}`,
      `L ${P(ri + rc, a1)}`,
      `${corner} ${P(ri, a1 - daI)}`,
      `A ${ri} ${ri} 0 ${largeI} 0 ${P(ri, a0 + daI)}`,
      `${corner} ${P(ri + rc, a0)}`,
      "Z",
    ].join(" ");
  };

  const bandOf = (s: Slice) => donutBand(s.i, data.length, metric);

  const chipsFor = (name: string) =>
    channel === "all"
      ? referrers.filter((r) => r.channel === name && r.name).map((r) => r.name)
      : [name];

  // Axis-aligned, so the block reads the same wherever it lands on the ring.
  const chipOffset = (k: number, n: number): [number, number] => {
    if (n === 1) return [0, 0];
    if (n === 2) return [(k - 0.5) * PITCH, 0];
    return k < 2 ? [(k - 0.5) * PITCH, -PITCH / 2] : [0, PITCH / 2];
  };

  const labelled = slices
    .filter((s) => s.size / total >= MIN_LABEL_SHARE)
    .map((s) => ({
      ...s,
      right: Math.sin(s.mid) >= 0,
      y: CY - (OUTER + 16) * Math.cos(s.mid),
    }));
  for (const side of [true, false]) {
    const col = labelled
      .filter((s) => s.right === side)
      .sort((a, b) => a.y - b.y);
    for (let i = 1; i < col.length; i++)
      col[i].y = Math.max(col[i].y, col[i - 1].y + GAP);
    const over = col.length ? col[col.length - 1].y - (H - 12) : 0;
    if (over > 0) col.forEach((s) => (s.y -= over));
  }

  const active = hover !== null ? slices[hover] : null;
  const dimOf = (i: number) => (hover !== null && hover !== i ? DIM : 1);

  return (
    <div ref={containerRef} className="w-full">
      {slices.length === 0 ? (
        <div className="flex min-h-60 items-center justify-center text-xs text-muted-foreground/50">
          {metric === "revenue"
            ? "No revenue in this period"
            : "No data for this period"}
        </div>
      ) : (
        ready && (
          <svg viewBox={`0 0 ${w} ${H}`} width={w} height={H} className="block">
            <defs>
              <clipPath id="chip" clipPathUnits="objectBoundingBox">
                <rect width="1" height="1" rx="0.18" ry="0.18" />
              </clipPath>
              <filter
                id="chip-shadow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feDropShadow
                  dx="0"
                  dy="1"
                  stdDeviation="1"
                  floodOpacity="0.12"
                  floodColor="#000000"
                />
              </filter>
              <mask id="donut-sweep" maskUnits="userSpaceOnUse">
                <motion.circle
                  cx={CX}
                  cy={CY}
                  r={MID}
                  fill="none"
                  stroke="white"
                  strokeWidth={MASK_STROKE}
                  strokeDasharray={CIRCUMFERENCE}
                  initial={{ strokeDashoffset: CIRCUMFERENCE }}
                  animate={{ strokeDashoffset: ready ? 0 : CIRCUMFERENCE }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  transform={`rotate(-90 ${CX} ${CY})`}
                />
              </mask>
            </defs>

            <g mask="url(#donut-sweep)" className="pointer-events-none">
              {slices.map((s) => {
                const pad = Math.min(PAD, s.sweep * 0.5);
                const a0 = s.t0 + pad / 2;
                const a1 = s.t1 - pad / 2;
                const rc = Math.max(
                  0,
                  Math.min(
                    CORNER,
                    THICK / 2 - 1,
                    ((a1 - a0) / 2 - 0.02) * INNER,
                  ),
                );
                const g = hover === s.i ? THICKEN : 0;
                const d = sector(a0, a1, INNER - g, OUTER + g, rc);
                const band = bandOf(s);
                return (
                  <path
                    key={s.name}
                    d={d}
                    fill={band.fill}
                    stroke={band.edge}
                    strokeWidth={1}
                    opacity={dimOf(s.i)}
                    style={{ d: `path("${d}")`, transition: SLICE_TRANSITION }}
                  />
                );
              })}
            </g>

            <g
              mask="url(#donut-sweep)"
              onMouseLeave={() => setHover(null)}
              className="pointer-events-auto"
            >
              {slices.map((s) => (
                <path
                  key={`hit-${s.name}`}
                  d={sector(s.t0, s.t1, INNER - THICKEN, OUTER + THICKEN, 0)}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHover(s.i)}
                />
              ))}
            </g>

            {labelled.map((s) => {
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
                    stroke={bandOf(s).edge}
                    strokeWidth={1.5}
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

            <g className="pointer-events-none" mask="url(#donut-sweep)">
              {slices.flatMap((s) => {
                const room =
                  chipRoom && s.sweep * INNER >= PITCH * 2 + 8 ? 3 : 1;
                const list = chipsFor(s.name).slice(0, room);
                const anchor = polar(MID, s.mid);
                return list.map((src, k) => {
                  const url = getFaviconUrl(src, 64);
                  if (!url) return null;
                  const [dx, dy] = chipOffset(k, list.length);
                  const x = anchor.x + dx - CHIP / 2;
                  const y = anchor.y + dy - CHIP / 2;
                  return (
                    <g
                      key={`${s.name}-${k}`}
                      opacity={dimOf(s.i)}
                      className="[transition:opacity_.25s]"
                    >
                      <rect
                        x={x}
                        y={y}
                        width={CHIP}
                        height={CHIP}
                        rx={CHIP * 0.18}
                        className="fill-card stroke-foreground/10"
                        filter="url(#chip-shadow)"
                      />
                      <image
                        href={url}
                        x={x + 1}
                        y={y + 1}
                        width={CHIP - 2}
                        height={CHIP - 2}
                        clipPath="url(#chip)"
                      />
                    </g>
                  );
                });
              })}
            </g>
          </svg>
        )
      )}

      <FloatingTooltipPortal
        sections={
          active
            ? buildChannelSliceTooltip(
                { ...active, value: active.visitors },
                visitorTotal,
              )
            : null
        }
      />
    </div>
  );
}
