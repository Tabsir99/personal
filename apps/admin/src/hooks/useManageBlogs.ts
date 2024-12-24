import { deleteBlog, toggleBlogStatus } from "@/actions/blogActions";
import {
  NotificationType,
  useNotification,
} from "@/context/NotificationContext";
import { useBlogMetadata } from "@/context/WriteBlogContext";
import {
  AdminBlogMetadata,
  Blog,
  UnstructuredBlogData,
} from "@/types/blogTypes";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { invalidateBlogOverview } from "./useInvalidateCache";

interface UseManageBlogsProps {
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}
export default function useManageBlogs({
  setIsModalOpen,
}: UseManageBlogsProps) {
  const { addNotification } = useNotification();
  const router = useRouter();

  const [selectedBlog, setSelectedBlog] = useState<AdminBlogMetadata | null>(
    null
  );

  const { setBlogData, categories } = useBlogMetadata();

  const handleCategoryChange = (newCategory = "") => {
    if (!newCategory) {
      return router.push(`/admin/dashboard/manage-posts`);
    }
    router.push(
      `/admin/dashboard/manage-posts?category=${newCategory.toLowerCase()}`
    );
  };

  const toggleToolbar = (blogMetadata: AdminBlogMetadata) => {
    setSelectedBlog((prev) => {
      if (prev?.link === blogMetadata.link) {
        return null;
      }
      return blogMetadata;
    });
  };

  const handleBlogDelete = () => {
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    setSelectedBlog(null);
    if (!selectedBlog) return addNotification({ message: "No blog selected" });
    document.body.style.cursor = "wait";
    const res = await deleteBlog({
      blogId: selectedBlog.link,
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

    setIsModalOpen(false);
  };

  const handleBlogEdit = async () => {
    setSelectedBlog(null);
    document.body.style.cursor = "wait";
    const res = await fetch(`/api/blogs?blogId=${selectedBlog?.link}`);
    if (!res.ok) {
      document.body.style.removeProperty("cursor");
      return addNotification({ message: res.statusText });
    }
    const data = (await res.json()) as Blog;

    document.body.style.removeProperty("cursor");
    if (!data) return addNotification({ message: "No blog found" });
    // Turn the metadata to unstructured blog data
    const metaData = data.blogMetadata;
    const unstructuredData: UnstructuredBlogData = {
      blogDescription: metaData.blogDescription,
      blogName: data.blogName,
      blogTags: metaData.blogTags,
      categoryId: data.categoryId,
      createdAt: metaData.createdAt,
      estReadTime: metaData.estReadTime,
      recommendationTitle: metaData.recommendationTitle,
      socialTitle: metaData.socialTitle,
      thumbnailUrl: metaData.thumbnailUrl,
      type: data.type,
    };
    localStorage.setItem("metaData", JSON.stringify(unstructuredData));
    localStorage.setItem("blogHTML", data.content);
    setBlogData(unstructuredData);
    router.push("./write-post");
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

  return {
    handleCategoryChange,
    toggleToolbar,
    confirmDelete,
    handleBlogEdit,
    handleStatus,
    handleBlogDelete,
    setSelectedBlog,
    selectedBlog,
  };
}
