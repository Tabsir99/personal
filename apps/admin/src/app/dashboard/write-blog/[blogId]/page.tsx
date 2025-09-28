"use client";

import {
  useEditor,
  EditorContent,
  AnyExtension,
  JSONContent,
} from "@tiptap/react";
import { useEffect, useState } from "react";
import { starterKitOptions } from "@/components/editor/Toolbar/starterKit";
import CustomSpinner from "@/components/ui/common/LoadingAnimation";
import Toolbar from "@/components/editor/Toolbar/Toolbar";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export interface ActiveModal {
  link: boolean;
  components: boolean;
}
const TextEditor = () => {
  const [isLoading, setIsLoading] = useState(true);
  const saveDraft = useBlogEditorStore.getState().saveDraft;
  const blogId = useParams().blogId as string;
  const router = useRouter();
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editable: true,

    content: "<section> <p></p> </section>",
    extensions: starterKitOptions as AnyExtension[],

    onContentError: (error) => {
      console.error(error.error);
    },
  });

  useEffect(() => {
    if (!editor) return;
    useBlogEditorStore
      .getState()
      .loadBlogFormData(blogId)
      .then((blogFormData) => {
        if (!blogFormData.blogId) {
          router.push("/dashboard/write-blog");
          toast.error("Blog not found");
          return;
        }

        if (blogFormData.draftContent)
          editor?.commands.setContent(blogFormData.draftContent);
        setIsLoading(false);
      });

    return () => {
      saveDraft(editor.getJSON() as JSONContent);
    };
  }, [editor]);

  if (!editor)
    return (
      <div className="w-full h-full flex justify-center items-center">
        <CustomSpinner />
      </div>
    );

  return (
    <section className="h-auto pt-16 pb-3 relative flex justify-center items-center overflow-x-hidden">
      <div className="fixed top-0 pt-4 z-50 backdrop-blur-lg">
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
