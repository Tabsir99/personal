"use client";
import { useState } from "react";
import { Search, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DraftBlogCard from "@/components/managePosts/DraftBlogCard";
import { BlogFormData } from "@/types/blogTypes";
import { useCustomSWR } from "@/hooks/useCustomSwr";

export default function WriteBlog() {
  const [search, setSearch] = useState("");

  const {
    data = [],
    // isLoading,
    // mutate,
  } = useCustomSWR<BlogFormData[]>(`/api/blogs?status=draft`);

  const filteredBlogs = data.filter(
    (blog) =>
      blog.blogName?.toLowerCase().includes(search.toLowerCase()) ||
      blog.blogDescription?.toLowerCase().includes(search.toLowerCase()) ||
      blog.blogTags?.some((tag) =>
        tag.toLowerCase().includes(search.toLowerCase())
      )
  );

  return (
    <div className="flex flex-col h-screen bg-zinc-900/60 text-zinc-100">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
        <h1 className="text-2xl font-bold">Blog Drafts</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="grid grid-cols-1 gap-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-1/2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
              <Input
                className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100"
                placeholder="Search blogs by title, content or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Blog List */}
          <div className="h-[calc(100vh-220px)] overflow-auto">
            <div className="grid grid-cols-2 gap-4">
              {filteredBlogs.length > 0 ? (
                filteredBlogs
                  .sort((a, b) => {
                    return b.updatedAt! - a.updatedAt!;
                  })
                  .map((blog) => (
                    <DraftBlogCard blog={blog} key={blog.blogId} />
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Sparkles className="h-12 w-12 text-zinc-600 mb-4" />
                  <h3 className="text-xl font-medium text-zinc-300">
                    No drafts found
                  </h3>
                  <p className="text-zinc-500 mt-2 mb-6">
                    {search
                      ? "Try a different search term"
                      : "Create your first blog post to get started"}
                  </p>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    // onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create a New Blog
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-zinc-800 text-zinc-500 text-sm">
        <div className="flex justify-between items-center">
          {data.length} draft{data.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
