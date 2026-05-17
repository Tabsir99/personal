"use client";

import { useShallow } from "zustand/react/shallow";

import { useSiteConfigStore } from "@/stores/SiteConfigStore";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/Kbd";
import { StatusDot } from "@/components/ui/StatusDot";

export default function SaveBar() {
  const { isDirty, saving } = useSiteConfigStore(
    useShallow((s) => ({ isDirty: s.isDirty, saving: s.saving })),
  );

  if (!isDirty && !saving) return null;
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-40 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-foreground/8 bg-card/95 px-4 py-2 shadow-dialog backdrop-blur">
        <div className="flex items-center gap-2">
          <StatusDot tone="primary" size="sm" breathing />
          <span className="text-sm text-muted-foreground">
            {saving ? "Saving…" : "Unsaved changes"}
          </span>
        </div>

        <div className="h-4 w-px bg-foreground/10" aria-hidden />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => useSiteConfigStore.getState().reset()}
          disabled={saving}
          className="text-muted-foreground hover:text-foreground"
        >
          Discard
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={() => useSiteConfigStore.getState().save()}
          disabled={saving}
          className="gap-1.5 rounded-full bg-foreground text-background shadow-card-rest hover:bg-foreground/90"
        >
          <span>{saving ? "Saving…" : "Save changes"}</span>
          <Kbd
            size="sm"
            className="border-background/15 bg-background/15 text-background/80"
          >
            ⌘S
          </Kbd>
        </Button>
      </div>
    </div>
  );
}
