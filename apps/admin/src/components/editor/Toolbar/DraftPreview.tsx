// DraftPreview.js
"use client";
import { Editor } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaArrowRight, FaCloud, FaEye, FaTag } from "react-icons/fa6";
import WriteMetadataComp from "../../write-post/writeMetadata";
import { saveDraft } from "@/actions/blogActions";
import { BlogFormData } from "@/types/blogTypes";
import { LocalStorageKeys } from "@/types/settingTypes";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

const DraftPreview = ({ editor }: { editor: Editor }) => {
  const router = useRouter();

  const [showSidebar, setShowSidebar] = useState(false);

  async function draftBlog() {
    const blogFormDataStr = localStorage.getItem(LocalStorageKeys.BlogFormData);
    if (!blogFormDataStr) throw new Error("BlogFormData is missing");

    const blogFormData = JSON.parse(blogFormDataStr) as BlogFormData;
    try {
      const res = await saveDraft(blogFormData);
      if (res.status === "success") {
        localStorage.setItem(
          LocalStorageKeys.BlogFormData,
          JSON.stringify({
            ...blogFormData,
            link: res.data?.link,
            estReadTime: res.data?.estReadTime,
            content: editor.getJSON(),
          } as BlogFormData)
        );
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      toast.error((error as Error).message || "An error occurred");
    }
  }

  return (
    <>
      <div className="border-r border-gray-300 mx-2 h-6" />

      <div className="flex items-center gap-[2px]">
        <Tooltip key="draft">
          <TooltipTrigger asChild>
            <button
              className=" toolbar-btns px-2 py-2 w-8 h-8 relative rounded-md hover:bg-gray-700 transition duration-100 active:scale-95 "
              onClick={draftBlog}
            >
              <FaCloud />
            </button>
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
            <button
              className=" toolbar-btns px-2 py-2 rounded-md w-8 h-8 relative hover:bg-gray-700 transition duration-100 active:scale-95 "
              onClick={() => {
                router.push("write-blog/preview-blog");
              }}
            >
              <FaEye />
            </button>
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
            <button
              className=" toolbar-btns px-2 py-2 rounded-md hover:bg-gray-700 w-8 h-8 relative transition duration-100 active:scale-95 "
              onClick={() => setShowSidebar(true)}
            >
              <FaTag />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="bg-zinc-950 text-zinc-200 text-xs border-zinc-800"
          >
            Edit Metadata
          </TooltipContent>
        </Tooltip>
      </div>

      {showSidebar && (
        <div className="fixed bg-zinc-900/50 backdrop-blur-sm w-screen h-screen top-0 left-0" />
      )}

      <div
        className={`fixed h-screen overflow-scroll top-0 right-0 bg-zinc-950 w-full max-w-4xl mx-auto flex flex-col gap-4
          p-8 transition duration-300 ${showSidebar ? "" : "translate-x-1/2 opacity-0 pointer-events-none"}`}
      >
        <FaArrowRight
          onClick={() => {
            setShowSidebar(false);
          }}
          className="scale-x-125 text-gray-400 hover:text-gray-100 transition-colors cursor-pointer w-5 h-5"
        />
        <h1 className="text-2xl font-bold mb-4">Edit Metadata</h1>
        <WriteMetadataComp
          closeSidebar={() => {
            setShowSidebar(false);
            toast.success("Blog metadata saved");
          }}
        />
      </div>
    </>
  );
};

export default DraftPreview;
