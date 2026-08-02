import { Fragment, type ReactNode } from "react";

// ::double colons:: render in the accent color. Single colons pass through, so
// times and versions are untouched and authors opt in with the doubled marker.
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
