// AppEditor.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useOpenNotion, OpenNotionView } from "@open-notion/editor";
import { DocContent } from "@open-notion/editor";
import WriteMetadataComp from "./writeMetadata";
import { BlogFormData } from "@tabsircg/schemas/blog";
import EditorHeader from "./EditorHeader";
import Preview from "./Preview";
import { PublishBlog } from "./PublishBlog";

const TextEditor = ({ blogFormData }: { blogFormData: BlogFormData }) => {
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">(
    "idle",
  );
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const saveDraft = useBlogEditorStore.getState().saveDraft;
  const lastDocStateRef = useRef<any>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSave = async (json: DocContent) => {
    setSaveStatus("saving");
    await saveDraft(json, false);
    setSaveStatus("saved");

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSaveStatus("idle");
      saveTimerRef.current = null;
    }, 2000);
  };

  const onChange = async (json: DocContent) => {
    if (!lastDocStateRef.current || !editor) return;
    if (editor.state.doc.eq(lastDocStateRef.current)) return;

    lastDocStateRef.current = editor.state.doc;
    await triggerSave(json);
  };

  const closeSettings = async () => {
    setShowSettings(false);
    if (!editor) return;
    await triggerSave(editor.getJSON());
  };

  const editor = useOpenNotion({
    onChange,
    content: blogFormData.content!,
    throttle: 500,
  });

  useEffect(() => {
    if (!editor) return;
    useBlogEditorStore.setState({ blogFormData });
    lastDocStateRef.current = editor.state.doc;

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [editor, blogFormData]);

  if (!editor) return null;

  return (
    <div className="w-full min-h-svh flex flex-col">
      <EditorHeader
        saveStatus={saveStatus}
        onPreview={() => setShowPreview(true)}
        onSettings={() => setShowSettings(true)}
        onPublish={() => setShowPublishDialog(true)}
      />
      <div className="flex-1 flex justify-center py-5 px-4">
        <div className="w-full max-w-4xl rounded-md border-2 border-border/70 bg-background/30 transition-all duration-200 focus-within:border-primary/20">
          <OpenNotionView
            editor={editor}
            className="w-full min-h-svh pl-20 pr-10 py-10"
          />
        </div>
      </div>
      <Preview
        open={showPreview}
        onOpenChange={setShowPreview}
        editor={editor}
        showPreview={showPreview}
      />
      <WriteMetadataComp
        showSidebar={showSettings}
        closeSidebar={closeSettings}
      />
      <PublishBlog
        blogId={blogFormData.blogId}
        isOpen={showPublishDialog}
        setIsOpen={setShowPublishDialog}
      />
    </div>
  );
};

export default TextEditor;
