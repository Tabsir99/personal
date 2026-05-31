import { Fragment, type ReactNode } from "react";

// Inline highlighting for CMS-authored copy. Wrap a phrase in ::double colons::
// to render it in the accent color:
//
//   "Built a ::custom scheduler:: from scratch."
//
// Single colons pass through untouched (times like 00:42, ratios like 50/req,
// versions like v25.0), so authors only opt in with the doubled marker.
const ACCENT_RE = /::(.+?)::/g;

// Low-level split into plain / accented segments. Use when the caller needs its
// own per-segment rendering (e.g. the About section's per-word stagger).
export function splitAccent(text: string): { text: string; accent: boolean }[] {
  return text
    .split(ACCENT_RE)
    .map((part, i) => ({ text: part, accent: i % 2 === 1 }))
    .filter((seg) => seg.text !== "");
}

export function RichText({
  text,
  className = "text-accent",
}: {
  text: string;
  className?: string;
}): ReactNode {
  if (!text.includes("::")) return text;

  return splitAccent(text).map((seg, i) =>
    seg.accent ? (
      <span key={i} className={className}>
        {seg.text}
      </span>
    ) : (
      <Fragment key={i}>{seg.text}</Fragment>
    ),
  );
}
