"use client";

import { useEditor, EditorContent, AnyExtension } from "@tiptap/react";
import { useEffect, useState } from "react";

import DraftPreview from "./Toolbar/DraftPreview";
import CodeBlockModal from "./Modals/CodeBlockModal";
import ColorModal from "./Modals/ColorModal";
import { ImageModal } from "./Modals/ImageModal";
import LinkModal from "./Modals/LinkModal";
import { starterKitOptions } from "./Toolbar/starterKit";
import Toolbar from "./Toolbar/Toolbar";

import "./Editor.css";
import CustomSpinner from "../ui/common/LoadingAnimation";
import { useWriteBlogContext } from "@/context/WriteBlogContext";
import { LocalStorageKeys } from "@/types/types";
import { BlogFormData } from "@/types/blogTypes";
import { preHighlight } from "@/utils/highlighter";

export interface ActiveModal {
  link: boolean;
  image: boolean;
  textColor: boolean;
  programmingLanguage: boolean;
}
const TextEditor = () => {
  const [activeModal, setActiveModal] = useState<ActiveModal>({
    link: false,
    image: false,
    textColor: false,
    programmingLanguage: false,
  });

  const [activeTextColor, setActiveTextColor] = useState("#D1D5DB");
  const { setBlogFormData, defaultBlogFormData } = useWriteBlogContext();

  function debounce(func: (content: any) => void, delay: number) {
    let timeoutId: NodeJS.Timeout;
    return function (...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  const debouncedSave = debounce(async (content) => {
    const highLightedContent = preHighlight(content);
    setBlogFormData((prev) => ({ ...prev, content: highLightedContent }));
    const blogFormDataStr = localStorage.getItem(LocalStorageKeys.BlogFormData);

    if (!blogFormDataStr) {
      localStorage.setItem(
        LocalStorageKeys.BlogFormData,
        JSON.stringify({
          ...defaultBlogFormData,
          content: highLightedContent,
        } as BlogFormData)
      );
    } else {
      const blogFormData = JSON.parse(blogFormDataStr) as BlogFormData;
      localStorage.setItem(
        LocalStorageKeys.BlogFormData,
        JSON.stringify({
          ...blogFormData,
          content: highLightedContent,
        } as BlogFormData)
      );
    }
  }, 1000);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,

    content: "<section> <p> Start... </p> </section>",
    extensions: starterKitOptions as AnyExtension[],
    onUpdate: ({ editor }) => {
      debouncedSave(editor.getHTML());
    },
  });

  useEffect(() => {
    const blogFormDataStr = localStorage.getItem(LocalStorageKeys.BlogFormData);
    if (blogFormDataStr) {
      const blogData = JSON.parse(blogFormDataStr) as BlogFormData;
      editor?.commands.setContent(blogData.content);
    }
  }, [editor]);

  if (!editor)
    return (
      <div className="w-full h-full flex justify-center items-center">
        {" "}
        <CustomSpinner />{" "}
      </div>
    );

  function onClose() {
    setActiveModal({
      link: false,
      image: false,
      textColor: false,
      programmingLanguage: false,
    });
  }

  return (
    <section className=" text-gray-300 h-auto bg-[rgb(16,16,16)] pt-0 pb-3 px-12 relative   ">
      <div className=" sticky z-50 top-0 py-4 bg-[rgb(16,16,16)] w-full mx-auto ">
        <div className="flex items-center px-4 w-fit mx-auto gap-[2px] rounded-full py-1 bg-zinc-800/40">
          <Toolbar
            editor={editor}
            setActiveModal={setActiveModal}
            activeTextColor={activeTextColor}
            setActiveTextColor={setActiveTextColor}
          />
          <DraftPreview editor={editor} />
        </div>
      </div>
      <EditorContent className="editor" editor={editor} />

      <LinkModal isOpen={activeModal.link} onClose={onClose} editor={editor} />
      <ImageModal
        isOpen={activeModal.image}
        onClose={onClose}
        editor={editor}
      />
      <ColorModal
        isOpen={activeModal.textColor}
        onClose={onClose}
        editor={editor}
        setActiveTextColor={setActiveTextColor}
      />
      <CodeBlockModal
        isOpen={activeModal.programmingLanguage}
        onClose={onClose}
        editor={editor}
      />
    </section>
  );
};

export default TextEditor;
