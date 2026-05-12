"use client";

import { useShallow } from "zustand/react/shallow";
import { useSiteConfigStore } from "@/stores/SiteConfigStore";

export default function EditorChrome() {
  const { isDirty, saving } = useSiteConfigStore(
    useShallow((s) => ({ isDirty: s.isDirty, saving: s.saving })),
  );

  const status = saving ? "saving" : isDirty ? "unsaved" : "clean";

  return (
    <header className="border-b border-foreground/[0.06] pb-6">
      <div className="flex items-baseline justify-between gap-6">
        <span
          className="font-mono text-xs font-semibold uppercase text-foreground/80"
          style={{ letterSpacing: "0.2em" }}
        >
          Blog site · settings
        </span>
        <div className="flex items-center gap-2">
          <span
            className={[
              "h-1.5 w-1.5 rounded-full transition-colors",
              status === "saving" || status === "unsaved"
                ? "bg-primary"
                : "bg-foreground/20",
            ].join(" ")}
            aria-hidden
          />
          <span
            className="font-mono text-xs font-semibold uppercase text-foreground/80"
            style={{ letterSpacing: "0.18em" }}
            aria-live="polite"
          >
            {status === "saving"
              ? "Saving"
              : status === "unsaved"
                ? "Unsaved"
                : "Synced"}
          </span>
        </div>
      </div>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        What lives on <span className="italic">/blog</span>
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Hero copy, the “now reading” sticker, and what you’re currently
        building. The portfolio fetches this each render — press ⌘S to save and
        the public site picks it up on the next visit.
      </p>
    </header>
  );
}
