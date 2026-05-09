"use client";
import { use, useMemo, Suspense } from "react";
import { TypedEditor } from "@open-notion/editor";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-4xl overflow-hidden p-0"
      >
        <SheetHeader className="px-6 py-4 border-b border-border/50">
          <SheetTitle>Preview</SheetTitle>
        </SheetHeader>
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
      </SheetContent>
    </Sheet>
  );
}
