"use client";

import {
  DotsThree,
  PencilSimple,
  Trash,
  Power,
  ShareNetwork,
  Image,
  Star,
} from "@phosphor-icons/react";
import useUIStore from "@/stores/UIStore";
import { Button } from "premium-ds/button";
import { Popover } from "premium-ds/popover";
import { useRouter } from "next/navigation";
import { BlogStatus } from "@tabsircg/schemas/blog";

export default function BlogMenu({
  status,
  blogName,
  blogId,
  slug,
  thumbnailUrl,
  toggleStatus,
  confirmDelete,
  setFeatured,
}: {
  status: BlogStatus;
  blogName: string;
  blogId: string;
  slug: string;
  thumbnailUrl?: string;
  toggleStatus?: () => void;
  confirmDelete: () => void;
  setFeatured?: () => void;
}) {
  const openModal = useUIStore.getState().openModal;
  const router = useRouter();
  const handleBlogEdit = () => router.push(`write-blog/${blogId}`);
  const isDraft = status === "draft";

  return (
    <Popover
      side="bottom"
      align="end"
      trigger={
        <Button
          variant="ghost"
          size="sm"
          aria-label="Open menu"
          className="min-w-0 p-1 text-muted-foreground hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <DotsThree size={20} weight="bold" />
        </Button>
      }
    >
      {({ close }) => (
        <div
          className="flex w-48 flex-col rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-dialog"
          onClick={(e) => e.stopPropagation()}
        >
          {!isDraft && (
            <button
              onClick={() => {
                close();
                handleBlogEdit();
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-foreground/4"
            >
              <PencilSimple size={16} />
              <span>Edit Post</span>
            </button>
          )}

          {!isDraft && (
            <button
              onClick={() => {
                close();
                openModal("blogThumbnail", { data: { blogId, thumbnailUrl } });
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-foreground/4"
            >
              <Image size={16} />
              <span>Change Thumbnail</span>
            </button>
          )}

          {!isDraft && <div className="my-1 h-px bg-foreground/6" />}

          {toggleStatus && !isDraft && (
            <button
              onClick={() => {
                close();
                openModal("confirmation", {
                  data: {
                    message: `Are you sure you want to ${status === "published" ? "unpublish" : "publish"} this post?`,
                    onConfirm: toggleStatus,
                  },
                });
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-foreground/4"
            >
              <Power size={16} />
              <span>
                {status === "published" ? "Unpublish" : "Publish"} Post
              </span>
            </button>
          )}

          {setFeatured && status === BlogStatus.published && (
            <button
              onClick={() => {
                close();
                setFeatured();
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-foreground/4"
            >
              <Star size={16} />
              <span>Set as featured</span>
            </button>
          )}

          {!isDraft && (
            <button
              onClick={() => {
                close();
                openModal("blogShare", {
                  data: {
                    url: `${process.env.NEXT_PUBLIC_BLOGSITE_HOSTNAME}/blogs/${slug}`,
                    title: blogName,
                  },
                });
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-foreground/4"
            >
              <ShareNetwork size={16} />
              <span>Share Post</span>
            </button>
          )}

          {!isDraft && <div className="my-1 h-px bg-foreground/6" />}

          <button
            onClick={() => {
              close();
              openModal("confirmation", {
                data: {
                  message: `Deleting "${blogName}" is irrecoverable.`,
                  onConfirm: confirmDelete,
                },
              });
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/8"
          >
            <Trash size={16} />
            <span>Delete Post</span>
          </button>
        </div>
      )}
    </Popover>
  );
}
