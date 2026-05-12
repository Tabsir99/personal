"use client";

import * as React from "react";
import type { SiteConfig } from "@tabsircg/schemas/site";
import { useShallow } from "zustand/react/shallow";
import { useSiteConfigStore } from "@/stores/SiteConfigStore";
import BlogLandingPanel from "./BlogLandingPanel";
import NowReadingPanel from "./NowReadingPanel";
import CurrentlyBuildingPanel from "./CurrentlyBuildingPanel";
import EditorChrome from "./EditorChrome";
import SaveBar from "./SaveBar";

export default function SiteConfigEditor({
  initial,
}: {
  initial: SiteConfig;
}) {
  // Hydrate synchronously before first paint so the form never flashes the
  // schema's zero-state defaults. useRef-gated so the call happens once per
  // mount and doesn't trigger a subscription dance.
  const didInit = React.useRef(false);
  if (!didInit.current) {
    didInit.current = true;
    if (!useSiteConfigStore.getState().hydrated) {
      useSiteConfigStore.getState().hydrate(initial);
    }
  }

  const [isDirty, saving] = useSiteConfigStore(
    useShallow((s) => [s.isDirty, s.saving]),
  );
  const save = useSiteConfigStore((s) => s.save);
  const reset = useSiteConfigStore((s) => s.reset);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (isDirty && !saving) save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDirty, saving, save]);

  return (
    <div className="mx-auto max-w-4xl pb-32">
      <EditorChrome />
      <div className="mt-8 space-y-6">
        <BlogLandingPanel />
        <NowReadingPanel />
        <CurrentlyBuildingPanel />
      </div>
      <SaveBar
        isDirty={isDirty}
        saving={saving}
        onSave={save}
        onReset={reset}
      />
    </div>
  );
}
