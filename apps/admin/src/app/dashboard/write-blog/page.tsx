"use client";

import {
  useEditor,
  EditorContent,
  AnyExtension,
  JSONContent,
} from "@tiptap/react";
import { useEffect, useState } from "react";
import { useWriteBlogContext } from "@/context/WriteBlogContext";
import { LocalStorageKeys } from "@/types/types";
import { BlogFormData } from "@/types/blogTypes";
import { starterKitOptions } from "@/components/editor/Toolbar/starterKit";
import CustomSpinner from "@/components/ui/common/LoadingAnimation";
import Toolbar from "@/components/editor/Toolbar/Toolbar";
import LinkModal from "@/components/editor/Modals/LinkModal";
import ComponentPickerModal from "@/components/editor/Modals/ComponentPicker";
import { toggleNode } from "@/components/editor/CustomExtensions/toggleNode";

export interface ActiveModal {
  link: boolean;
  components: boolean;
}
const TextEditor = () => {
  const [activeModal, setActiveModal] = useState<ActiveModal>({
    link: false,
    components: false,
  });

  const { setBlogFormData, defaultBlogFormData } = useWriteBlogContext();

  function debounce(func: (content: any) => void, delay: number) {
    let timeoutId: NodeJS.Timeout;
    return function (...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  const debouncedSave = debounce(async (content: JSONContent) => {
    setBlogFormData((prev) => ({ ...prev, content }));
    const blogFormDataStr = localStorage.getItem(LocalStorageKeys.BlogFormData);

    if (!blogFormDataStr) {
      localStorage.setItem(
        LocalStorageKeys.BlogFormData,
        JSON.stringify({
          ...defaultBlogFormData,
          content,
        } as BlogFormData)
      );
    } else {
      const blogFormData = JSON.parse(blogFormDataStr) as BlogFormData;
      localStorage.setItem(
        LocalStorageKeys.BlogFormData,
        JSON.stringify({
          ...blogFormData,
          content,
        } as BlogFormData)
      );
    }
  }, 1000);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,

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
    const blogFormDataStr = localStorage.getItem(LocalStorageKeys.BlogFormData);
    if (blogFormDataStr) {
      const blogData = JSON.parse(blogFormDataStr) as BlogFormData;
      editor?.commands.setContent(blogData.content);
    }
  }, [editor]);

  if (!editor)
    return (
      <div className="w-full h-full flex justify-center items-center">
        <CustomSpinner />
      </div>
    );

  function onClose() {
    setActiveModal({
      link: false,
      components: false,
    });
  }

  return (
    <section className=" text-[#E5E7EB] h-auto bg-[rgb(16,16,16)] pt-0 pb-3 relative flex justify-center items-center ">
      <div className=" sticky z-50 top-0 py-4 bg-[rgb(16,16,16)] w-full ">
        <div className="flex items-center px-4 w-fit mx-auto gap-[2px] rounded-full py-1 bg-zinc-800/40">
          <Toolbar editor={editor} setActiveModal={setActiveModal} />
        </div>
      </div>
      <EditorContent className="w-[830px] -ml-10" editor={editor} />

      <LinkModal isOpen={activeModal.link} onClose={onClose} editor={editor} />

      <ComponentPickerModal
        open={activeModal.components}
        onClose={onClose}
        onInsert={(component) => {
          console.log(component);
          toggleNode(component.id as any, editor);
          onClose();
        }}
      />
    </section>
  );
};

export default TextEditor;
