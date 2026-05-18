import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statusDotVariants = cva("inline-block shrink-0 rounded-full", {
  variants: {
    tone: {
      muted: "bg-muted-foreground/40",
      primary: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      destructive: "bg-destructive",
    },
    size: {
      xs: "h-1 w-1",
      sm: "h-1.5 w-1.5",
      md: "h-2 w-2",
    },
  },
  defaultVariants: {
    tone: "muted",
    size: "sm",
  },
});

interface StatusDotProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof statusDotVariants> {
  breathing?: boolean;
}

function StatusDot({
  className,
  tone,
  size,
  breathing,
  ...props
}: StatusDotProps) {
  return (
    <span
      data-slot="status-dot"
      data-tone={tone || undefined}
      aria-hidden="true"
      className={cn(
        statusDotVariants({ tone, size }),
        breathing && "animate-breathe",
        className,
      )}
      {...props}
    />
  );
}

export { StatusDot, statusDotVariants };
export type { StatusDotProps };
