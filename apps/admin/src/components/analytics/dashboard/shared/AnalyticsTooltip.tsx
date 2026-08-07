"use client";

import {
  Fragment,
  isValidElement,
  memo,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Tooltip, type TooltipContentProps } from "recharts";
import type { RevenueSplit } from "@/lib/analyticsQuery";
import { swatchStyle, type ChartColors } from "./chartTheme";
import { NO_REVENUE } from "./revenue";
import { cn } from "@/lib/utils";

export interface Point {
  label: number | string;
  date: string;
  get: (key?: string) => number;
  raw: (key: string) => number;
  revenue: RevenueSplit;
}

export type TooltipRow = {
  label: ReactNode;
  value: ReactNode;
  color?: ChartColors;
  dim?: boolean;
};

export type TooltipGroup = TooltipRow & { parts: TooltipRow[] };

export type TooltipMeterSegment = {
  value: number;
  color: ChartColors;
  label: string;
};
export type TooltipMeter = { meter: TooltipMeterSegment[] };

export type TooltipSection =
  TooltipRow | TooltipGroup | TooltipMeter | ReactNode;

function isRow(s: TooltipSection): s is TooltipRow {
  return (
    typeof s === "object" &&
    s !== null &&
    !isValidElement(s) &&
    "label" in s &&
    "value" in s
  );
}

function isGroup(s: TooltipSection): s is TooltipGroup {
  return isRow(s) && "parts" in s;
}

function isMeter(s: TooltipSection): s is TooltipMeter {
  return (
    typeof s === "object" && s !== null && !isValidElement(s) && "meter" in s
  );
}

export function MeterBar({ segments }: { segments: TooltipMeterSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  return (
    <div className="px-3.5 pt-1 pb-3">
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
        {segments.map((s, i) => (
          <span
            key={i}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${(s.value / total) * 100}%`,
              ...swatchStyle(s.color),
            }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between gap-3 text-xs text-background/55">
        {segments.map((s, i) => (
          <span key={i}>{s.label}</span>
        ))}
      </div>
    </div>
  );
}

function Swatch({ color }: { color?: ChartColors }) {
  return (
    <span
      className="size-2.5 shrink-0 rounded-sm"
      {...(color ? { style: swatchStyle(color) } : {})}
    />
  );
}

export function Row({ row }: { row: TooltipRow }) {
  return (
    <div className="flex items-center justify-between gap-8 px-3.5 py-2.5">
      <span className="flex items-center gap-2">
        {row.color && <Swatch color={row.color} />}
        <span
          className={`text-sm ${row.dim ? "text-background/45" : "text-background/70"}`}
        >
          {row.label}
        </span>
      </span>
      <span
        className={`font-mono text-sm tabular-nums ${row.dim ? "text-background/65" : "font-semibold text-background"}`}
      >
        {row.value}
      </span>
    </div>
  );
}

export function RowGroup({ group }: { group: TooltipGroup }) {
  return (
    <div className="px-3.5 py-2.5">
      <div className="flex items-center justify-between gap-8">
        <span className="flex items-center gap-2">
          {group.color && <Swatch color={group.color} />}
          <span className="text-sm text-background/70">{group.label}</span>
        </span>
        <span className="font-mono text-sm font-semibold text-background tabular-nums">
          {group.value}
        </span>
      </div>
      <div className="mt-2 ml-1 flex flex-col gap-2 border-l border-background/12 pl-3">
        {group.parts.map((part, i) => (
          <div key={i} className="flex items-center justify-between gap-8">
            <span className="flex items-center gap-2">
              <Swatch {...(part.color ? { color: part.color } : {})} />
              <span className="text-xs text-background/45">{part.label}</span>
            </span>
            <span className="font-mono text-xs text-background/65 tabular-nums">
              {part.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface AnalyticsTooltipCardProps {
  sections: TooltipSection[];
  className?: string;
}

export function AnalyticsTooltipCard({
  sections,
  className,
}: AnalyticsTooltipCardProps) {
  const items = sections.filter(
    (s) => s !== null && s !== undefined && s !== false,
  );

  return (
    <div
      className={cn(
        "min-w-52 overflow-hidden rounded-xl bg-foreground text-background shadow-card-hover",
        className,
      )}
    >
      {items.map((s, i) => {
        const divider = i > 0 && !isMeter(s);
        return (
          <Fragment key={i}>
            {divider && <div className="h-px bg-background/10" />}
            {isMeter(s) ? (
              <MeterBar segments={s.meter} />
            ) : isGroup(s) ? (
              <RowGroup group={s} />
            ) : isRow(s) ? (
              <Row row={s} />
            ) : isValidElement(s) ? (
              s
            ) : i === 0 ? (
              <div className="px-3.5 pt-3 pb-2 text-sm font-semibold text-background">
                {s}
              </div>
            ) : (
              <div className="px-3.5 py-2.5 text-xs text-background/50">
                {s}
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

type CustomTooltipContentProps = TooltipContentProps<
  number | string,
  string
> & {
  sections: (point: Point) => TooltipSection[];
};

const TooltipContent = memo(
  function TooltipContent({
    active,
    payload,
    label,
    sections,
  }: CustomTooltipContentProps) {
    if (!active || !payload?.length || label == null) return null;

    const point: Point = {
      label: label as number | string,
      date: new Date(Number(label)).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
      get: (key) => {
        const entry = key ? payload.find((p) => p.dataKey === key) : payload[0];
        return Number(entry?.value) || 0;
      },
      raw: (key) => {
        const row = payload[0]?.payload as Record<string, unknown> | undefined;
        return Number(row?.[key]) || 0;
      },
      revenue:
        (payload[0]?.payload as { revenue?: RevenueSplit } | undefined)
          ?.revenue ?? NO_REVENUE,
    };

    const items = sections(point).filter(
      (s) => s !== null && s !== undefined && s !== false,
    );
    if (!items.length) return null;

    return <AnalyticsTooltipCard sections={items} />;
  },
  (prevProps, nextProps) => {
    return (
      prevProps.active === nextProps.active &&
      prevProps.label === nextProps.label &&
      prevProps.sections === nextProps.sections
    );
  },
);

interface AnalyticsTooltipProps {
  sections: (point: Point) => TooltipSection[];
}

export const AnalyticsTooltip = memo(function AnalyticsTooltip({
  sections,
}: AnalyticsTooltipProps) {
  return (
    <Tooltip
      animationDuration={500}
      animationEasing="ease-out"
      offset={50}
      content={(props) => <TooltipContent {...props} sections={sections} />}
    />
  );
});

export function FloatingTooltipPortal({
  sections,
  className,
}: {
  sections: TooltipSection[] | null;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sections || sections.length === 0) return;

    const el = containerRef.current;
    if (!el) return;

    const updatePosition = (clientX: number, clientY: number) => {
      const w = el.offsetWidth || 230;
      const h = el.offsetHeight || 130;
      const left =
        clientX + w + 24 > window.innerWidth
          ? Math.max(12, clientX - w - 14)
          : clientX + 14;
      const top =
        clientY + h + 24 > window.innerHeight
          ? Math.max(12, clientY - h - 14)
          : clientY + 14;

      el.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      el.style.opacity = "1";
    };

    const handlePointerMove = (e: PointerEvent) => {
      updatePosition(e.clientX, e.clientY);
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [sections]);

  if (typeof document === "undefined" || !sections || !sections.length)
    return null;

  return createPortal(
    <div
      ref={containerRef}
      className="pointer-events-none fixed top-0 left-0 z-50 opacity-0 transition-opacity duration-150 ease-out"
      style={{ transform: "translate3d(-9999px, -9999px, 0)" }}
    >
      <AnalyticsTooltipCard sections={sections} className={className} />
    </div>,
    document.body,
  );
}
