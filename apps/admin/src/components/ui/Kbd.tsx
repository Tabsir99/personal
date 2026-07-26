import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const kbdVariants = cva(
  "inline-flex items-center justify-center border border-border/80 bg-card font-mono font-medium whitespace-nowrap text-foreground transition-shadow select-none",
  {
    variants: {
      size: {
        sm: "h-5 min-w-5 rounded-sm px-1 text-xs tracking-tight",
        md: "h-5 min-w-5 rounded-sm px-1.5 text-xs tracking-tight",
      },
      tone: {
        default: "shadow-kbd-rest",
        pressed: "translate-y-[0.5px] shadow-kbd-press",
      },
    },
    defaultVariants: {
      size: "sm",
      tone: "default",
    },
  },
);

interface KbdProps
  extends
    Omit<React.ComponentProps<"kbd">, "children">,
    VariantProps<typeof kbdVariants> {
  children: React.ReactNode;
  pressed?: boolean;
}

function Kbd({ className, size, pressed, children, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      data-pressed={pressed || undefined}
      className={cn(
        kbdVariants({ size, tone: pressed ? "pressed" : "default" }),
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}

export { Kbd, kbdVariants };
export type { KbdProps };
