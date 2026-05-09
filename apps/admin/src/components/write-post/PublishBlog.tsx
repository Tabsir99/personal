import { publishBlog } from "@/actions/blogActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { callWithToast } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PublishBlogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  blogId: string;
}
export const PublishBlog = ({
  blogId,
  isOpen,
  setIsOpen,
}: PublishBlogProps) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const router = useRouter();

  const handlePublish = async () => {
    setIsPublishing(true);
    const result = await callWithToast(() => publishBlog(blogId), {
      loading: "Publishing...",
      success: "Blog published!",
      err: "Failed to publish",
    });
    if (result?.status === "success") {
      router.push("/dashboard/write-blog");
    } else {
      setIsPublishing(false);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Publish Blog</DialogTitle>
          <DialogDescription>
            This will save your draft and publish the blog. Are you sure you
            want to continue?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            disabled={isPublishing}
          >
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? "Publishing..." : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
