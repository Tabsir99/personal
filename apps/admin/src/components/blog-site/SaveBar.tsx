"use client";

import * as React from "react";
import Eyebrow from "./Eyebrow";

export default function SaveBar({
  isDirty,
  saving,
  onSave,
  onReset,
}: {
  isDirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  if (!isDirty && !saving) return null;
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
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
          <Eyebrow>{saving ? "Saving" : "Unsaved changes"}</Eyebrow>
        </div>

        <div className="h-4 w-px bg-foreground/10" aria-hidden />

        <button
          type="button"
          onClick={onReset}
          disabled={saving}
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        >
          Discard
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2.5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background transition-colors disabled:opacity-60"
          style={{
            boxShadow:
              "inset 0 1px 0 0 rgb(255 255 255 / 0.04), 0 1px 2px 0 rgb(0 0 0 / 0.16)",
          }}
        >
          <span>{saving ? "Saving…" : "Save changes"}</span>
          <Kbd>⌘S</Kbd>
        </button>
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

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="inline-flex h-[18px] items-center rounded-[4px] bg-background/15 px-1.5 font-mono text-[10px] font-semibold text-background/80"
      style={{
        letterSpacing: "-0.02em",
        boxShadow:
          "inset 0 -1px 0 0 rgb(0 0 0 / 0.25), 0 1px 0 0 rgb(255 255 255 / 0.04)",
      }}
    >
      {children}
    </kbd>
  );
}
