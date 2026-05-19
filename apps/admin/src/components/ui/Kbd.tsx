import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const kbdVariants = cva(
  "inline-flex items-center justify-center font-mono font-medium select-none whitespace-nowrap border border-border/80 bg-card text-foreground transition-shadow",
  {
    variants: {
      size: {
        sm: "h-5 min-w-5 rounded-sm px-1 text-eyebrow tracking-tight",
        md: "h-5 min-w-5 rounded-sm px-1.5 text-kbd tracking-tight",
      },
      tone: {
        default: "shadow-kbd-rest",
        pressed: "shadow-kbd-press translate-y-[0.5px]",
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
