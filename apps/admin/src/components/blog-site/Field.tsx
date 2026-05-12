"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";

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
    <div className="block">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <Label className={edited ? "text-primary" : undefined}>{label}</Label>
        {hint && (
          <span className="text-[10px] tabular-nums text-foreground/40">
            {hint}
          </span>
        )}
      </div>
      <div className="relative">
        <span
          aria-hidden
          className={[
            "pointer-events-none absolute -left-3 top-1 bottom-1 w-px bg-primary transition-opacity duration-200 ease-out",
            edited ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
        {children}
      </div>
    </div>
  );
}
