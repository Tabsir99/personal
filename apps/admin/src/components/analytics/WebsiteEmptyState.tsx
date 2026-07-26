"use client";

import { Pulse, Globe, Code, ChartLineUp } from "@phosphor-icons/react";
import { Button } from "premium-ds/button";

export function WebsiteEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-16">
      <div className="relative flex flex-col items-center gap-6">
        {/* Enriched glowing icon representing a live ping */}
        <div className="relative flex size-20 items-center justify-center rounded-2xl border border-border bg-card shadow-card-rest transition-shadow duration-300 hover:shadow-card-hover">
          <Pulse
            size={40}
            weight="duotone"
            className="animate-pulse text-primary"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-6 animate-breathe rounded-full border border-dashed border-primary/20"
          />
        </div>

        <div className="max-w-sm text-center">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Track your first website
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Get real-time insights in three simple steps.
          </p>
        </div>

        {/* Step-by-step flowchart visual */}
        <div className="mt-8 flex w-full max-w-2xl flex-col items-stretch justify-between gap-6 md:flex-row md:gap-4">
          {/* Step 1: Register */}
          <div className="group relative flex w-full flex-1 flex-col items-center rounded-xl border border-border bg-card/50 p-5 text-center transition-all duration-300 hover:border-primary/20 hover:bg-card">
            <div className="relative mb-3 flex size-12 items-center justify-center rounded-xl border border-border bg-secondary/50 transition-colors duration-300 group-hover:border-primary/20 group-hover:bg-primary/5">
              <Globe
                size={24}
                weight="duotone"
                className="text-muted-foreground transition-colors duration-300 group-hover:text-primary"
              />
              <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
                1
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Add website
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Register your domain in the dashboard
            </p>
          </div>

          {/* Flow Connector 1 */}
          <div className="hidden items-start pt-11 text-muted-foreground/30 md:flex">
            <div className="w-6 border-t border-dashed border-border" />
          </div>

          {/* Step 2: Install */}
          <div className="group relative flex w-full flex-1 flex-col items-center rounded-xl border border-border bg-card/50 p-5 text-center transition-all duration-300 hover:border-primary/20 hover:bg-card">
            <div className="relative mb-3 flex size-12 items-center justify-center rounded-xl border border-border bg-secondary/50 transition-colors duration-300 group-hover:border-primary/20 group-hover:bg-primary/5">
              <Code
                size={24}
                weight="duotone"
                className="text-muted-foreground transition-colors duration-300 group-hover:text-primary"
              />
              <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
                2
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Install script
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Add the snippet to your website HTML
            </p>
          </div>

          {/* Flow Connector 2 */}
          <div className="hidden items-start pt-11 text-muted-foreground/30 md:flex">
            <div className="w-6 border-t border-dashed border-border" />
          </div>

          {/* Step 3: Go Live */}
          <div className="group relative flex w-full flex-1 flex-col items-center rounded-xl border border-border bg-card/50 p-5 text-center transition-all duration-300 hover:border-primary/20 hover:bg-card">
            <div className="relative mb-3 flex size-12 items-center justify-center rounded-xl border border-border bg-secondary/50 transition-colors duration-300 group-hover:border-primary/20 group-hover:bg-primary/5">
              <ChartLineUp
                size={24}
                weight="duotone"
                className="text-muted-foreground transition-colors duration-300 group-hover:text-primary"
              />
              <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
                3
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              See analytics
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Boom! Watch real-time events stream in
            </p>
          </div>
        </div>

        <Button onClick={onAdd} size="md" className="mt-6">
          Add website
        </Button>

        <p className="text-xs text-muted-foreground/60">
          Takes under a minute to set up
        </p>
      </div>
    </div>
  );
}
