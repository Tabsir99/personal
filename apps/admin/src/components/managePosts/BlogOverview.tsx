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
import { Button } from "../ui/button";

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
        <div className="stagger-cascade-tight grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <BlogCardSkeletonGrid />
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => {
              return (
                <div
                  key={post.blogId}
                  style={{ ["--stagger-index" as string]: index }}
                >
                  <CMSBlogCard
                    blog={post}
                    isFeatured={post.blogId === currentFeaturedId}
                    hideStatusBadge={filters.status !== "all"}
                    toggleStatus={toggleStatus}
                    confirmDelete={confirmDelete}
                    setFeatured={setFeatured}
                  />
                </div>
              );
            })
          ) : (
            <div className="col-span-full">
              <EmptyFilters onClear={handleClearFilters} />
            </div>
          )}
        </div>

        <div className="mt-10 inline-flex items-baseline gap-3 rounded-md border border-foreground/6 bg-card px-4 py-2.5 font-mono text-xs text-muted-foreground">
          <span>
            <span className="text-foreground">{items.length}</span> total
          </span>
          <span aria-hidden="true">·</span>
          <span>
            showing <span className="text-foreground">{filteredPosts.length}</span>
          </span>
        </div>
      </div>
    </>
  );
};

function EmptyFilters({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-foreground/8 bg-card/40 px-6 py-10">
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        No blogs match these filters
      </h3>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        Try adjusting status, kind, or schema — or clear all filters to see
        everything you&apos;ve published.
      </p>
      <Button variant="outline" size="sm" onClick={onClear} className="mt-1">
        Clear filters
      </Button>
    </div>
  );
}

export default BlogOverview;
