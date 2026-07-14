"use client";
import { use, useMemo, Suspense } from "react";
import { TypedEditor } from "@open-notion/editor";
import { Sheet } from "premium-ds/sheet";
import { Button } from "premium-ds/button";
import { X } from "@phosphor-icons/react";

function PreviewContent({ editor }: { editor: TypedEditor }) {
  const html = use(useMemo(() => editor.getHTML(), [editor]));
  return (
    <div
      className="overflow-y-auto h-[calc(100vh-73px)] px-10 py-8"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function Preview({
  open,
  onOpenChange,
  editor,
  showPreview,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor: TypedEditor;
  showPreview: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} side="right">
      {({ close }) => (
        <div className="h-full w-full sm:w-[56rem] flex flex-col bg-background border-l border-border overflow-hidden">
          <div className="flex h-14 items-center justify-between px-6 py-4 border-b border-border/50">
            <span className="font-semibold text-foreground">Preview</span>
            <Button variant="ghost" size="sm" onClick={close} iconLeft={<X size={14} />} />
          </div>
          <Suspense
            fallback={
              <div className="px-10 py-8 space-y-3">
                <div className="h-7 w-1/3 rounded-md bg-muted animate-pulse" />
                <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
                <div className="h-4 w-5/6 rounded-md bg-muted animate-pulse" />
                <div className="h-4 w-11/12 rounded-md bg-muted animate-pulse" />
              </div>
            }
          >
            {showPreview && <PreviewContent editor={editor} />}
          </Suspense>
        </div>
      )}
    </Sheet>
  );
}

