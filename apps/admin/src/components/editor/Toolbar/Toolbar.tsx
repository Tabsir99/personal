"use client";

import { Editor } from "@tiptap/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ActiveModal } from "@/app/dashboard/write-blog/page";

import { getTools } from "./ToolbarTools";
import HeadingModal from "../Modals/HeadingModal";
import TextColorModal from "../Modals/ColorModal";
import DraftPreview from "./DraftPreview";
import { ImageInsertButton } from "../Modals/ImageModal";
import LinkModal from "../Modals/LinkModal";

const Toolbar = ({
  editor,
  setActiveModal,
}: {
  editor: Editor;
  setActiveModal: Dispatch<SetStateAction<ActiveModal>>;
}) => {
  const [activeButton, setActiveButton] = useState({
    align: "left",
    node: "",
    mark: {},
  });
  const [activeTextColor, setActiveTextColor] = useState<string>("#E5E7EB");

  const updateActiveButton = () => {
    setActiveButton({
      mark: {
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        strikethrough: editor.isActive("strike"),
      },
      align: editor.isActive({ textAlign: "right" })
        ? "right"
        : editor.isActive({ textAlign: "center" })
          ? "center"
          : editor.isActive({ textAlign: "justify" })
            ? "justify"
            : "left",
      node: editor.isActive("bulletList")
        ? "ul"
        : editor.isActive("orderedList")
          ? "ol"
          : editor.isActive("blockquote")
            ? "quote"
            : editor.isActive("codeBlock")
              ? "code"
              : "",
    });

    const currentColor = editor.getAttributes("textColor").color || "#E5E7EB";
    setActiveTextColor(currentColor);
  };
  useEffect(() => {
    editor.on("selectionUpdate", updateActiveButton);

    return () => {
      editor.off("selectionUpdate", updateActiveButton);
    };
  }, [editor, updateActiveButton]);

  const tools = getTools(editor, setActiveModal);
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-md">
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
                activeTextColor={activeTextColor}
                handleColorClick={(color) => {
                  editor.chain().focus().toggleTextColor(color).run();
                }}
              />
            );
          }

          if (item.type === "link") {
            return <LinkModal key={item.key} editor={editor} />;
          }

          if (item.type === "image") {
            return <ImageInsertButton editor={editor} key={item.key} />;
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

export default Toolbar;
