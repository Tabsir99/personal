"use client";
import { useState } from "react";
import { FaCloud, FaTag, FaEye } from "react-icons/fa6";
import WriteMetadataComp from "../../write-post/writeMetadata";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { Editor, JSONContent } from "@tiptap/react";
import PreviewSheet from "./PreviewSheet";

const DraftPreview = ({ editor }: { editor: Editor }) => {
  const saveDraft = useBlogEditorStore.getState().saveDraft;
  const [showSidebar, setShowSidebar] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="h-6 w-px bg-gradient-to-b from-transparent via-zinc-600 to-transparent mx-1.5" />

      <div className="flex items-center gap-[2px]">
        <Tooltip key="draft">
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => saveDraft(editor.getJSON() as JSONContent)}
            >
              <FaCloud />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="bg-zinc-950 text-zinc-200 text-xs border-zinc-800"
          >
            Draft Blog
          </TooltipContent>
        </Tooltip>

        <Tooltip key="preview">
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
              <FaEye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="bg-zinc-950 text-zinc-200 text-xs border-zinc-800"
          >
            Preview Blog
          </TooltipContent>
        </Tooltip>

        <Tooltip key="metadata">
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(true)}
            >
              <FaTag />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="bg-zinc-950 text-zinc-200 text-xs border-zinc-800"
          >
            Edit Metadata
          </TooltipContent>
        </Tooltip>
      </div>

      <WriteMetadataComp
        closeSidebar={() => setShowSidebar(false)}
        showSidebar={showSidebar}
      />

      <PreviewSheet isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default DraftPreview;
