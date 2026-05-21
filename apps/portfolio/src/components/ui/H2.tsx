import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type HeadingBase = HTMLAttributes<HTMLElement>;

/* ============================================================
   H1 — page-level heading. Two opinionated sizes:

   - "post" (default): post-detail H1. clamp 40–80px, leading 0.95,
     tracking -0.035em. Use anywhere a post title needs to render.
   - "page": page-entry H1 (e.g., /blog). clamp 80–200px, leading 0.85,
     tracking -0.055em. Use sparingly — one per page entry.

   Both bake in: font-serif italic, text-cream, text-balance, m-0.
   Consumers should not need to touch typography utilities.
   ============================================================ */

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

/* ============================================================
   H2 — section heading. Two opinionated variants:

   - "section" (default): portfolio section heading. .h-serif at the
     big section size (clamp 2.5–5rem), leading 0.88, tracking-tight.
   - "editorial": blog section/card title. Serif italic, medium clamp
     (28–40px), leading 1.05, tracking-tight, m-0.

   Consumers rarely override; the few that do (Footer farewell title,
   services svc-title) pass a larger size + positioning via className.
   ============================================================ */

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

/* ============================================================
   H3 — sub-section / column / widget heading. Four opinionated
   variants, each tuned to a specific role:

   - "column" (default): footer-style column header. Mono uppercase
     widest tracking, muted color, mb-2. Pair with a list below.
   - "widget": sidebar widget head (// score, // share, etc.).
     Mono small with `tracking-wider`, no uppercase, m-0.
   - "serif": serif sub-heading at section level. .h-serif text-3xl
     leading-[1.1]. Used for services frame title and writing
     article-row titles (with size override on the latter).
   - "editorial": blog list/post-card title. Serif italic medium
     (clamp 28–46px), leading 1.04, tracking-tight, m-0.
   ============================================================ */

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
