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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
    const toastId = toast.loading("Publishing...");
    try {
      const result = await publishBlog(blogId);
      if (result.status !== "success") {
        toast.error(result.message || "Failed to publish", { id: toastId });
        setIsPublishing(false);
        return;
      }
      toast.success("Blog published!", { id: toastId });
      router.push("/dashboard/write-blog");
    } catch (error) {
      console.error("Publish error:", error);
      toast.error("Failed to publish", { id: toastId });
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
