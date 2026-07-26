"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  Plus,
  MagnifyingGlass,
  Sparkle,
} from "@phosphor-icons/react";

import { Button } from "premium-ds/button";
import { TextField } from "premium-ds/text-field";
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
        <div className="flex flex-wrap items-center gap-6 text-success">
          {!isEmpty && (
            <div className="w-full max-w-md">
              <TextField
                placeholder="Search by title, tag…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leadingIcon={<MagnifyingGlass size={16} />}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={openCreateDialog} iconLeft={<Plus size={14} />}>
              New draft
            </Button>
            <Button
              variant="secondary"
              onClick={openAiDraftDialog}
              iconLeft={<Sparkle size={14} />}
            >
              Draft with AI
            </Button>
          </div>
        </div>

        <div className="overflow-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DraftBlogCardSkeletonGrid count={4} />
            </div>
          ) : isEmpty ? (
            <NoBlogs search={search} />
          ) : (
            <div className="grid stagger-cascade-tight grid-cols-1 gap-4 md:grid-cols-2">
              {filteredBlogs
                .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
                .map((blog, index) => (
                  <div
                    key={blog.blogId}
                    style={{ ["--stagger-index" as string]: index }}
                  >
                    <DraftBlogCard blog={blog} confirmDelete={confirmDelete} />
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
  const { openCreateDialog, openAiDraftDialog } = useBlogEditorStore.getState();
  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-lg border border-foreground/6 bg-foreground/2 px-6 py-12 text-center">
      <div className="rounded-md border border-foreground/6 bg-card p-2 text-muted-foreground">
        <FileText size={16} />
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
        <Button onClick={openCreateDialog} iconLeft={<Plus size={14} />}>
          New draft
        </Button>
        <Button
          variant="secondary"
          onClick={openAiDraftDialog}
          iconLeft={<Sparkle size={14} />}
        >
          Draft with AI
        </Button>
      </div>
    </div>
  );
};
