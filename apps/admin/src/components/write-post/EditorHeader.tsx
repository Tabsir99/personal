"use client";
import { Eye, Settings, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/Kbd";
import { StatusDot } from "@/components/ui/StatusDot";

export default function EditorHeader({
  saveStatus,
  onPreview,
  onSettings,
  onPublish,
}: {
  saveStatus: "saved" | "saving" | "idle";
  onPreview: () => void;
  onSettings: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="sticky -top-6 z-10 flex h-14 w-full items-center justify-between border-b border-foreground/6 bg-background/85 px-6 backdrop-blur-md">
      <div className="relative h-5 w-28" aria-live="polite">
        <div
          className={cn(
            "absolute inset-0 flex items-center gap-1.5 transition-opacity duration-200",
            saveStatus === "saving" ? "opacity-100" : "opacity-0",
          )}
        >
          <StatusDot tone="warning" size="sm" breathing />
          <span className="text-sm text-muted-foreground">Saving…</span>
        </div>
        <div
          className={cn(
            "absolute inset-0 flex items-center gap-1.5 transition-opacity duration-200",
            saveStatus === "saved" ? "opacity-100" : "opacity-0",
          )}
        >
          <StatusDot tone="success" size="sm" />
          <span className="text-sm text-muted-foreground">Saved</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPreview}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
          <Kbd size="sm" className="ml-1">
            ⌘P
          </Kbd>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettings}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-3.5 w-3.5" />
          Settings
          <Kbd size="sm" className="ml-1">
            ⌘,
          </Kbd>
        </Button>
        <Button size="sm" onClick={onPublish} className="ml-1 gap-1.5">
          <Send className="h-3.5 w-3.5" />
          Publish
          <Kbd size="sm" className="ml-1 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
            ⌘⏎
          </Kbd>
        </Button>
      </div>
    </div>
  );
}
