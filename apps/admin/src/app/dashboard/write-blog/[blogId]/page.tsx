"use client";

import {
  useEditor,
  EditorContent,
  AnyExtension,
  JSONContent,
} from "@tiptap/react";
import { useEffect, useState } from "react";
import { LocalStorageKeys } from "@/types/settingTypes";
import { BlogFormData } from "@/types/blogTypes";
import { starterKitOptions } from "@/components/editor/Toolbar/starterKit";
import CustomSpinner from "@/components/ui/common/LoadingAnimation";
import Toolbar from "@/components/editor/Toolbar/Toolbar";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";

export interface ActiveModal {
  link: boolean;
  components: boolean;
}
const TextEditor = () => {
  const [isLoading, setIsLoading] = useState(true);
  const setBlogFormData = useBlogEditorStore.getState().setBlogFormData;

  function debounce(func: (content: any) => void, delay: number) {
    let timeoutId: NodeJS.Timeout;
    return function (...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  const debouncedSave = debounce(async (content: JSONContent) => {
    setBlogFormData({ content });
    const blogFormDataStr = localStorage.getItem(
      LocalStorageKeys.BlogFormData
    )!;

    const blogFormData = JSON.parse(blogFormDataStr) as BlogFormData;
    localStorage.setItem(
      LocalStorageKeys.BlogFormData,
      JSON.stringify({
        ...blogFormData,
        content,
      } as BlogFormData)
    );
  }, 2000);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editable: true,

    content: "<section> <p></p> </section>",

    extensions: starterKitOptions as AnyExtension[],
    onUpdate: ({ editor }) => {
      debouncedSave(editor.getJSON());
    },
    onContentError: (error) => {
      console.error(error.error);
    },
  });

  useEffect(() => {
    if (!editor) return;

    const blogFormDataStr = localStorage.getItem(LocalStorageKeys.BlogFormData);
    if (blogFormDataStr) {
      const blogData = JSON.parse(blogFormDataStr) as BlogFormData;
      if (blogData.blogId) {
        setTimeout(() => {
          setBlogFormData(blogData);
          editor?.commands.setContent(blogData.content);
          setIsLoading(false);
        }, 1000);

        return;
      }
    }
  }, [editor]);

  if (!editor)
    return (
      <div className="w-full h-full flex justify-center items-center">
        <CustomSpinner />
      </div>
    );

  return (
    <section className=" text-[#E5E7EB] h-auto bg-[rgb(16,16,16)] pt-0 pb-3 relative flex justify-center items-center ">
      <div className=" sticky z-50 top-0 py-4 bg-[rgb(16,16,16)] w-full ">
        <div className="flex items-center px-4 w-fit mx-auto gap-[2px] rounded-full py-1 bg-zinc-800/40">
          <Toolbar editor={editor} />
        </div>
      </div>
      <EditorContent className="w-[830px] -ml-10" editor={editor} />
      {isLoading && (
        <div className="w-[830px] -ml-10 absolute h-full z-20 overflow-hidden text-white flex justify-center items-center">
          <CustomSpinner />
        </div>
      )}
    </section>
  );
};

export default TextEditor;
