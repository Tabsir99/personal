"use client";
import { useState } from "react";
import { publishBlog } from "@/actions/blogActions";
import { parseContent } from "@/lib/parseTiptapJson";
import { invalidateBlogOverview } from "@/hooks/useInvalidateCache";
import { toast } from "sonner";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useShallow } from "zustand/shallow";
import { slugify } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Eye, Loader2, X, Upload, Calendar, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";

const requiredFields = [
  "draftTitle",
  "draftDescription",
  "draftTags",
  "draftContent",
  "type",
];

export default function PreviewSheet({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const blogFormData = useBlogEditorStore(
    useShallow((state) => state.blogFormData)
  );
  const resetBlogFormData = useBlogEditorStore.getState().resetBlogFormData;

  const handlePublish = async () => {
    if (!blogFormData.blogId) return toast.error("Blog not found");

    for (const [key, value] of Object.entries(blogFormData)) {
      if (requiredFields.includes(key) && (!value || value.length === 0)) {
        toast.error(`${key} is required in metadata`);
        return;
      }
    }

    setIsUploading(true);
    const res = await publishBlog(blogFormData.blogId);
    setIsUploading(false);

    if (res.status === "success") {
      toast.success(res.message);
      invalidateBlogOverview({
        selectedBlog: res.data!,
        type: "add",
      });
      resetBlogFormData();
      setIsOpen(false);
      // Navigate to manage posts if needed
    }
    return;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-4xl p-0 dark border-zinc-800 overflow-y-auto"
      >
        {/* Header with actions */}
        <div className="sticky top-0 z-10 dark backdrop-blur-sm border-b border-zinc-800">
          <div className="flex items-center justify-between px-8 py-4">
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-900">
                <Eye className="h-4 w-4 text-zinc-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Preview</h2>
                <p className="text-xs text-zinc-500">
                  Review before publishing
                </p>
              </div>
            </DialogTitle>

            <div className="flex items-center gap-2">
              <Button
                onClick={handlePublish}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Publish
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="px-8 pb-3 flex items-center gap-2 text-sm text-zinc-500">
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">
              blogs
            </span>
            <span>/</span>
            <span className="text-zinc-400">
              {blogFormData.link || slugify(blogFormData.title)}
            </span>
          </div>
        </div>

        {/* Article content */}
        <div className="px-8 py-8 max-w-3xl mx-auto">
          {/* Article header */}
          <header className="mb-12 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 leading-tight">
              {blogFormData.title || "Untitled Post"}
            </h1>

            {blogFormData.description && (
              <p className="text-xl text-zinc-400 leading-relaxed">
                {blogFormData.description}
              </p>
            )}

            {/* Meta info */}
            <div className="flex items-center gap-6 pt-4 border-t border-zinc-800/50">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <User className="h-4 w-4" />
                <span>Tabsir</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Calendar className="h-4 w-4" />
                <time>
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Clock className="h-4 w-4" />
                <span>{blogFormData.estReadTime} min read</span>
              </div>
            </div>

            {/* Tags */}
            {blogFormData.tags && blogFormData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blogFormData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs font-medium bg-zinc-800/50 text-zinc-300 rounded-full border border-zinc-700/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Article body */}
          <article className="article-body text-lg text-zinc-300 leading-relaxed space-y-8">
            {parseContent(blogFormData.content)}
          </article>

          {/* Footer spacing */}
          <div className="h-24" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
