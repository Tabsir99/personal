import { deleteBlog, toggleBlogStatus } from "@/actions/blogActions";
import { callWithToast } from "@/lib/utils";
import { BlogDB } from "@/types/blogTypes";
import { useState } from "react";

export default function useManageBlogs() {
  const [isModalOpen, setIsModalOpen] = useState({
    share: false,
    thumbnail: false,
  });

  const [selectedPost, setSelectedPost] = useState<BlogDB | null>(null);

  const confirmDelete = async (id: string) => {
    await callWithToast(() => deleteBlog(id), {
      loading: "Deleting blog...",
      success: "Blog has been deleted",
      err: "Failed to delete blog",
    });

    // Invalidate SWR cache and do Optimistic UI update
  };

  const handleStatus = async (id: string) => {
    await callWithToast(() => toggleBlogStatus(id), {
      loading: "Toggling blog status...",
      success: "Blog status toggled",
      err: "Failed to toggle blog status",
    });

    // Invalidate SWR cache and do Optimistic UI update
  };

  const closeModal = () => {
    setIsModalOpen({ share: false, thumbnail: false });
  };

  const handleShareBlog = () => {
    setIsModalOpen({ share: true, thumbnail: false });
  };

  const handleThumbnail = () => {
    setIsModalOpen({ share: false, thumbnail: true });
  };

  const handleSelectPost = (post: BlogDB) => {
    setSelectedPost(post);
  };

  return {
    confirmDelete,
    handleStatus,
    closeModal,
    handleShareBlog,
    handleThumbnail,
    handleSelectPost,

    isModalOpen,
    selectedPost,
  };
}

export type UseManageBlogs = ReturnType<typeof useManageBlogs>;
