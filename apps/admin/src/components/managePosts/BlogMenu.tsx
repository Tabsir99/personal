import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, Power, Share2, Image } from "lucide-react";
import useUIStore from "@/stores/UIStore";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { BlogStatus } from "@/types/blogTypes";

export default function BlogMenu({
  status,
  blogName,
  blogId,
  thumbnailUrl,
  toggleStatus,
  confirmDelete,
}: {
  status: BlogStatus;
  blogName: string;
  blogId: string;
  thumbnailUrl?: string;
  toggleStatus?: () => void;
  confirmDelete: () => void;
}) {
  const openModal = useUIStore.getState().openModal;

  const router = useRouter();
  const handleBlogEdit = () => router.push(`write-blog/${blogId}`);

  const isDraft = status === "draft";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </Button>
        }
      />

      <DropdownMenuContent
        align="end"
        className="w-48 bg-zinc-900 border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          onClick={handleBlogEdit}
          className="flex items-center space-x-2 text-neutral-200 hover:text-white focus:text-white hover:bg-zinc-800 focus:bg-zinc-800"
        >
          <Pencil className="w-4 h-4" />
          <span>Edit Post</span>
        </DropdownMenuItem>

        {isDraft || (
          <DropdownMenuItem
            onClick={() =>
              openModal("blogThumbnail", { data: { blogId, thumbnailUrl } })
            }
            className="flex items-center space-x-2 text-neutral-200 hover:text-white focus:text-white hover:bg-zinc-800 focus:bg-zinc-800"
          >
            <Image className="w-4 h-4" />
            <span>Change Thumbnail</span>
          </DropdownMenuItem>
        )}

        {isDraft || <DropdownMenuSeparator className="bg-zinc-800" />}

        {toggleStatus &&
          (isDraft || (
            <DropdownMenuItem
              onClick={() =>
                openModal("confirmation", {
                  data: {
                    message: `Are you sure you want to ${status === "active" ? "deactivate" : "activate"} this post?`,
                    onConfirm: toggleStatus,
                  },
                })
              }
              className="flex items-center space-x-2 text-neutral-200 hover:text-white focus:text-white hover:bg-zinc-800 focus:bg-zinc-800"
            >
              <Power className="w-4 h-4" />
              <span>
                {status === "active" ? "Deactivate" : "Activate"} Post
              </span>
            </DropdownMenuItem>
          ))}

        {isDraft || (
          <DropdownMenuItem
            onClick={() =>
              openModal("blogShare", {
                data: {
                  url: `${process.env.NEXT_PUBLIC_BLOGSITE_HOSTNAME}/blogs/${blogId}`,
                  title: blogName,
                },
              })
            }
            className="flex items-center space-x-2 text-neutral-200 hover:text-white focus:text-white hover:bg-zinc-800 focus:bg-zinc-800"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Post</span>
          </DropdownMenuItem>
        )}

        {isDraft || <DropdownMenuSeparator className="bg-zinc-800" />}

        <DropdownMenuItem
          onClick={() => {
            openModal("confirmation", {
              data: {
                message: `Deleting "${blogName}" is irrecoverable.`,
                onConfirm: confirmDelete,
              },
            });
          }}
          className="flex items-center space-x-2 text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-zinc-800 focus:bg-zinc-800"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Post</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
