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
  const didInit = React.useRef(false);
  if (!didInit.current) {
    didInit.current = true;
    if (!useSiteConfigStore.getState().hydrated) {
      useSiteConfigStore.getState().hydrate(initial);
    }
  }

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
      <div className="animate-in fade-in slide-in-from-bottom-1 duration-400 ease-out">
        <EditorChrome />
      </div>
      <div className="mt-8 space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out [animation-delay:60ms] fill-mode-[both]">
          <BlogLandingPanel />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out [animation-delay:140ms] fill-mode-[both]">
          <NowReadingPanel />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out [animation-delay:220ms] fill-mode-[both]">
          <CurrentlyBuildingPanel />
        </div>
      </div>
      <SaveBar />
    </div>
  );
}
