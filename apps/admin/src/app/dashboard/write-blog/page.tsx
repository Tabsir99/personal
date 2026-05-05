"use client";
import { useMemo, useState } from "react";
import { Search, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DraftBlogCard from "@/components/managePosts/DraftBlogCard";
import { BlogFormData } from "@/types/blogTypes";
import { useCustomSWR } from "@/hooks/useCustomSwr";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { PageHeader } from "@/components/ui/common/PageHeader";
import { deleteBlog } from "@/actions/blogActions";
import { DraftBlogCardSkeletonGrid } from "@/components/ui/Skeletons/BlogCardSkeleton";
import { callWithToast } from "@/lib/utils";

export default function WriteBlog() {
  const [search, setSearch] = useState("");

  const {
    data = [],
    isLoading,
    mutate,
  } = useCustomSWR<BlogFormData[]>(`/api/blogs?status=draft`);

  const filteredBlogs = useMemo(
    () =>
      data.filter((blog) => {
        const searchTerm = search.toLowerCase();
        const title = blog.title?.toLowerCase() || "";
        const description = blog.description?.toLowerCase() || "";
        const tags = blog.tags?.map((tag) => tag.toLowerCase()) || [];

        return (
          title.includes(searchTerm) ||
          description.includes(searchTerm) ||
          tags.some((tag) => tag.includes(searchTerm))
        );
      }),
    [data, search],
  );

  const isEmpty = filteredBlogs.length < 1;

  const confirmDelete = async (id: string) => {
    await callWithToast(() => deleteBlog(id), {
      loading: "Deleting draft...",
      success: "Draft has been deleted",
      err: "Failed to delete draft",
    });

    mutate((prev) => prev?.filter((p) => p.blogId !== id), false);
  };

  return (
    <>
      <PageHeader title="Blog Drafts" />

      <div className="flex flex-col gap-4">
        {/* Search and Filters */}
        {isEmpty || (
          <div className="flex flex-col gap-4 items-start justify-between">
            <div className="relative w-full sm:w-1/2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
              <Input
                className="pl-10"
                placeholder="Search blogs by title, content or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Blog List */}
        <div className="h-[calc(100vh-220px)] overflow-auto">
          {isLoading || (isEmpty && <NoBlogs search={search} />)}
          <div className="grid grid-cols-2 gap-4">
            {isLoading ? (
              <DraftBlogCardSkeletonGrid count={4} />
            ) : (
              filteredBlogs
                .sort((a, b) => b.updatedAt! - a.updatedAt!)
                .map((blog) => (
                  <DraftBlogCard
                    blog={blog}
                    key={blog.blogId}
                    confirmDelete={confirmDelete}
                  />
                ))
            )}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="px-6 py-3 border-t border-zinc-800 text-zinc-500 text-sm">
        <div className="flex justify-between items-center">
          {data.length} draft{data.length !== 1 ? "s" : ""}
        </div>
      </div>
    </>
  );
}

const NoBlogs = ({ search }: { search: string }) => {
  const openCreateDialog = useBlogEditorStore().openCreateDialog;
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center mt-12">
      <Sparkles className="h-12 w-12 text-zinc-600 mb-4" />
      <h3 className="text-xl font-medium text-zinc-300">No drafts found</h3>
      <p className="text-zinc-500 mt-2 mb-6">
        {search
          ? "Try a different search term"
          : "Create your first blog post to get started"}
      </p>
      <Button
        className="bg-blue-600 hover:bg-blue-700"
        onClick={openCreateDialog}
      >
        <Plus className="h-4 w-4" />
        Create a New Blog
      </Button>
    </div>
  );
};
