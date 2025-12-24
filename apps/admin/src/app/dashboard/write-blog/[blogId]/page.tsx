"use client";
import {
  useEditor,
  EditorContent,
  AnyExtension,
  JSONContent,
  Editor,
} from "@tiptap/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { starterKitOptions } from "@/components/editor/Toolbar/starterKit";
import Toolbar from "@/components/editor/Toolbar/Toolbar";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

const TextEditor = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">(
    "idle"
  );
  const saveDraft = useBlogEditorStore.getState().saveDraft;
  const blogId = useParams().blogId as string;
  const router = useRouter();

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = (editor: Editor) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      await saveDraft(editor.getJSON() as JSONContent, false);
      setSaveStatus("saved");

      setTimeout(() => setSaveStatus("idle"), 1000);
    }, 1500);
  };

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editable: true,
    content: "<section> <p></p> </section>",
    extensions: starterKitOptions as AnyExtension[],
    onContentError: (error) => {
      console.error(error.error);
    },
    onUpdate: ({ editor }) => {
      debouncedSave(editor);
    },
  });

  useEffect(() => {
    if (!editor) return;

    useBlogEditorStore
      .getState()
      .loadBlogFormData(blogId)
      .then(() => {
        editor?.commands.setContent(
          useBlogEditorStore.getState().blogFormData.content
        );
        setIsLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load blog");
        router.push("/dashboard/write-blog");
      });

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveDraft(editor.getJSON() as JSONContent, false);
    };
  }, [editor]);

  return (
    <section className="h-auto pt-16 pb-3 relative flex justify-center items-center overflow-x-hidden">
      <div className="fixed top-0 pt-4 z-10 backdrop-blur-lg w-full flex justify-center">
        <div className="relative flex items-center">
          {/* Toolbar */}
          <div
            className={cn(
              "flex items-center px-4 w-fit gap-[2px] rounded-full py-1 bg-zinc-800/40 border border-zinc-700/30",
              isLoading && "opacity-50 pointer-events-none"
            )}
          >
            <Toolbar editor={editor} />
          </div>

          {/* Save indicator - absolute, non-blocking */}
          <div
            className={cn(
              "absolute -right-28 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap w-24",
              saveStatus === "saving" &&
                "bg-blue-500/10 text-blue-400 border border-blue-500/20",
              saveStatus === "saved" &&
                "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
              saveStatus === "idle" &&
                "opacity-0 scale-95 pointer-events-none duration-0"
            )}
          >
            {saveStatus === "saving" && (
              <>
                <Cloud className="w-3.5 h-3.5 animate-pulse" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="w-[830px] -ml-10 relative bg-[rgba(24,23,23,0.7)] border-2 border-zinc-700/30 rounded-lg focus-within:border-zinc-700/50 p-10">
        {isLoading ? (
          // Skeleton
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, index) => (
              <Fragment key={index}>
                <div className="h-10 bg-zinc-800/40 rounded-lg w-3/4" />
                <div className="h-4 bg-zinc-800/30 rounded w-full" />
                <div className="h-4 bg-zinc-800/30 rounded w-5/6" />
                <div className="h-4 bg-zinc-800/30 rounded w-4/6" />
              </Fragment>
            ))}
          </div>
        ) : (
          // Actual editor
          <EditorContent editor={editor!} />
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed bottom-8 right-8 flex items-center gap-2 px-4 py-2 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/50 rounded-full text-zinc-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </div>
      )}
    </section>
  );
};

export default TextEditor;
