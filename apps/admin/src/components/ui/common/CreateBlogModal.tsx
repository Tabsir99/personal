"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { startBlogWriting } from "@/actions/blogActions";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { callWithToast } from "@/lib/utils";

export const CreateBlogModal = () => {
  const [newBlogTitle, setNewBlogTitle] = useState("");
  const router = useRouter();

  const { closeCreateDialog, setBlogFormData } = useBlogEditorStore.getState();
  const isOpen = useBlogEditorStore((state) => state.isCreateDialogOpen);

  const handleCreateBlog = async () => {
    setNewBlogTitle("");
    await callWithToast(
      async () => {
        const res = await startBlogWriting(newBlogTitle);
        if (res.status === "success") {
          setBlogFormData(res.data!);
          router.push(`/dashboard/write-blog/${res.data?.blogId}`);
        }
      },
      {
        loading: "Creating blog...",
        success: "Blog created",
        err: "Failed to create blog",
      }
    );
    closeCreateDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeCreateDialog}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl">Create a New Blog</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Start writing a new blog post. Give it a title to begin.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="blogTitle" className="text-zinc-300">
            Blog Title
          </Label>
          <Input
            id="blogTitle"
            className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-100"
            placeholder="Enter a title for your blog..."
            value={newBlogTitle}
            onChange={(e) => setNewBlogTitle(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={closeCreateDialog}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleCreateBlog}
            disabled={newBlogTitle.trim() === ""}
          >
            Create & Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
