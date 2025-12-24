"use client";
import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { Level } from "@tiptap/extension-heading";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Type } from "lucide-react";

export default function HeadingModal({ editor }: { editor: Editor | null }) {
  const [isOpen, setIsOpen] = useState(false);

  const headingLevels = [
    { level: 1, label: "Heading 1", className: "text-2xl font-bold", shortcut: "⌘⌥1" },
    { level: 2, label: "Heading 2", className: "text-xl font-semibold", shortcut: "⌘⌥2" },
    { level: 3, label: "Heading 3", className: "text-lg font-semibold", shortcut: "⌘⌥3" },
    { level: 4, label: "Heading 4", className: "text-base font-medium", shortcut: "⌘⌥4" },
    { level: 0, label: "Normal Text", className: "text-sm font-normal", shortcut: "⌘⌥0" },
  ];

  // Check which heading level is currently active
  const activeLevel = headingLevels.find(({ level }) =>
    editor?.isActive("heading", { level })
  )?.level;

  const isParagraphActive = !headingLevels.some(({ level }) =>
    editor?.isActive("heading", { level })
  );

  const activeLabel = activeLevel 
    ? headingLevels.find(h => h.level === activeLevel)?.label 
    : "Normal Text";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
            "text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700",
            isOpen && "bg-zinc-800/70 text-zinc-100"
          )}
        >
          <Type className="h-3.5 w-3.5" />
          <span>{activeLabel}</span>
          <ChevronDown className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-72 p-1.5 bg-zinc-900 border-zinc-800"
        align="start"
        sideOffset={8}
      >
        <div className="space-y-0.5">
          {headingLevels.map(({ level, label, className, shortcut }) => {
            const isActive = level === 0 
              ? isParagraphActive 
              : editor?.isActive("heading", { level });

            return (
              <button
                key={level}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md transition-colors group",
                  "hover:bg-zinc-800/70",
                  isActive && "bg-zinc-800 text-zinc-100"
                )}
                onClick={() => {
                  if (level === 0) {
                    editor?.chain().focus().setParagraph().run();
                  } else {
                    editor
                      ?.chain()
                      .focus()
                      .toggleHeading({ level: level as Level })
                      .run();
                  }
                  setIsOpen(false);
                }}
              >
                <span className={cn(
                  className,
                  "text-zinc-300 group-hover:text-zinc-100 transition-colors",
                  isActive && "text-zinc-100"
                )}>
                  {label}
                </span>
                
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {shortcut}
                  </span>
                  {isActive && (
                    <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-blue-400" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-1.5 pt-1.5 border-t border-zinc-800">
          <div className="px-3 py-2 text-[11px] text-zinc-500 flex items-center gap-1.5">
            <div className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>Use keyboard shortcuts for quick formatting</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}