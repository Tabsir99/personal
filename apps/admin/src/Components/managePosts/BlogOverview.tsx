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
import { DropdownMenu } from "@/components/ui/dropdown-menu";

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
    setSelectedBlog,
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

        <BlogShareModal
          onClose={closeModal}
          url={`${process.env.NEXT_PUBLIC_BLOGSITE_HOSTNAME}/blogs/${selectedBlog?.link}`}
          open={isModalOpen.share}
        />

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading
            ? [1, 2, 3, 4].map((num) => <SkeletonLoader key={num} />)
            : filteredPosts?.map((post) => {
                return (
                  <div key={post.link} className="relative">
                    <DropdownMenu
                      onOpenChange={(open) => {
                        if (open) {
                          setSelectedBlog(post);
                        }
                      }}
                    >
                      <CMSBlogCard blog={post} />

                      {isModalOpen.confirm || isModalOpen.share || (
                        <BlogMenu
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
                    </DropdownMenu>
                  </div>
                );
              })}
        </div>

        {/* Footer */}
        <div className="mt-10 bg-neutral-850 rounded-lg p-4 inline-block">
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
