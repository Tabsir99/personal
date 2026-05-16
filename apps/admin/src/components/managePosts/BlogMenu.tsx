import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pencil,
  Trash2,
  Power,
  Share2,
  Image,
  Star,
  MoreHorizontal,
} from "lucide-react";
import useUIStore from "@/stores/UIStore";
import { Button } from "../ui/button";
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
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Open menu"
            className="text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        }
      />

      <DropdownMenuContent
        align="end"
        className="w-48"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          onClick={handleBlogEdit}
          className="flex items-center space-x-2"
        >
          <Pencil className="w-4 h-4" />
          <span>Edit Post</span>
        </DropdownMenuItem>

        {isDraft || (
          <DropdownMenuItem
            onClick={() =>
              openModal("blogThumbnail", { data: { blogId, thumbnailUrl } })
            }
            className="flex items-center space-x-2"
          >
            <Image className="w-4 h-4" />
            <span>Change Thumbnail</span>
          </DropdownMenuItem>
        )}

        {isDraft || <DropdownMenuSeparator />}

        {toggleStatus &&
          (isDraft || (
            <DropdownMenuItem
              onClick={() =>
                openModal("confirmation", {
                  data: {
                    message: `Are you sure you want to ${status === "published" ? "unpublish" : "publish"} this post?`,
                    onConfirm: toggleStatus,
                  },
                })
              }
              className="flex items-center space-x-2"
            >
              <Power className="w-4 h-4" />
              <span>
                {status === "published" ? "Unpublish" : "Publish"} Post
              </span>
            </DropdownMenuItem>
          ))}

        {setFeatured && status === BlogStatus.published && (
          <DropdownMenuItem
            onClick={setFeatured}
            className="flex items-center space-x-2"
          >
            <Star className="w-4 h-4" />
            <span>Set as featured</span>
          </DropdownMenuItem>
        )}

        {isDraft || (
          <DropdownMenuItem
            onClick={() =>
              openModal("blogShare", {
                data: {
                  url: `${process.env.NEXT_PUBLIC_BLOGSITE_HOSTNAME}/blogs/${slug}`,
                  title: blogName,
                },
              })
            }
            className="flex items-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Post</span>
          </DropdownMenuItem>
        )}

        {isDraft || <DropdownMenuSeparator />}

        <DropdownMenuItem
          onClick={() => {
            openModal("confirmation", {
              data: {
                message: `Deleting "${blogName}" is irrecoverable.`,
                onConfirm: confirmDelete,
              },
            });
          }}
          className="flex items-center space-x-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Post</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
