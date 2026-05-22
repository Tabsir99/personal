import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type HeadingBase = HTMLAttributes<HTMLElement>;

type H1Size = "post" | "page";

export const H1 = ({
  size = "post",
  className,
  ...props
}: HeadingBase & { size?: H1Size }) => (
  <h1
    {...props}
    className={cn(
      "m-0 font-serif italic text-cream text-balance",
      size === "page"
        ? "leading-[0.85] tracking-[-0.055em] text-[clamp(80px,12vw,200px)]"
        : "leading-[0.95] tracking-[-0.035em] text-[clamp(40px,6vw,80px)]",
      className,
    )}
  />
);

type H2Variant = "section" | "editorial";

export const H2 = ({
  variant = "section",
  className,
  ...props
}: HeadingBase & { variant?: H2Variant }) => (
  <h2
    {...props}
    className={cn(
      variant === "editorial"
        ? "m-0 font-serif italic text-[clamp(28px,3vw,40px)] leading-[1.05] tracking-tight"
        : "h-serif text-[clamp(2.5rem,7vw,5rem)] leading-[0.88] tracking-tight",
      "em-accent",
      className,
    )}
  />
);

type H3Variant = "column" | "widget" | "serif" | "editorial";

const H3_CLASSES: Record<H3Variant, string> = {
  column: "font-mono text-xs tracking-widest uppercase text-muted mb-2",
  widget: "font-mono text-xs text-muted tracking-wider m-0",
  serif: "h-serif text-3xl leading-[1.1]",
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
