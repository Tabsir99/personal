import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type HeadingBase = HTMLAttributes<HTMLElement>;

export const H2 = ({ className, ...props }: HeadingBase) => (
  <h2
    {...props}
    className={cn(
      "h-serif text-[clamp(3rem,7vw,5rem)] leading-[0.88] tracking-tight",
      "em-accent",
      className,
    )}
  />
);

type H3Variant = "column" | "widget" | "serif" | "editorial";

const H3_CLASSES: Record<H3Variant, string> = {
  column: "font-mono text-xs tracking-widest uppercase text-muted mb-2",
  widget: "font-mono text-xs text-muted tracking-wider m-0",
  serif: "h-serif text-3xl max-lg:text-2xl leading-[1.1]",
  editorial:
    "m-0 font-serif italic text-[clamp(28px,3.5vw,46px)] leading-[1.04] tracking-tight",
};

export const H3 = ({
  variant = "column",
  className,
  ...props
}: HeadingBase & { variant?: H3Variant }) => (
  <h3 {...props} className={cn(H3_CLASSES[variant], className)} />
);
