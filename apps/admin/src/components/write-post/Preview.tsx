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
      className="h-[calc(100vh-73px)] overflow-y-auto px-10 py-8"
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
        <div className="flex size-full flex-col overflow-hidden border-l border-border bg-background sm:w-4xl">
          <div className="flex h-14 items-center justify-between border-b border-border/50 px-6 py-4">
            <span className="font-semibold text-foreground">Preview</span>
            <Button variant="ghost" size="sm" onClick={close} iconLeft={<X size={14} />} />
          </div>
          <Suspense
            fallback={
              <div className="space-y-3 px-10 py-8">
                <div className="h-7 w-1/3 animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-11/12 animate-pulse rounded-md bg-muted" />
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

