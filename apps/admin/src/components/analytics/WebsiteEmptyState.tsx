"use client";

import { Pulse } from "@phosphor-icons/react";
import { Button } from "premium-ds/button";

export function WebsiteEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6">
      <div className="relative flex flex-col items-center gap-5">
        {/* Decorative rings */}
        <div
          aria-hidden="true"
          className="absolute -inset-12 rounded-full border border-dashed border-foreground/4"
        />
        <div
          aria-hidden="true"
          className="absolute -inset-24 rounded-full border border-dashed border-foreground/2"
        />

        <div
          aria-hidden="true"
          className="relative flex size-14 items-center justify-center rounded-2xl border border-foreground/8 bg-linear-to-b from-foreground/3 to-transparent shadow-sm"
        >
          <Pulse size={24} weight="duotone" className="text-foreground/50" />
        </div>

        <div className="text-center">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            No websites tracked yet
          </h2>
          <p className="mt-1.5 max-w-[280px] text-sm leading-relaxed text-muted-foreground">
            Add a site and drop one script tag into your HTML. Data starts
            showing up as soon as the first visitor lands.
          </p>
        </div>

        <Button onClick={onAdd} size="sm" className="mt-1">
          Add website
        </Button>

        <p className="text-[12px] text-muted-foreground/60">
          Takes under a minute to set up
        </p>
      </div>
    </div>
  );
}
