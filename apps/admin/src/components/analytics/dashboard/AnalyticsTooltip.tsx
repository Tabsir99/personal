"use client";

import { Fragment, isValidElement, type ReactNode } from "react";
import { Tooltip } from "recharts";
import { CHART, type ChartColors } from "./chartTheme";

interface Point {
  label: number | string;
  date: string;
  get: (key?: string) => number;
}

type Row = { label: ReactNode; value: ReactNode; color?: ChartColors };
type Section = Row | ReactNode;

function isRow(s: Section): s is Row {
  return (
    typeof s === "object" &&
    s !== null &&
    !isValidElement(s) &&
    "label" in s &&
    "value" in s
  );
}

export function AnalyticsTooltip({
  sections,
}: {
  sections: (point: Point) => Section[];
}) {
  return (
    <Tooltip
      animationDuration={200}
      animationEasing="linear"
      content={({ active, payload, label }) => {
        if (!active || !payload?.length) return null;

        const point: Point = {
          label: label as number | string,
          date: new Date(Number(label)).toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          get: (key) => {
            const entry = key
              ? payload.find((p) => p.dataKey === key)
              : payload[0];
            return Number(entry?.value) || 0;
          },
        };

        const items = sections(point).filter(
          (s) => s !== null && s !== undefined && s !== false,
        );
        if (!items.length) return null;

        return (
          <div className="min-w-44 overflow-hidden rounded-xl border border-border bg-popover shadow-card-hover">
            {items.map((s, i) => (
              <Fragment key={i}>
                {i > 0 && <div className="h-px bg-border/60" />}
                <div className="px-3.5 py-2.5">
                  {isRow(s) ? (
                    <div className="flex items-center justify-between gap-8">
                      <span className="flex items-center gap-2">
                        {s.color && (
                          <span
                            className="size-3 shrink-0 rounded-sm"
                            style={{ background: CHART[s.color] }}
                          />
                        )}
                        <span className="text-sm text-foreground/70">
                          {s.label}
                        </span>
                      </span>
                      <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                        {s.value}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">{s}</div>
                  )}
                </div>
              </Fragment>
            ))}
          </div>
        );
      }}
    />
  );
}
