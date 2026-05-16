"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Shared shell for recharts custom tooltips. Single source of truth for the
 * tooltip chrome (hairline border, card-rest shadow, backdrop blur). Each
 * chart used to ship its own copy of this pattern with tiny variations.
 */
export function ChartTooltipShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-foreground/[0.08] bg-card/95 px-3 py-2 text-xs shadow-card-rest backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface ChartTooltipRowProps {
  swatch?: string;
  name: React.ReactNode;
  value: React.ReactNode;
  suffix?: React.ReactNode;
}

export function ChartTooltipRow({
  swatch,
  name,
  value,
  suffix,
}: ChartTooltipRowProps) {
  return (
    <div className="flex items-center gap-2">
      {swatch && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: swatch }}
        />
      )}
      <span className="text-muted-foreground">{name}</span>
      <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
        {value}
      </span>
      {suffix && <span className="text-muted-foreground">{suffix}</span>}
    </div>
  );
}
