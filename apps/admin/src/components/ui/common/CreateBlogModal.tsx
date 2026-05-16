"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FormField } from "@/components/ui/FormField";
import { Kbd } from "@/components/ui/Kbd";
import { startBlogWriting } from "@/actions/blogActions";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { callWithToast } from "@/lib/utils";

export const CreateBlogModal = () => {
  const [newBlogTitle, setNewBlogTitle] = useState("");
  const router = useRouter();

  const { closeCreateDialog, setBlogFormData } = useBlogEditorStore.getState();
  const isOpen = useBlogEditorStore((state) => state.isCreateDialogOpen);

  const handleCreateBlog = async () => {
    const trimmed = newBlogTitle.trim();
    if (!trimmed) return;
    setNewBlogTitle("");
    closeCreateDialog();

    const result = await callWithToast(() => startBlogWriting(trimmed), {
      loading: "Creating blog…",
      success: "Blog created",
      err: "Failed to create blog",
    });

    if (result?.status === "success") {
      setBlogFormData(result.data);
      router.push(`/dashboard/write-blog/${result.data.blogId}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeCreateDialog}>
      <DialogContent>
        <DialogHeader>
          <Eyebrow tone="muted" family="mono">
            New blog
          </Eyebrow>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Create a new blog
          </DialogTitle>
          <DialogDescription>
            Start with a working title. You can rename, retag, and SEO it in the
            metadata panel.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <FormField label="Working title">
            <Input
              id="blogTitle"
              placeholder="Why the dependency boundary matters more than the language"
              value={newBlogTitle}
              onChange={(e) => setNewBlogTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newBlogTitle.trim()) {
                  handleCreateBlog();
                }
              }}
              autoFocus
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeCreateDialog}>
            Cancel
          </Button>
          <DialogClose
            render={
              <Button
                onClick={handleCreateBlog}
                disabled={newBlogTitle.trim() === ""}
                className="gap-1.5"
              >
                <span>Create &amp; edit</span>
                <Kbd
                  size="sm"
                  className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
                >
                  ⏎
                </Kbd>
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
