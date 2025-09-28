"use client";
import { Plus } from "lucide-react";
import BlogOverview from "@/components/managePosts/BlogOverview";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { PageHeader } from "@/components/ui/common/PageHeader";

const ManagePosts = () => {
  const openCreateBlogDialog = useBlogEditorStore.getState().openCreateDialog;
  return (
    <>
      <PageHeader
        title="Manage Posts"
        actionButton={{
          onClick: openCreateBlogDialog,
          text: (
            <>
              <Plus />
              Create New Blog
            </>
          ),
        }}
      />
      <BlogOverview />
    </>
  );
};

export default ManagePosts;
