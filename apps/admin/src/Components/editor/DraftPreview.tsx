// DraftPreview.js
"use client";
import { Editor } from "@tiptap/react";
import DOMPurify from "dompurify";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaArrowRight, FaCloud, FaEye, FaTag } from "react-icons/fa6";

import { buildBlog, measureEstReadTime } from "@/utils/utils";

import WriteMetadataComp from "../write-post/writeMetadata";

import { saveDraft } from "@/actions/blogActions";
import {
  NotificationType,
  useNotification,
} from "@/context/NotificationContext";
import { useBlogMetadata } from "@/context/WriteBlogContext";
import { Blog, UnstructuredBlogData } from "@/types/blogTypes";





const DraftPreview = ({ editor }: { editor: Editor }) => {
  const router = useRouter();
  const { addNotification } = useNotification();
  const { setBlogData } = useBlogMetadata();

  const [showSidebar, setShowSidebar] = useState(false);

  async function draftBlog() {
    const html = editor.getHTML();
    const sanitizedHTML = DOMPurify.sanitize(html);
    const blogText = editor.getText();
    const estReadTime = measureEstReadTime(blogText);

    const blogData = JSON.parse(localStorage.getItem("metaData") || "") as
      | UnstructuredBlogData
      | undefined;
    if (blogData) {
      const blog: Blog = buildBlog(blogData, sanitizedHTML, estReadTime);

      try {
        const res = await saveDraft(blog);
        if (res.status === "success") {
          addNotification({
            message: res.message,
            type: NotificationType.SUCCESS,
          });
          localStorage.clear();
        } else {
          addNotification({ message: res.message });
        }
      } catch (error) {
        addNotification({ message: "An error occurred" });
      }
    }
  }

  return (
    <>
      <div className="border-r border-gray-300 mx-2 h-6" />

      <div className="flex items-center gap-[2px]">
        <button
          className=" toolbar-btns px-2 py-2 w-8 h-8 relative rounded-md hover:bg-gray-700 transition duration-100 active:scale-95 "
          onClick={draftBlog}
          title="Draft"
        >
          <FaCloud />
        </button>

        <button
          className=" toolbar-btns px-2 py-2 rounded-md w-8 h-8 relative hover:bg-gray-700 transition duration-100 active:scale-95 "
          onClick={() => {
            const estReadTime = measureEstReadTime(editor.getText());

            let currentData: UnstructuredBlogData | null = null;

            setBlogData((prev) => {
              currentData = { ...prev, estReadTime };
              return currentData
            });

            localStorage.setItem("metaData", JSON.stringify(currentData));
            localStorage.setItem("blogHTML", editor.getHTML());
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
        <div className="fixed bg-neutral-900/50 backdrop-blur-sm w-screen h-screen top-0 left-0" />
      )}

      <div
        className={`fixed min-h-screen top-0 right-0 bg-neutral-950 max-w-5xl mx-auto flex flex-col gap-4
          p-8 justify-center transition duration-300 ${showSidebar ? "" : "translate-x-1/2 opacity-0 pointer-events-none"}`}
      >
        <FaArrowRight
          onClick={() => {
            setShowSidebar(false);
          }}
          className="scale-x-125 text-gray-400 hover:text-gray-100 transition-colors cursor-pointer w-5 h-5"
        />
        <h1 className="text-2xl font-bold mb-4">Edit Metadata</h1>
        <WriteMetadataComp
          isSidebar={true}
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
