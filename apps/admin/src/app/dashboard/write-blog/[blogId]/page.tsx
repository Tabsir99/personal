"use client";
import { useEffect, useRef, useState } from "react";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Cloud } from "lucide-react";
import { cn } from "@/lib/appUtils";

const TextEditor = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">(
    "idle",
  );
  const saveDraft = useBlogEditorStore.getState().saveDraft;
  const blogId = useParams().blogId as string;
  const router = useRouter();

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = (editor: any) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      await saveDraft(editor.getJSON(), false);
      setSaveStatus("saved");

      setTimeout(() => setSaveStatus("idle"), 1000);
    }, 1500);
  };

  useEffect(() => {
    if (!editor) return;

    useBlogEditorStore
      .getState()
      .loadBlogFormData(blogId)
      .then(() => {
        editor?.commands.setContent(
          useBlogEditorStore.getState().blogFormData.content,
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
      <div className="relative flex items-center">
        {/* Save indicator - absolute, non-blocking */}
        <div
          className={cn(
            "absolute -right-28 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap w-24",
            saveStatus === "saving" &&
              "bg-blue-500/10 text-blue-400 border border-blue-500/20",
            saveStatus === "saved" &&
              "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
            saveStatus === "idle" &&
              "opacity-0 scale-95 pointer-events-none duration-0",
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
    </section>
  );
};

export default TextEditor;
