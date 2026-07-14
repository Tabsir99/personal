"use client";

import { useShallow } from "zustand/react/shallow";

import { useSiteConfigStore } from "@/stores/SiteConfigStore";
import { Button } from "premium-ds/button";
import { Kbd } from "@/components/ui/Kbd";
import { Badge } from "premium-ds/badge";
export default function SaveBar() {
  const { isDirty, saving } = useSiteConfigStore(
    useShallow((s) => ({ isDirty: s.isDirty, saving: s.saving })),
  );

  if (!isDirty && !saving) return null;
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-40 -translate-x-1/2 animate-in duration-200 ease-out fade-in slide-in-from-bottom-2">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-foreground/8 bg-card/95 px-4 py-2 shadow-dialog backdrop-blur">
        <div className="flex items-center gap-2">
          <Badge dot live tone="primary" />
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
        >
          Discard
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={() => useSiteConfigStore.getState().save()}
          loading={saving}
          variant="primary"
          iconRight={
            <Kbd
              size="sm"
              className="border-background/15 bg-background/15 text-background/80"
            >
              ⌘S
            </Kbd>
          }
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
