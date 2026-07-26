"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "premium-ds/dialog";
import { Button } from "premium-ds/button";
import { TextField } from "premium-ds/text-field";
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
      router.push(`/analytics/write-blog/${result.data.blogId}`);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={closeCreateDialog}
      title="New blog"
      description="Start with a working title. You can rename, retag, and SEO it in the metadata panel."
      footer={
        <div className="flex justify-end gap-2.5">
          <Button variant="secondary" onClick={closeCreateDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateBlog}
            disabled={newBlogTitle.trim() === ""}
            iconRight={
              <Kbd
                size="sm"
                className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
              >
                ⏎
              </Kbd>
            }
          >
            Create & edit
          </Button>
        </div>
      }
    >
      <div className="py-2">
        <TextField
          id="blogTitle"
          label="Working title"
          placeholder="Why the dependency boundary matters more than the language"
          value={newBlogTitle}
          onChange={(e) => setNewBlogTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newBlogTitle.trim()) {
              handleCreateBlog();
            }
          }}
          htmlProps={{ autoFocus: true }}
        />
      </div>
    </Dialog>
  );
};
