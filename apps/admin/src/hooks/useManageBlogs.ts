import { deleteBlog, toggleBlogStatus } from "@/actions/blogActions";
import { Blog, BlogFormData } from "@/types/blogTypes";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { invalidateBlogOverview } from "./useInvalidateCache";
import { toast } from "sonner";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";

interface UseManageBlogsProps {
  setIsModalOpen: Dispatch<
    SetStateAction<{ confirm: boolean; share: boolean; thumbnail: boolean }>
  >;
}
export default function useManageBlogs({
  setIsModalOpen,
}: UseManageBlogsProps) {
  const router = useRouter();

  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const setBlogFormData = useBlogEditorStore.getState().setBlogFormData;

  const handleBlogDelete = () => {
    setIsModalOpen({ confirm: true, share: false, thumbnail: false });
  };

  const confirmDelete = async () => {
    closeModal();

    if (!selectedBlog) {
      toast.error("No blog selected");
      return;
    }

    const toastId = toast.loading("Deleting blog...");
    const res = await deleteBlog(selectedBlog.blogId);
    if (res.status === "success") {
      toast.success("Blog has been deleted", { id: toastId });
    } else {
      toast.error(res.message, { id: toastId });
    }

    // Invalidate SWR cache and do Optimistic UI update
    invalidateBlogOverview({
      selectedBlog: selectedBlog!,
      type: "delete",
    });
  };

  const handleBlogEdit = async () => {
    if (!selectedBlog) {
      toast.error("No blog selected");
      return;
    }
    setSelectedBlog(null);

    const toastId = toast.loading("Loading blog...");
    const res = await fetch(`/api/blogs/${selectedBlog.blogId}`);
    if (!res.ok) {
      toast.error(res.statusText, { id: toastId });
      return;
    }
    const data = (await res.json()) as Blog;

    if (!data) {
      toast.error("No blog found", { id: toastId });
      return;
    }
    // Turn the metadata to unstructured blog data
    const blogFormData: BlogFormData = {
      blogDescription: data.blogDescription,
      blogName: data.blogName,
      blogTags: data.blogTags,
      recommendationTitle: data.recommendationTitle,
      socialTitle: data.socialTitle,
      featuredImageUrl: data.featuredImageUrl,
      type: data.type,
      content: JSON.parse(data.content),
      estReadTime: data.estReadTime,
      link: data.link,
      status: data.status,
      blogId: data.blogId,
    };

    setBlogFormData(blogFormData);
    router.push("./write-blog");
  };

  const handleStatus = async () => {
    setSelectedBlog(null);
    const toastId = toast.loading("Updating status...");
    const res = await toggleBlogStatus(selectedBlog?.link as string);

    if (res.status !== "success") {
      toast.error(res.message, { id: toastId });
    } else {
      toast.success(res.message, { id: toastId });
    }

    invalidateBlogOverview({
      selectedBlog: selectedBlog!,
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
