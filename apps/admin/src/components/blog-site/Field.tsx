"use client";

import * as React from "react";

import { FieldLabel } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
        <FieldLabel
          className={edited ? "text-primary" : undefined}
        >
          {label}
        </FieldLabel>
        {hint && (
          <span className="font-mono text-eyebrow tabular-nums text-foreground/40">
            {hint}
          </span>
        )}
      </div>
      <div className="relative">
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -left-3 top-1 bottom-1 w-px bg-primary transition-opacity duration-160 ease-out",
            edited ? "opacity-100" : "opacity-0",
          )}
        />
        {children}
      </div>
    </div>
  );
}
