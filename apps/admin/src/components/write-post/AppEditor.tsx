// AppEditor.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Cloud, Eye, Settings, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useOpenNotion,
  OpenNotionView,
  DocRenderer,
} from "@open-notion/editor";
import { EditorSkeleton } from "./EditorSkeleton";
import { DocContent } from "@open-notion/editor";
import WriteMetadataComp from "./writeMetadata";
import { publishBlog } from "@/actions/blogActions";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TextEditor = () => {
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">(
    "idle",
  );
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const saveDraft = useBlogEditorStore.getState().saveDraft;
  const isLoading = useBlogEditorStore((s) => s.isLoading);
  const blogId = useParams().blogId as string;
  const router = useRouter();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDocStateRef = useRef<any>(null);

  const debouncedSave = (json: DocContent) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      if (!lastDocStateRef.current || !editor) return;
      if (editor.state.doc.eq(lastDocStateRef.current)) return;

      lastDocStateRef.current = editor.state.doc;
      setSaveStatus("saving");
      await saveDraft(json, false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1000);
    }, 1500);
  };

  const handlePublish = async () => {
    if (!editor) return;
    setIsPublishing(true);
    const toastId = toast.loading("Publishing...");
    try {
      await saveDraft(editor.getJSON(), false);
      await publishBlog(blogId);
      toast.success("Blog published!", { id: toastId });
      router.push("/dashboard/write-blog");
    } catch (error) {
      console.error("Publish error:", error);
      toast.error("Failed to publish", { id: toastId });
      setIsPublishing(false);
      setShowPublishDialog(false);
    }
  };

  const editor = useOpenNotion({ onChange: debouncedSave });

  useEffect(() => {
    if (!editor) return;
    useBlogEditorStore
      .getState()
      .loadBlogFormData(blogId)
      .then(() => {
        const content = useBlogEditorStore.getState().blogFormData.content;
        editor.commands.setContent(content);
        lastDocStateRef.current = editor.state.doc;
      })
      .catch((e) => {
        console.log(e);
        toast.error("Failed to load blog");
        router.push("/dashboard/write-blog");
      });

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveDraft(editor.getJSON(), false);
    };
  }, [editor]);

  return (
    <div className="w-full min-h-svh flex flex-col">
      <div className="sticky h-14 w-full top-0 z-10 flex items-center justify-between px-6 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="relative w-20 h-6">
          <div
            className={cn(
              "absolute inset-0 flex items-center gap-1.5 text-xs font-medium text-primary transition-opacity duration-300",
              saveStatus === "saving" ? "opacity-100" : "opacity-0",
            )}
          >
            <Cloud className="w-3 h-3 animate-pulse shrink-0" />
            <span>Saving...</span>
          </div>
          <div
            className={cn(
              "absolute inset-0 flex items-center gap-1.5 text-xs font-medium text-primary transition-opacity duration-300",
              saveStatus === "saved" ? "opacity-100" : "opacity-0",
            )}
          >
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>Saved</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
            <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
            <div className="h-8 w-20 rounded-md bg-muted animate-pulse" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(true)}
              className="gap-1.5"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="gap-1.5"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button
              size="sm"
              onClick={() => setShowPublishDialog(true)}
              className="gap-1.5"
            >
              <Send className="w-4 h-4" />
              Publish
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <EditorSkeleton />
      ) : (
        <div className="flex-1 flex justify-center py-5 px-4">
          <OpenNotionView
            editor={editor}
            className="w-full max-w-3xl min-h-svh px-20 py-14 rounded-md"
          />
        </div>
      )}

      <Sheet open={showPreview} onOpenChange={setShowPreview}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-3xl overflow-hidden p-0"
        >
          <SheetHeader className="px-6 py-4 border-b border-border/50">
            <SheetTitle>Preview</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto h-[calc(100vh-73px)] px-10 py-8">
            {editor && showPreview && <DocRenderer doc={editor.getJSON()} />}
          </div>
        </SheetContent>
      </Sheet>

      <WriteMetadataComp
        showSidebar={showSettings}
        closeSidebar={() => setShowSettings(false)}
      />

      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Publish Blog</DialogTitle>
            <DialogDescription>
              This will save your draft and publish the blog. Are you sure you
              want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowPublishDialog(false)}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? "Publishing..." : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TextEditor;
