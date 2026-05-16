import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const eyebrowVariants = cva(
  "inline-flex items-center font-medium uppercase whitespace-nowrap leading-none",
  {
    variants: {
      tone: {
        muted: "text-muted-foreground",
        foreground: "text-foreground",
        primary: "text-primary",
        success: "text-success",
        warning: "text-warning",
        destructive: "text-destructive",
      },
      size: {
        xs: "text-[10px] tracking-[0.16em]",
        sm: "text-[11px] tracking-[0.14em]",
      },
      family: {
        sans: "font-sans",
        mono: "font-mono",
      },
    },
    defaultVariants: {
      tone: "muted",
      size: "xs",
      family: "sans",
    },
  },
);

interface EyebrowProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof eyebrowVariants> {}

function Eyebrow({ className, tone, size, family, ...props }: EyebrowProps) {
  return (
    <span
      data-slot="eyebrow"
      className={cn(eyebrowVariants({ tone, size, family }), className)}
      {...props}
    />
  );
}

export { Eyebrow, eyebrowVariants };
export type { EyebrowProps };
