// EditorHeader.tsx
"use client";
import { CheckCircle2, Cloud, Eye, Settings, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    <div className="sticky h-14 w-full -top-6 z-10 flex items-center justify-between px-6 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="relative w-24 h-6">
        {/* Saving */}
        <div
          className={cn(
            "absolute inset-0 flex items-center gap-1.5 text-xs font-medium transition-opacity duration-300 text-amber-500 dark:text-amber-400",
            saveStatus === "saving" ? "opacity-100" : "opacity-0",
          )}
        >
          <Cloud className="w-3.5 h-3.5 animate-pulse shrink-0" />
          <span>Saving...</span>
        </div>

        {/* Saved */}
        <div
          className={cn(
            "absolute inset-0 flex items-center gap-1.5 text-xs font-medium transition-opacity duration-300 text-emerald-500 dark:text-emerald-400",
            saveStatus === "saved" ? "opacity-100" : "opacity-0",
          )}
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Saved</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPreview}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Eye className="w-4 h-4" />
          Preview
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettings}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
        <Button size="sm" onClick={onPublish} className="gap-1.5">
          <Send className="w-4 h-4" />
          Publish
        </Button>
      </div>
    </div>
  );
}
