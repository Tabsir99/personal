"use client";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const TextColorModal = ({
  activeTextColor,
  handleColorClick,
}: {
  activeTextColor: string;
  handleColorClick: (color: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Color palette optimized for dark zinc theme
  const colorPalette = {
    whites: [
      { name: "Pure White", value: "#FFFFFF" },
      { name: "Gray 200", value: "#E5E7EB" },
      { name: "Zinc 200", value: "#e4e4e7" },
      { name: "Zinc 300", value: "#d4d4d8" },
      { name: "Zinc 400", value: "#a1a1aa" },
    ],
    colors: [
      { name: "Blue", value: "#60a5fa" },
      { name: "Green", value: "#4ade80" },
      { name: "Yellow", value: "#facc15" },
      { name: "Red", value: "#f87171" },
      { name: "Purple", value: "#c084fc" },
    ],
    brights: [
      { name: "Sky", value: "#38bdf8" },
      { name: "Teal", value: "#2dd4bf" },
      { name: "Amber", value: "#fbbf24" },
      { name: "Rose", value: "#fb7185" },
      { name: "Indigo", value: "#818cf8" },
    ],
    muted: [
      { name: "Slate", value: "#94a3b8" },
      { name: "Emerald", value: "#34d399" },
      { name: "Orange", value: "#fb923c" },
      { name: "Pink", value: "#f472b6" },
      { name: "Violet", value: "#a78bfa" },
    ],
    dark: [
      { name: "Black", value: "#000000" },
      { name: "Zinc 600", value: "#52525b" },
      { name: "Zinc 700", value: "#3f3f46" },
      { name: "Zinc 800", value: "#27272a" },
      { name: "Zinc 900", value: "#18181b" },
    ],
  };

  const handleColorSelection = (color: string) => {
    handleColorClick(color);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "p-2 rounded-md text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-200 active:scale-95",
            isOpen && "bg-zinc-800 text-zinc-100 shadow-inner"
          )}
        >
          <div className="flex flex-col items-center">
            <span className="text-base font-medium">A</span>
            <div
              className="w-4 h-1 rounded-sm mt-0.5"
              style={{ backgroundColor: activeTextColor }}
            />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-0 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl"
        align="center"
        sideOffset={5}
      >
        <div className="p-2">
          <div className="px-3 py-2 text-xs font-medium uppercase text-zinc-400 border-b border-zinc-700 mb-2">
            Text Color
          </div>

          <Tabs defaultValue="whites" className="w-full">
            <TabsList className="grid grid-cols-5 mb-3 bg-zinc-700/60">
              <TabsTrigger value="whites" className="text-xs">
                White
              </TabsTrigger>
              <TabsTrigger value="colors" className="text-xs">
                Colors
              </TabsTrigger>
              <TabsTrigger value="brights" className="text-xs">
                Bright
              </TabsTrigger>
              <TabsTrigger value="muted" className="text-xs">
                Muted
              </TabsTrigger>
              <TabsTrigger value="dark" className="text-xs">
                Dark
              </TabsTrigger>
            </TabsList>

            {Object.entries(colorPalette).map(([category, colors]) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="grid grid-cols-5 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      className={cn(
                        "w-10 h-10 rounded-md flex items-center justify-center transition-all",
                        "hover:scale-105 hover:shadow-md active:scale-95",
                        activeTextColor === color.value &&
                          "ring-2 ring-blue-400 ring-offset-1 ring-offset-zinc-800"
                      )}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleColorSelection(color.value)}
                      title={color.name}
                    >
                      {activeTextColor === color.value && (
                        <Check
                          className={cn(
                            "h-4 w-4",
                            parseInt(color.value.slice(1), 16) > 0xaaaaaa
                              ? "text-black"
                              : "text-white"
                          )}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-3 pt-3 border-t border-zinc-700">
            <button
              className="flex items-center justify-center w-full px-3 py-2 text-sm rounded-md transition-colors text-zinc-200 hover:bg-zinc-700 active:scale-95"
              onClick={() => handleColorSelection("#f4f4f5")}
            >
              Reset to default
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TextColorModal;
