"use client";
import { Plus } from "lucide-react";
import BlogOverview from "@/components/managePosts/BlogOverview";
import { Button } from "@/components/ui/button";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";

const ManagePosts = () => {
  const openCreateBlogDialog = useBlogEditorStore.getState().openCreateDialog;
  return (
    <div className="p-6 bg-zinc-900/60 text-white min-h-screen">
      <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Posts</h1>
        <Button
          onClick={openCreateBlogDialog}
          className="bg-blue-600 hover:bg-blue-600/90 active:scale-95 text-white font-medium py-2 px-4 rounded-md flex items-center gap-2 transition duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Post</span>
        </Button>
      </div>
      <BlogOverview />
    </div>
  );
};

export default ManagePosts;
