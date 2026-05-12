"use client";

import * as React from "react";
import Eyebrow from "./Eyebrow";

// Form field with eyebrow label + optional "edited" accent rail.
// `edited` shows a 1px primary rail on the left, the only place accent appears.
export default function Field({
  label,
  hint,
  edited,
  children,
}: {
  label: string;
  hint?: string;
  edited?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <Eyebrow tone={edited ? "accent" : "muted"}>{label}</Eyebrow>
        {hint && (
          <span className="font-mono text-[10px] tracking-[0.04em] text-foreground/40">
            {hint}
          </span>
        )}
      </div>
      <div
        className={[
          "relative",
          edited
            ? "before:absolute before:-left-3 before:top-1 before:bottom-1 before:w-px before:bg-primary"
            : "",
        ].join(" ")}
      >
        {children}
      </div>
    </label>
  );
}
