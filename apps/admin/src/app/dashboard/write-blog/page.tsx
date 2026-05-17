"use client";
import { useMemo, useState } from "react";
import { FileText, Plus, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DraftBlogCard from "@/components/managePosts/DraftBlogCard";
import { BlogFormData } from "@tabsircg/schemas/blog";
import type { CursorPage } from "@tabsircg/schemas/api";
import { useCustomSWR } from "@/hooks/useCustomSwr";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { PageHeader } from "@/components/ui/common/PageHeader";
import { deleteBlog } from "@/actions/blogActions";
import { DraftBlogCardSkeletonGrid } from "@/components/ui/Skeletons/BlogCardSkeleton";
import { callWithToast } from "@/lib/utils";

export default function WriteBlog() {
  const [search, setSearch] = useState("");
  const { data, isLoading, mutate } = useCustomSWR<CursorPage<BlogFormData>>(
    `/api/blogs?status=draft`,
  );
  const items = data?.items ?? [];

  const filteredBlogs = useMemo(
    () =>
      items.filter((blog) => {
        const term = search.toLowerCase();
        const title = blog.title?.toLowerCase() || "";
        const description = blog.metaDescription?.toLowerCase() || "";
        const tags = blog.tags?.map((tag) => tag.toLowerCase()) || [];
        return (
          title.includes(term) ||
          description.includes(term) ||
          tags.some((tag) => tag.includes(term))
        );
      }),
    [items, search],
  );

  const isEmpty = filteredBlogs.length < 1;
  const showFooter = !isLoading && items.length > 0;

  const confirmDelete = async (id: string) => {
    const result = await callWithToast(() => deleteBlog(id), {
      loading: "Deleting draft…",
      success: "Draft deleted",
      err: "Failed to delete draft",
    });
    if (result?.status === "success") {
      mutate(
        (prev) =>
          prev
            ? { ...prev, items: prev.items.filter((p) => p.blogId !== id) }
            : prev,
        false,
      );
    }
  };

  const { openCreateDialog, openAiDraftDialog } = useBlogEditorStore.getState();

  return (
    <>
      <PageHeader
        title="Blog drafts"
        description="Started but not yet published. Open one to keep writing or spin up a new draft."
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={openCreateDialog}>
              <Plus className="h-3.5 w-3.5" />
              New draft
            </Button>
            <Button variant="outline" onClick={openAiDraftDialog}>
              <Sparkles className="h-3.5 w-3.5" />
              Draft with AI
            </Button>
          </div>
          {!isEmpty && (
            <div className="relative ml-auto w-full max-w-md flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by title, tag…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="overflow-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DraftBlogCardSkeletonGrid count={4} />
            </div>
          ) : isEmpty ? (
            <NoBlogs search={search} />
          ) : (
            <div className="stagger-cascade-tight grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredBlogs
                .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
                .map((blog, index) => (
                  <div
                    key={blog.blogId}
                    style={{ ["--stagger-index" as string]: index }}
                  >
                    <DraftBlogCard
                      blog={blog}
                      confirmDelete={confirmDelete}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {showFooter && (
        <div className="mt-8 inline-flex items-baseline gap-2 rounded-md border border-foreground/6 bg-card px-3 py-2 font-mono text-xs text-muted-foreground">
          <span className="text-foreground">{items.length}</span>
          <span>draft{items.length !== 1 ? "s" : ""}</span>
        </div>
      )}
    </>
  );
}

const NoBlogs = ({ search }: { search: string }) => {
  const { openCreateDialog, openAiDraftDialog } =
    useBlogEditorStore.getState();
  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-lg border border-foreground/6 bg-foreground/2 px-6 py-12 text-center">
      <div className="rounded-md border border-foreground/6 bg-card p-2 text-muted-foreground">
        <FileText className="h-4 w-4" />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {search ? "No drafts match that search" : "No drafts started"}
        </h3>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {search
            ? "Try a different title, tag, or topic."
            : "Spin up a fresh draft or have AI scaffold one for you."}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={openCreateDialog}>
          <Plus className="h-3.5 w-3.5" />
          New draft
        </Button>
        <Button variant="outline" onClick={openAiDraftDialog}>
          <Sparkles className="h-3.5 w-3.5" />
          Draft with AI
        </Button>
      </div>
    </div>
  );
};
