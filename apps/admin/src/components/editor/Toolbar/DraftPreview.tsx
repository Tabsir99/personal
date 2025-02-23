// DraftPreview.js
"use client";
import { Editor } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaArrowRight, FaCloud, FaEye, FaTag } from "react-icons/fa6";
import WriteMetadataComp from "../../write-post/writeMetadata";
import { saveDraft } from "@/actions/blogActions";
import {
  NotificationType,
  useNotification,
} from "@/context/NotificationContext";
import { BlogFormData } from "@/types/blogTypes";
import { preHighlight } from "@/utils/highlighter";
import { LocalStorageKeys } from "@/types/types";
import { useWriteBlogContext } from "@/context/WriteBlogContext";

const DraftPreview = ({ editor }: { editor: Editor }) => {
  const router = useRouter();
  const { addNotification } = useNotification();
  const { resetBlogFormData, setBlogFormData } = useWriteBlogContext();

  const [showSidebar, setShowSidebar] = useState(false);

  async function draftBlog(clearLocalStorage: boolean) {
    const html = editor.getHTML();

    const blogFormDataStr = localStorage.getItem(LocalStorageKeys.BlogFormData);
    if (!blogFormDataStr) throw new Error("BlogFormData is missing");

    const blogFormData = JSON.parse(blogFormDataStr) as BlogFormData;
    try {
      const res = await saveDraft(blogFormData);
      if (res.status === "success") {
        if (clearLocalStorage) {
          localStorage.clear();
          resetBlogFormData();
          addNotification({
            message: res.message,
            type: NotificationType.SUCCESS,
          });
        } else {
          localStorage.setItem(
            LocalStorageKeys.BlogFormData,
            JSON.stringify({
              ...blogFormData,
              blogId: res.data?.blogId,
              link: res.data?.link,
              estReadTime: res.data?.blogMetadata.estReadTime,
              content: preHighlight(html),
            } as BlogFormData)
          );
        }

        return res.data;
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      addNotification({
        message: (error as Error).message || "An error occurred",
      });
      return null;
    }
  }

  return (
    <>
      <div className="border-r border-gray-300 mx-2 h-6" />

      <div className="flex items-center gap-[2px]">
        <button
          className=" toolbar-btns px-2 py-2 w-8 h-8 relative rounded-md hover:bg-gray-700 transition duration-100 active:scale-95 "
          onClick={async () => {
            await draftBlog(true);
            router.push("/dashboard/manage-posts");
          }}
          title="Draft"
        >
          <FaCloud />
        </button>

        <button
          className=" toolbar-btns px-2 py-2 rounded-md w-8 h-8 relative hover:bg-gray-700 transition duration-100 active:scale-95 "
          onClick={async () => {
            const data = await draftBlog(false);
            if (!data) return;

            const highlightedHtml = preHighlight(editor.getHTML());
            setBlogFormData((prev) => ({
              ...prev,
              blogId: data.blogId,
              estReadTime: data.blogMetadata.estReadTime,
              link: data.link,
              content: highlightedHtml,
            }));

            router.push("write-blog/preview-blog");
          }}
          title="Preview"
        >
          <FaEye />
        </button>

        <button
          className=" toolbar-btns px-2 py-2 rounded-md hover:bg-gray-700 w-8 h-8 relative transition duration-100 active:scale-95 "
          onClick={() => setShowSidebar(true)}
          title="Metadata"
        >
          <FaTag />
        </button>
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
            addNotification({
              message: "Blog metadata saved",
              type: NotificationType.INFO,
            });
          }}
        />
      </div>
    </>
  );
};

export default DraftPreview;
