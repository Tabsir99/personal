"use client";

import { useShallow } from "zustand/react/shallow";
import { useSiteConfigStore } from "@/stores/SiteConfigStore";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SaveBar() {
  const { isDirty, saving } = useSiteConfigStore(
    useShallow((s) => ({ isDirty: s.isDirty, saving: s.saving })),
  );

  if (!isDirty && !saving) return null;
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-40 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out">
      <div
        className="pointer-events-auto flex items-center gap-4 rounded-full border border-foreground/[0.08] bg-card/95 px-4 py-2.5 backdrop-blur"
        style={{
          boxShadow:
            "0 1px 2px 0 rgb(0 0 0 / 0.08), 0 16px 48px -20px rgb(0 0 0 / 0.24)",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary"
            style={{ animation: "blogSitePulse 2.4s ease-in-out infinite" }}
            aria-hidden
          />
          <Label>{saving ? "Saving" : "Unsaved changes"}</Label>
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
          className="rounded-full bg-foreground text-background hover:bg-foreground/90"
          style={{
            boxShadow:
              "inset 0 1px 0 0 rgb(255 255 255 / 0.04), 0 1px 2px 0 rgb(0 0 0 / 0.16)",
          }}
        >
          <span>{saving ? "Saving…" : "Save changes"}</span>
          <kbd
            className="inline-flex h-[18px] items-center rounded-[4px] bg-background/15 px-1.5 text-[10px] font-semibold text-background/80"
            style={{
              boxShadow:
                "inset 0 -1px 0 0 rgb(0 0 0 / 0.25), 0 1px 0 0 rgb(255 255 255 / 0.04)",
            }}
          >
            ⌘S
          </kbd>
        </Button>
      </div>

      <style jsx global>{`
        @keyframes blogSitePulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.95; }
        }
      `}</style>
    </div>
  );
}
