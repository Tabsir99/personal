"use client";

import { useShallow } from "zustand/react/shallow";

import { useSiteConfigStore } from "@/stores/SiteConfigStore";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatusDot } from "@/components/ui/StatusDot";
import { Kbd } from "@/components/ui/Kbd";

export default function EditorChrome() {
  const { isDirty, saving } = useSiteConfigStore(
    useShallow((s) => ({ isDirty: s.isDirty, saving: s.saving })),
  );

  const status = saving ? "saving" : isDirty ? "unsaved" : "clean";
  const isActive = status === "saving" || status === "unsaved";

  return (
    <header className="border-b border-foreground/[0.06] pb-6">
      <div className="flex items-center justify-between gap-6">
        <Eyebrow tone="foreground" size="sm" family="mono">
          Blog site · settings
        </Eyebrow>
        <div className="flex items-center gap-2" aria-live="polite">
          <StatusDot tone={isActive ? "primary" : "muted"} size="sm" />
          <Eyebrow tone="foreground" size="sm" family="mono">
            {status === "saving"
              ? "Saving"
              : status === "unsaved"
                ? "Unsaved"
                : "Synced"}
          </Eyebrow>
        </div>
      </div>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        What lives on <span className="italic">/blog</span>
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Hero copy, the “now reading” sticker, and what you’re currently
        building. The portfolio fetches this each render — press{" "}
        <Kbd size="sm">⌘S</Kbd> to save and the public site picks it up on the
        next visit.
      </p>
    </header>
  );
}
