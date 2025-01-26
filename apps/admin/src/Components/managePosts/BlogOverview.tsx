"use client";

import { useMemo, useState } from "react";

import CMSBlogCard from "./BlogCard";
import BlogMenu from "./BlogMenu";
import ManagePostHead from "./ManageBlogHead";

import useManageBlogs from "@/hooks/useManageBlogs";

import ConfirmationModal from "../ui/Components/ConfirmationModal";
import { AdminBlogMetadata, BlogStatus } from "@/types/blogTypes";
import { useCustomSWR } from "@/hooks/useCustomSwr";
import BlogShareModal from "./BlogShareModal";
import SkeletonLoader from "../ui/Skeletons/BlogCardSkeleton";
import ThumbnailModal from "./ThumbnailModal";

const BlogOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState({
    share: false,
    confirm: false,
    thumbnail: false,
  });

  const {
    confirmDelete,
    handleBlogEdit,
    handleStatus,
    toggleToolbar,
    handleBlogDelete,
    closeModal,
    handleShareBlog,
    handleThumbnail,
    selectedBlog,
  } = useManageBlogs({ setIsModalOpen });

  const [filterBy, setFilterBy] = useState<{
    categoryId: string;
    status: BlogStatus | "";
  }>({ categoryId: "", status: "" });
  const { data, isLoading } = useCustomSWR<AdminBlogMetadata[]>(
    `/api/local/blogOverview${filterBy.categoryId || filterBy.status ? `?categoryId=${filterBy.categoryId}&status=${filterBy.status}` : ""}`
  );

  const filteredPosts = useMemo(() => {
    return (
      data?.filter((blog) => {
        return blog.blogName.includes(searchTerm);
      }) || []
    );
  }, [data, searchTerm]);

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen.confirm}
        message="This will permanently delete the blog, Are you sure?"
        onClose={closeModal}
        onConfirm={confirmDelete}
      />

      <ThumbnailModal
        isOpen={isModalOpen.thumbnail}
        onClose={closeModal}
        blogLink={selectedBlog?.link!}
        currentThumbnail={selectedBlog?.thumbnailUrl!}
      />

      {isModalOpen.share && (
        <BlogShareModal
          onClose={closeModal}
          url={`${process.env.NEXT_PUBLIC_BLOGSITE_HOSTNAME}/blogs/${selectedBlog?.link}`}
        />
      )}

      <ManagePostHead
        handleCategoryChange={(categoryId) => {
          setFilterBy((prev) => ({ ...prev, categoryId }));
        }}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleStatusChange={(status) => {
          setFilterBy((prev) => ({ ...prev, status }));
        }}
      />

      <div className="w-full max-w-7xl mx-auto py-5">
        <div className=" grid grid-cols-2 gap-3">
          {isLoading
            ? [1, 2, 3, 4].map((num) => <SkeletonLoader key={num} />)
            : filteredPosts?.map((post) => {
                return (
                  <div
                    key={post.link}
                    className="bg-neutral-900 rounded-lg h-[13rem] max-w-[35rem] shadow-md py-4 px-6
                 hover:shadow-xl transition-shadow duration-200 relative flex flex-col gap-5
                 justify-between
                 "
                  >
                    <CMSBlogCard blog={post} toggleToolbar={toggleToolbar} />

                    {isModalOpen.confirm || isModalOpen.share || (
                      <BlogMenu
                        blogId={post.link}
                        menuActions={{
                          handleBlogDelete,
                          handleBlogEdit,
                          handleStatus,
                          handleShareBlog,
                          handleThumbnail,
                        }}
                        selectedBlog={selectedBlog}
                      />
                    )}
                  </div>
                );
              })}
        </div>

        {/* Footer */}
        <p className="text-gray-300 font-semibold w-fit bg-neutral-800/40 backdrop-blur-md leading-relaxed mt-10  py-3 px-5 rounded-lg">
          Total Posts: {0} <br />
          Showing: {filteredPosts.length ? "1" : "0"} - {filteredPosts.length}
        </p>
      </div>
    </>
  );
};

export default BlogOverview;
