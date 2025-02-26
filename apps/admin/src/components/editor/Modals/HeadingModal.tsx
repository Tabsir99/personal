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
import { ChevronDown, Check } from "lucide-react";

export default function HeadingModal({ editor }: { editor: Editor }) {
  const [isOpen, setIsOpen] = useState(false);

  const headingLevels = [
    { level: 1, label: "Heading 1", className: "text-2xl font-semibold" },
    { level: 2, label: "Heading 2", className: "text-xl font-semibold" },
    { level: 3, label: "Heading 3", className: "text-lg font-semibold" },
    { level: 4, label: "Heading 4", className: "text-base font-semibold" },
    { level: 0, label: "Normal Text", className: "text-[18px]" },
  ];

  // Check which heading level is currently active
  const activeLevel = headingLevels.find(({ level }) =>
    editor.isActive("heading", { level })
  )?.level;

  const isParagraphActive = !headingLevels.some(({ level }) =>
    editor.isActive("heading", { level })
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-between w-32 px-3 py-2 rounded-md text-zinc-100 hover:bg-zinc-800 transition-all duration-200",
            isOpen && "ring-1 ring-zinc-800"
          )}
        >
          <span className="text-sm font-medium">
            {activeLevel ? `Heading ${activeLevel}` : "Normal text"}
          </span>
          <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-0 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl"
        align="start"
        sideOffset={5}
      >
        <div>
          {headingLevels.map(({ level, label, className }) => (
            <button
              key={level}
              className={cn(
                "w-full flex items-center justify-center gap-3 px-8 text-left py-5 transition-colors",
                level === 0 || "border-b border-zinc-700/60",
                className,
                "text-zinc-200 hover:bg-zinc-800/70",
                editor.isActive("heading", { level }) &&
                  "bg-zinc-800 text-white"
              )}
              onClick={() => {
                if (level === 0) {
                  editor.chain().focus().setParagraph().run();
                  return;
                }
                editor
                  .chain()
                  .focus()
                  .toggleHeading({ level: level as Level })
                  .run();
                setIsOpen(false);
              }}
            >
              <span className="flex-1">{label}</span>
              {editor.isActive("heading", { level }) && (
                <Check className="h-4 w-4 text-blue-400" />
              )}
              {level === 0 && isParagraphActive && (
                <Check className="h-4 w-4 text-blue-400" />
              )}
            </button>
          ))}
        </div>

        <div className="px-8 py-4 text-xs text-zinc-400 border-t border-zinc-700/60">
          <span className="text-zinc-500">Shortcut:</span> Ctrl+Alt+0-6
        </div>
      </PopoverContent>
    </Popover>
  );
}
