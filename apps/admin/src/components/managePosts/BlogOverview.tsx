"use client";

import { useMemo, useState } from "react";
import CMSBlogCard from "./BlogCard";
import ManagePostHead, { BlogFilters } from "./ManageBlogHead";
import { PublishedBlogDB } from "@tabsircg/schemas/blog";
import type { CursorPage } from "@tabsircg/schemas/api";
import { useCustomSWR } from "@/hooks/useCustomSwr";
import { BlogCardSkeletonGrid } from "../ui/Skeletons/BlogCardSkeleton";
import { callWithToast } from "@/lib/utils";
import { deleteBlog, featureBlog, toggleBlogStatus } from "@/actions/blogActions";

const DEFAULT_FILTERS: BlogFilters = {
  status: "all",
  kind: "all",
  schemaType: "all",
};

function buildBlogsQueryString(filters: BlogFilters) {
  const params = new URLSearchParams();
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.kind !== "all") params.set("kind", filters.kind);
  if (filters.schemaType !== "all")
    params.set("schemaType", filters.schemaType);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

const BlogOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<BlogFilters>(DEFAULT_FILTERS);

  const { data, isLoading, mutate } = useCustomSWR<CursorPage<PublishedBlogDB>>(
    `/api/blogs${buildBlogsQueryString(filters)}`,
  );

  const items = data?.items ?? [];

  const currentFeaturedId = useMemo(() => {
    let bestId: string | null = null;
    let bestAt = -Infinity;
    for (const b of items) {
      if (b.featuredAt != null && b.featuredAt > bestAt) {
        bestAt = b.featuredAt;
        bestId = b.blogId;
      }
    }
    return bestId;
  }, [items]);

  const filteredPosts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return items;
    return items.filter(
      (blog) =>
        blog.title?.toLowerCase().includes(term) ||
        blog.metaDescription?.toLowerCase().includes(term),
    );
  }, [items, searchTerm]);

  const handleFilterChange = <K extends keyof BlogFilters>(
    key: K,
    value: BlogFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => setFilters(DEFAULT_FILTERS);

  const toggleStatus = async (blogId: string) => {
    const result = await callWithToast(() => toggleBlogStatus(blogId), {
      loading: "Toggling status...",
      success: "Status toggled successfully",
      err: "Failed to toggle status",
    });
    if (result?.status === "success") mutate();
  };

  const confirmDelete = async (blogId: string) => {
    const result = await callWithToast(() => deleteBlog(blogId), {
      loading: "Deleting blog...",
      success: "Blog deleted successfully",
      err: "Failed to delete blog",
    });
    if (result?.status === "success") {
      mutate(
        (prev) =>
          prev
            ? { ...prev, items: prev.items.filter((p) => p.blogId !== blogId) }
            : prev,
        false,
      );
    }
  };

  const setFeatured = async (blogId: string) => {
    const result = await callWithToast(() => featureBlog(blogId), {
      loading: "Setting as featured...",
      success: "Set as featured",
      err: "Failed to set as featured",
    });
    if (result?.status === "success") mutate();
  };

  return (
    <>
      <ManagePostHead
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <div className="mx-auto w-full max-w-full py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <BlogCardSkeletonGrid />
          ) : (
            filteredPosts?.map((post) => {
              return (
                <CMSBlogCard
                  key={post.blogId}
                  blog={post}
                  isFeatured={post.blogId === currentFeaturedId}
                  toggleStatus={toggleStatus}
                  confirmDelete={confirmDelete}
                  setFeatured={setFeatured}
                />
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 inline-block rounded-lg bg-muted p-4">
          <p className="font-medium text-muted-foreground">
            Total Posts: {items.length} <br />
            Showing: {filteredPosts.length > 0 ? "1" : "0"} -{" "}
            {filteredPosts.length}
          </p>
        </div>
      </div>
    </>
  );
};

export default BlogOverview;
