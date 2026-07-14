import { publishBlog } from "@/actions/blogActions";
import { Button } from "premium-ds/button";
import { Dialog } from "premium-ds/dialog";
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
      router.push("/analytics/write-blog");
    } else {
      setIsPublishing(false);
      setIsOpen(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={setIsOpen}
      title="Publish Blog"
      description="This will save your draft and publish the blog. Are you sure you want to continue?"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            disabled={isPublishing}
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={handlePublish} 
            disabled={isPublishing}
            loading={isPublishing}
          >
            Publish
          </Button>
        </div>
      }
    />
  );
};

