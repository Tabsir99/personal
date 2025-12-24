"use client";

import { useMemo, useState } from "react";
import CMSBlogCard from "./BlogCard";
import ManagePostHead from "./ManageBlogHead";
import { PublishedBlogDB, BlogStatus } from "@/types/blogTypes";
import { useCustomSWR } from "@/hooks/useCustomSwr";
import { BlogCardSkeletonGrid } from "../ui/Skeletons/BlogCardSkeleton";
import { callWithToast } from "@/lib/utils";
import { deleteBlog, toggleBlogStatus } from "@/actions/blogActions";

const BlogOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [filterBy, setFilterBy] = useState<{
    status: BlogStatus | "";
  }>({ status: "" });

  const { data, isLoading } = useCustomSWR<PublishedBlogDB[]>(
    `/api/blogs?=content=false&status=${filterBy.status}`
  );

  const filteredPosts = useMemo(() => {
    return (
      data?.filter((blog) => {
        return (
          blog.title?.includes(searchTerm) ||
          blog.description?.includes(searchTerm)
        );
      }) || []
    );
  }, [data, searchTerm]);

  const toggleStatus = async (blogId: string) => {
    await callWithToast(async () => toggleBlogStatus(blogId), {
      loading: "Toggling status...",
      success: "Status toggled successfully",
      err: "Failed to toggle status",
    });
  };

  const confirmDelete = async (blogId: string) => {
    await callWithToast(async () => deleteBlog(blogId), {
      loading: "Deleting blog...",
      success: "Blog deleted successfully",
      err: "Failed to delete blog",
    });
  };

  return (
    <>
      <ManagePostHead
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleStatusChange={(status) => {
          setFilterBy((prev) => ({ ...prev, status }));
        }}
      />

      <div className="w-full max-w-full mx-auto py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <BlogCardSkeletonGrid />
          ) : (
            filteredPosts?.map((post) => {
              return (
                <CMSBlogCard
                  key={post.blogId}
                  blog={post}
                  toggleStatus={toggleStatus}
                  confirmDelete={confirmDelete}
                />
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 bg-zinc-850 rounded-lg p-4 inline-block">
          <p className="text-gray-300 font-medium">
            Total Posts: {data?.length || 0} <br />
            Showing: {filteredPosts.length > 0 ? "1" : "0"} -{" "}
            {filteredPosts.length}
          </p>
        </div>
      </div>
    </>
  );
};

export default BlogOverview;
