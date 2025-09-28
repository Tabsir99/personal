"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FaCloud, FaEye, FaTag } from "react-icons/fa6";
import WriteMetadataComp from "../../write-post/writeMetadata";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { Editor, JSONContent } from "@tiptap/react";

const DraftPreview = ({ editor }: { editor: Editor }) => {
  const router = useRouter();
  const saveDraft = useBlogEditorStore.getState().saveDraft;
  const [showSidebar, setShowSidebar] = useState(false);

  const blogId = useParams().blogId;

  return (
    <>
      <div className="border-r border-gray-300 mx-2 h-6" />

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
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                router.push(`./${blogId}/preview`);
              }}
            >
              <FaEye />
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
    </>
  );
};

export default DraftPreview;
