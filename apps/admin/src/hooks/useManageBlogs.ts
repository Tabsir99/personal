import { deleteBlog, toggleBlogStatus } from "@/actions/blogActions";
import {
  NotificationType,
  useNotification,
} from "@/context/NotificationContext";
import { useWriteBlogContext } from "@/context/WriteBlogContext";
import { AdminBlogListItem, Blog, BlogFormData } from "@/types/blogTypes";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { invalidateBlogOverview } from "./useInvalidateCache";
import { LocalStorageKeys } from "@/types/types";

interface UseManageBlogsProps {
  setIsModalOpen: Dispatch<
    SetStateAction<{ confirm: boolean; share: boolean; thumbnail: boolean }>
  >;
}
export default function useManageBlogs({
  setIsModalOpen,
}: UseManageBlogsProps) {
  const { addNotification } = useNotification();
  const router = useRouter();

  const [selectedBlog, setSelectedBlog] = useState<AdminBlogListItem | null>(
    null
  );

  const { setBlogFormData, categories } = useWriteBlogContext();

  const handleCategoryChange = (newCategory = "") => {
    if (!newCategory) {
      return router.push(`/dashboard/manage-posts`);
    }
    router.push(
      `/dashboard/manage-posts?category=${newCategory.toLowerCase()}`
    );
  };

  const handleBlogDelete = () => {
    setIsModalOpen({ confirm: true, share: false, thumbnail: false });
  };

  const confirmDelete = async () => {
    setSelectedBlog(null);

    if (!selectedBlog) return addNotification({ message: "No blog selected" });
    document.body.style.cursor = "wait";
    const res = await deleteBlog({
      blogId: selectedBlog.blogId,
      categoryId: selectedBlog.categoryId,
    });
    document.body.removeAttribute("style");
    if (res.status === "success") {
      addNotification({
        message: "Blog has been deleted",
        type: NotificationType.INFO,
      });
    } else {
      addNotification({ message: res.message, type: NotificationType.ERROR });
    }

    // Invalidate SWR cache and do Optimistic UI update
    invalidateBlogOverview({
      selectedBlog: selectedBlog!,
      categories: categories!,
      type: "delete",
    });

    closeModal();
  };

  const handleBlogEdit = async () => {
    setSelectedBlog(null);
    localStorage.clear();

    document.body.style.cursor = "wait";
    const res = await fetch(
      `/api/local/blogs?blogId=${selectedBlog?.blogId}&status=${selectedBlog?.status}`
    );
    if (!res.ok) {
      document.body.style.removeProperty("cursor");
      return addNotification({ message: res.statusText });
    }
    const data = (await res.json()) as Blog;

    document.body.style.removeProperty("cursor");
    if (!data) return addNotification({ message: "No blog found" });
    // Turn the metadata to unstructured blog data
    const metaData = data.blogMetadata;
    const blogFormData: BlogFormData = {
      blogDescription: metaData.blogDescription,
      blogName: data.blogName,
      blogTags: metaData.blogTags,
      categoryId: data.categoryId,
      recommendationTitle: metaData.recommendationTitle,
      socialTitle: metaData.socialTitle,
      featuredImageUrl: metaData.featuredImageUrl,
      type: data.type,
      content: JSON.parse(data.content),
      estReadTime: metaData.estReadTime,
      link: data.link,
      status: data.status,
      blogId: data.blogId,
    };

    localStorage.setItem(
      LocalStorageKeys.BlogFormData,
      JSON.stringify(blogFormData)
    );
    setBlogFormData(blogFormData);
    router.push("./write-blog");
  };

  const handleStatus = async () => {
    setSelectedBlog(null);
    document.body.style.cursor = "wait";
    const res = await toggleBlogStatus(selectedBlog?.link as string);

    if (res.status !== "success") {
      addNotification({
        message: res.message,
        type: NotificationType.ERROR,
      });
      document.body.removeAttribute("style");
    } else {
      addNotification({ message: res.message, type: NotificationType.SUCCESS });
      document.body.removeAttribute("style");
    }

    invalidateBlogOverview({
      selectedBlog: selectedBlog!,
      categories: categories!,
      type: "status",
    });
  };

  const closeModal = () => {
    setIsModalOpen({ confirm: false, share: false, thumbnail: false });
    setSelectedBlog(null);
  };

  const handleShareBlog = () => {
    setIsModalOpen({ confirm: false, share: true, thumbnail: false });
  };

  const handleThumbnail = () => {
    setIsModalOpen({ confirm: false, share: false, thumbnail: true });
  };

  return {
    handleCategoryChange,
    setSelectedBlog,
    confirmDelete,
    handleBlogEdit,
    handleStatus,
    handleBlogDelete,
    closeModal,
    handleShareBlog,
    handleThumbnail,
    selectedBlog,
  };
}
