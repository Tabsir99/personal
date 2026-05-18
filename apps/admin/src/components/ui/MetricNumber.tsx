import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const metricNumberVariants = cva(
  "inline-flex items-baseline gap-1 font-mono tabular-nums tracking-tight text-foreground",
  {
    variants: {
      size: {
        sm: "text-base font-medium",
        md: "text-lg font-semibold",
        lg: "text-2xl font-semibold",
        xl: "text-3xl font-semibold",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  },
);

type DeltaTone = "success" | "destructive" | "muted";

interface MetricNumberProps
  extends Omit<React.ComponentProps<"span">, "children">,
    VariantProps<typeof metricNumberVariants> {
  value: React.ReactNode;
  unit?: React.ReactNode;
  delta?: React.ReactNode;
  deltaTone?: DeltaTone;
}

const deltaToneClass: Record<DeltaTone, string> = {
  success: "text-success",
  destructive: "text-destructive",
  muted: "text-muted-foreground",
};

function MetricNumber({
  className,
  size,
  value,
  unit,
  delta,
  deltaTone = "muted",
  ...props
}: MetricNumberProps) {
  return (
    <span
      data-slot="metric-number"
      className={cn(metricNumberVariants({ size }), className)}
      {...props}
    >
      <span data-slot="metric-value">{value}</span>
      {unit && (
        <span
          data-slot="metric-unit"
          className="font-sans text-sm font-medium text-muted-foreground"
        >
          {unit}
        </span>
      )}
      {delta && (
        <span
          data-slot="metric-delta"
          data-tone={deltaTone}
          className={cn(
            "ml-1 font-sans text-kbd font-medium tabular-nums",
            deltaToneClass[deltaTone],
          )}
        >
          {delta}
        </span>
      )}
    </span>
  );
}

export { MetricNumber, metricNumberVariants };
export type { MetricNumberProps };
