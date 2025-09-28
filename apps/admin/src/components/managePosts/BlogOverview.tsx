"use client";

import { useMemo, useState } from "react";

import CMSBlogCard from "./BlogCard";
import ManagePostHead from "./ManageBlogHead";
import useManageBlogs from "@/hooks/useManageBlogs";
import { BlogDB, BlogStatus, PublishedBlogEditingDB } from "@/types/blogTypes";
import { useCustomSWR } from "@/hooks/useCustomSwr";
import BlogShareModal from "./BlogShareModal";
import { BlogCardSkeletonGrid } from "../ui/Skeletons/BlogCardSkeleton";
import ThumbnailModal from "./ThumbnailModal";

const BlogOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    confirmDelete,
    handleStatus,
    closeModal,
    handleShareBlog,
    handleThumbnail,
    handleSelectPost,

    isModalOpen,
    selectedPost,
  } = useManageBlogs();

  const [filterBy, setFilterBy] = useState<{
    status: BlogDB["status"] | "";
  }>({ status: "" });

  const { data, isLoading } = useCustomSWR<PublishedBlogEditingDB[]>(
    `/api/blogs?=content=false&status=${filterBy.status}`
  );

  const filteredPosts = useMemo(() => {
    return (
      data?.filter((blog) => {
        return (
          blog.title?.includes(searchTerm) ||
          blog.draftTitle?.includes(searchTerm)
        );
      }) || []
    );
  }, [data, searchTerm]);

  return (
    <>
      {selectedPost && (
        <ThumbnailModal
          isOpen={isModalOpen.thumbnail}
          onClose={closeModal}
          blogLink={selectedPost.link}
          currentThumbnail={
            selectedPost.status === BlogStatus.Draft
              ? undefined
              : selectedPost.featuredImageUrl
          }
          draftThumbnail={
            selectedPost.status === BlogStatus.Draft
              ? selectedPost.draftFeaturedImageUrl
              : undefined
          }
        />
      )}
      {selectedPost && (
        <BlogShareModal
          onClose={closeModal}
          url={`${process.env.NEXT_PUBLIC_BLOGSITE_HOSTNAME}/blogs/${selectedPost.link}`}
          open={isModalOpen.share}
        />
      )}

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
                  handleShareBlog={handleShareBlog}
                  handleThumbnail={handleThumbnail}
                  handleStatus={handleStatus}
                  confirmDelete={confirmDelete}
                  handleSelectPost={handleSelectPost}
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
