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
  React.useState(() => {
    if (!useSiteConfigStore.getState().hydrated) {
      useSiteConfigStore.getState().hydrate(initial);
    }
    return true;
  });

  const { isDirty, saving } = useSiteConfigStore(
    useShallow((s) => ({ isDirty: s.isDirty, saving: s.saving })),
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (isDirty && !saving) useSiteConfigStore.getState().save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDirty, saving]);

  return (
    <div className="mx-auto max-w-4xl pb-32">
      <div className="animate-in duration-400 ease-out fade-in slide-in-from-bottom-1">
        <EditorChrome />
      </div>
      <div className="mt-8 space-y-6">
        <div className="animate-in duration-500 ease-out fill-mode-[both] [animation-delay:60ms] fade-in slide-in-from-bottom-2">
          <BlogLandingPanel />
        </div>
        <div className="animate-in duration-500 ease-out fill-mode-[both] [animation-delay:140ms] fade-in slide-in-from-bottom-2">
          <NowReadingPanel />
        </div>
        <div className="animate-in duration-500 ease-out fill-mode-[both] [animation-delay:220ms] fade-in slide-in-from-bottom-2">
          <CurrentlyBuildingPanel />
        </div>
      </div>
      <SaveBar />
    </div>
  );
}
