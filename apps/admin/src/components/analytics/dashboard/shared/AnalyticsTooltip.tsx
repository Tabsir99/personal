"use client";

import { Fragment, isValidElement, memo, type ReactNode } from "react";
import { Tooltip, type TooltipContentProps } from "recharts";
import { CHART, type ChartColors } from "./chartTheme";
import { cn } from "@/lib/utils";

export interface Point {
  label: number | string;
  date: string;
  get: (key?: string) => number;
  raw: (key: string) => number;
}

export type TooltipRow = {
  label: ReactNode;
  value: ReactNode;
  color?: ChartColors;
  dim?: boolean;
};

export type TooltipMeterSegment = {
  value: number;
  color: ChartColors;
  label: string;
};
export type TooltipMeter = { meter: TooltipMeterSegment[] };

export type TooltipSection = TooltipRow | TooltipMeter | ReactNode;

function isRow(s: TooltipSection): s is TooltipRow {
  return (
    typeof s === "object" &&
    s !== null &&
    !isValidElement(s) &&
    "label" in s &&
    "value" in s
  );
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
      <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
        {segments.map((s, i) => (
          <span
            key={i}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${(s.value / total) * 100}%`,
              background: CHART[s.color],
            }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-background/55">
        {segments.map((s, i) => (
          <span key={i}>{s.label}</span>
        ))}
      </div>
    </div>
  );
}

export function Row({ row }: { row: TooltipRow }) {
  return (
    <div className="flex items-center justify-between gap-8 px-3.5 py-2.5">
      <span className="flex items-center gap-2">
        {row.color && (
          <span
            className="size-2.5 shrink-0 rounded-sm"
            style={{ background: CHART[row.color] }}
          />
        )}
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

export interface AnalyticsTooltipCardProps {
  sections: TooltipSection[];
  className?: string;
}

export function AnalyticsTooltipCard({
  sections,
  className,
}: AnalyticsTooltipCardProps) {
  return (
    <div
      className={cn(
        "min-w-52 overflow-hidden rounded-xl bg-foreground text-background shadow-card-hover",
        className,
      )}
    >
      {sections.map((s, i) => {
        const divider = i > 0 && !isMeter(s);
        return (
          <Fragment key={i}>
            {divider && <div className="h-px bg-background/10" />}
            {isMeter(s) ? (
              <MeterBar segments={s.meter} />
            ) : isRow(s) ? (
              <Row row={s} />
            ) : isValidElement(s) ? (
              s
            ) : i === 0 ? (
              <div className="px-3.5 pt-3 pb-2 text-sm font-semibold text-background">
                {s}
              </div>
            ) : (
              <div className="px-3.5 py-2.5 text-xs text-background/45">
                {s}
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

type CustomTooltipContentProps = TooltipContentProps<number | string, string> & {
  sections: (point: Point) => TooltipSection[];
};

const TooltipContent = memo(
  function TooltipContent({ active, payload, label, sections }: CustomTooltipContentProps) {
    if (!active || !payload?.length || label == null) return null;

    const point: Point = {
      label: label as number | string,
      date: new Date(Number(label)).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
      get: (key) => {
        const entry = key
          ? payload.find((p) => p.dataKey === key)
          : payload[0];
        return Number(entry?.value) || 0;
      },
      raw: (key) => {
        const row = payload[0]?.payload as
          Record<string, unknown> | undefined;
        return Number(row?.[key]) || 0;
      },
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

export const AnalyticsTooltip = memo(
  function AnalyticsTooltip({ sections }: AnalyticsTooltipProps) {
    return (
      <Tooltip
        animationDuration={500}
        animationEasing="ease-out"
        offset={50}
        content={(props) => <TooltipContent {...props} sections={sections} />}
      />
    );
  },
  () => true,
);

