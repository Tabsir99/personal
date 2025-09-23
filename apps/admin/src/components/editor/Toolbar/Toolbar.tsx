"use client";

import { Editor } from "@tiptap/react";
import { memo, useCallback, useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { getTools } from "./ToolbarTools";
import HeadingModal from "../Modals/HeadingModal";
import TextColorModal from "../Modals/ColorModal";
import DraftPreview from "./DraftPreview";
import { ImageInsertButton } from "../Modals/ImageModal";
import LinkModal from "../Modals/LinkModal";
import ComponentPicker from "../Modals/ComponentPicker";

interface ActiveButton {
  align: "left" | "right" | "center" | "justify";
  node: string;
  mark: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    link: boolean;
    color: string;
  };
}
const Toolbar = ({
  editor,
  // setActiveModal,
}: {
  editor: Editor;
  // setActiveModal: Dispatch<SetStateAction<ActiveModal>>;
}) => {
  console.log("Toolbar re renders");
  const [activeButton, setActiveButton] = useState<ActiveButton>({
    align: "left",
    node: "",
    mark: {
      bold: false,
      color: "#E5E7EB",
      italic: false,
      strikethrough: false,
      underline: false,
      link: false,
    },
  });

  const throttle = useCallback(
    (func: (...args: any[]) => void, limit: number) => {
      let inThrottle: boolean;
      return function (...args: any[]) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    },
    []
  );

  const updateActiveButton = useCallback(
    throttle(() => {
      const currentColor = editor.getAttributes("textColor").color || "#E5E7EB";

      const newMarks: ActiveButton["mark"] = {
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        strikethrough: editor.isActive("strike"),
        link: editor.isActive("link"),
        color: currentColor,
      };
      const newAlign = editor.isActive({ textAlign: "right" })
        ? "right"
        : editor.isActive({ textAlign: "center" })
          ? "center"
          : editor.isActive({ textAlign: "justify" })
            ? "justify"
            : "left";

      const newNode = editor.isActive("bulletList")
        ? "ul"
        : editor.isActive("orderedList")
          ? "ol"
          : editor.isActive("blockquote")
            ? "quote"
            : editor.isActive("codeBlock")
              ? "code"
              : "";

      setActiveButton((prev) => {
        if (
          prev.align === newAlign &&
          prev.node === newNode &&
          JSON.stringify(prev.mark) === JSON.stringify(newMarks)
        ) {
          return prev;
        }
        return { align: newAlign, mark: newMarks, node: newNode };
      });
    }, 100),
    []
  );

  useEffect(() => {
    editor.on("selectionUpdate", updateActiveButton);
    return () => {
      editor.off("selectionUpdate", updateActiveButton);
    };
  }, [editor, updateActiveButton]);

  const tools = getTools(editor);
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 p-1 rounded-md">
        {tools.map((item) => {
          const isActive =
            (item.type === "align" && activeButton.align === item.key) ||
            (item.type === "node" && activeButton.node === item.key) ||
            (item.type === "mark" && activeButton.mark[item.key]);

          if (item.type === "divider") {
            return (
              <div
                className="h-8 border-r border-zinc-700 mx-1"
                key={item.key}
              />
            );
          }

          if (item.type === "heading") {
            return <HeadingModal editor={editor} key={item.key} />;
          }

          if (item.type === "textColor") {
            return (
              <TextColorModal
                key={item.key}
                activeTextColor={activeButton.mark.color}
                handleColorClick={(color) => {
                  editor.chain().focus().toggleTextColor(color).run();
                  updateActiveButton();
                }}
              />
            );
          }

          if (item.type === "link") {
            return (
              <LinkModal
                key={item.key}
                editor={editor}
                isActive={activeButton.mark.link}
              />
            );
          }

          if (item.type === "image") {
            return <ImageInsertButton editor={editor} key={item.key} />;
          }

          if (item.type === "components") {
            return <ComponentPicker editor={editor} key={item.key} />;
          }
          return (
            <Tooltip key={item.key}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "p-2 rounded-md text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-200 active:scale-95",
                    isActive && "bg-zinc-800 text-zinc-100 shadow-inner"
                  )}
                  id={item.key}
                  onClick={() => {
                    if (item.command) {
                      item.command();
                    }
                    if (item.key === "undo" || item.key === "redo") return;
                    updateActiveButton();
                  }}
                >
                  {item.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-zinc-950 text-zinc-200 text-xs border-zinc-800"
              >
                {item.key.charAt(0).toUpperCase() + item.key.slice(1)}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <DraftPreview editor={editor} />
    </TooltipProvider>
  );
};

export default memo(Toolbar, () => {
  return true;
});
