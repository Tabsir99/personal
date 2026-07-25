"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { FunnelStep, FunnelStepData } from "@/lib/analyticsTypes";
import { formatCount } from "../../shared/chartFormat";
import { FunnelStepCard } from "./FunnelStepCard";

export interface RiverStep extends FunnelStepData {
  name: string;
  kind: FunnelStep["type"];
}

const RIVER_H = 384;
const FOOT_H = 64;
const CY = RIVER_H / 2;
const MARGIN = 24;
const MAX_HALF = CY - MARGIN;
const MIN_HALF = 8;
const GROW = 10;
const STROKE = 10;
const STROKE_HOVER = 20;
const STROKE_OP = 0.66;
const CARD_W = 288;
const REVEAL = "d .4s cubic-bezier(.22,1,.36,1), stroke-width .3s";

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function shade(i: number, n: number) {
  const t = n > 1 ? i / (n - 1) : 0;
  const l = (0.965 - 0.365 * t).toFixed(3);
  const c = (0.02 + 0.12 * t).toFixed(3);
  return `oklch(${l} ${c} 198)`;
}

export function FunnelRiver({ steps }: { steps: RiverStep[] }) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const cardRef = useRef<HTMLDivElement>(null);
  const lastCursorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hover, setHover] = useState<number | null>(null);

  const n = steps.length;

  const getCardPos = (clientX: number, clientY: number) => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 0;
    const vh = typeof window !== "undefined" ? window.innerHeight : 0;
    const cardH = cardRef.current?.offsetHeight || 280;
    const cardLeft = Math.max(8, Math.min(clientX - CARD_W / 2, vw - CARD_W - 8));
    let cardTop = clientY - cardH - 12;
    if (cardTop < 8) {
      cardTop = Math.min(clientY + 18, vh - cardH - 8);
    }
    return { x: cardLeft, y: cardTop };
  };

  const updateCardPos = (clientX: number, clientY: number) => {
    if (!cardRef.current) return;
    const { x, y } = getCardPos(clientX, clientY);
    cardRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  useLayoutEffect(() => {
    if (hover !== null && cardRef.current) {
      updateCardPos(lastCursorRef.current.x, lastCursorRef.current.y);
    }
  }, [hover]);

  if (w === 0 || n === 0) {
    return <div ref={ref} className="relative size-full" />;
  }

  const colW = w / n;
  const maxValue = Math.max(...steps.map((s) => s.value), 1);
  const boundHalf = (i: number) =>
    Math.max(MIN_HALF, (steps[Math.min(i, n - 1)].value / maxValue) * MAX_HALF);

  const slicePaths = (i: number, g: number) => {
    const xL = i * colW;
    const xR = (i + 1) * colW;
    const mid = (xL + xR) / 2;
    const hL = boundHalf(i) + g;
    const hR = boundHalf(i + 1) + g;
    const top = `M ${xL} ${CY - hL} C ${mid} ${CY - hL}, ${mid} ${CY - hR}, ${xR} ${CY - hR}`;
    const bot = `M ${xR} ${CY + hR} C ${mid} ${CY + hR}, ${mid} ${CY + hL}, ${xL} ${CY + hL}`;
    const fill = `M ${xL} ${CY - hL} C ${mid} ${CY - hL}, ${mid} ${CY - hR}, ${xR} ${CY - hR} L ${xR} ${CY + hR} C ${mid} ${CY + hR}, ${mid} ${CY + hL}, ${xL} ${CY + hL} Z`;
    return { edges: `${top} ${bot}`, fill };
  };

  const halfAt = (x: number) => {
    const i = Math.min(n - 1, Math.max(0, Math.floor(x / colW)));
    const t = (x - i * colW) / colW;
    const s = t * t * (3 - 2 * t);
    return boundHalf(i) + (boundHalf(i + 1) - boundHalf(i)) * s;
  };

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    if (x >= 0 && x <= w && Math.abs(y - CY) <= halfAt(x) + 3) {
      const nextHover = Math.min(n - 1, Math.max(0, Math.floor(x / colW)));
      const pos = getCardPos(e.clientX, e.clientY);
      lastCursorRef.current = pos;

      if (hover !== nextHover) {
        setHover(nextHover);
      }
      updateCardPos(e.clientX, e.clientY);
    } else if (hover !== null) {
      setHover(null);
    }
  };

  return (
    <div
      ref={ref}
      className="relative size-full"
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      <svg
        viewBox={`0 0 ${w} ${RIVER_H}`}
        width={w}
        height={RIVER_H}
        className="pointer-events-none absolute inset-x-0 top-0 block"
      >
        {steps.slice(1).map((_, k) => {
          const i = k + 1;
          const x = i * colW;
          const h = boundHalf(i);
          return (
            <g key={i} className="stroke-foreground/12">
              <line x1={x} y1={MARGIN} x2={x} y2={CY - h} strokeWidth={1} />
              <line
                x1={x}
                y1={CY + h}
                x2={x}
                y2={RIVER_H - MARGIN}
                strokeWidth={1}
              />
            </g>
          );
        })}

        <g className="animate-funnel-wipe">
          {steps.map((_, i) => {
            const on = hover === i;
            const { edges, fill } = slicePaths(i, on ? GROW : 0);
            const color = shade(i, n);
            return (
              <g key={i}>
                <path
                  d={edges}
                  fill="none"
                  stroke={color}
                  strokeOpacity={STROKE_OP}
                  strokeWidth={on ? STROKE_HOVER : STROKE}
                  style={{ d: `path("${edges}")`, transition: REVEAL }}
                />
                <path
                  d={fill}
                  fill={color}
                  style={{ d: `path("${fill}")`, transition: REVEAL }}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {steps.slice(1).map((s, idx) => {
        const i = idx + 1;
        const drop = s.dropoffFromPrevious;
        const gain = drop < 0;
        return (
          <div
            key={i}
            className="pointer-events-none absolute z-20 -translate-1/2"
            style={{ left: (i / n) * w, top: CY }}
          >
            <span
              className={cn(
                "flex items-center gap-0.5 rounded-full bg-card px-2 py-0.5 text-xs font-medium tabular-nums shadow-card-rest ring-1 ring-border",
                gain ? "text-primary" : "text-muted-foreground",
              )}
            >
              {gain ? "+" : "-"}
              {Math.abs(drop).toFixed(1)}%
              <ArrowRightIcon size={11} weight="bold" />
            </span>
          </div>
        );
      })}

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 grid"
        style={{
          height: FOOT_H,
          gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
        }}
      >
        {steps.map((s, i) => (
          <div key={i} className="min-w-0 pt-2.5 pl-3.5">
            <div className="text-sm">
              <span className="font-semibold text-foreground">
                {formatCount(s.value)}
              </span>{" "}
              <span className="text-foreground/45">visitors</span>
            </div>
            <div
              className="mt-0.5 truncate text-xs text-foreground/70"
              title={s.name}
            >
              {s.name}
            </div>
          </div>
        ))}
      </div>

      {hover !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={cardRef}
            className="pointer-events-none fixed top-0 left-0 z-50"
            style={{
              transform: `translate3d(${lastCursorRef.current.x}px, ${lastCursorRef.current.y}px, 0)`,
            }}
          >
            <FunnelStepCard steps={steps} index={hover} />
          </div>,
          document.body,
        )}
    </div>
  );
}
