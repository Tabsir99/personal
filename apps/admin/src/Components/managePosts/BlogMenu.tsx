import React from "react";
import { AdminBlogMetadata } from "@/types/blogTypes";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Pencil,
  Trash2,
  Power,
  Share2,
  Image,
} from "lucide-react";

export default function BlogMenu({
  selectedBlog,
  menuActions,
}: {
  selectedBlog: AdminBlogMetadata | null;
  menuActions: {
    handleBlogEdit: () => void;
    handleBlogDelete: () => void;
    handleStatus: () => void;
    handleShareBlog: () => void;
    handleThumbnail: () => void;
  };
}) {
  return (
    <DropdownMenuContent
      align="end"
      className="w-48 bg-neutral-900 border-neutral-800"
    >
      <DropdownMenuItem
        onClick={menuActions.handleBlogEdit}
        className="flex items-center space-x-2 text-neutral-200 hover:text-white focus:text-white hover:bg-neutral-800 focus:bg-neutral-800"
      >
        <Pencil className="w-4 h-4" />
        <span>Edit Post</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={menuActions.handleThumbnail}
        className="flex items-center space-x-2 text-neutral-200 hover:text-white focus:text-white hover:bg-neutral-800 focus:bg-neutral-800"
      >
        <Image className="w-4 h-4" />
        <span>Change Thumbnail</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator className="bg-neutral-800" />

      <DropdownMenuItem
        onClick={menuActions.handleStatus}
        className="flex items-center space-x-2 text-neutral-200 hover:text-white focus:text-white hover:bg-neutral-800 focus:bg-neutral-800"
      >
        <Power className="w-4 h-4" />
        <span>
          {selectedBlog?.status === "active" ? "Deactivate" : "Activate"} Post
        </span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={menuActions.handleShareBlog}
        className="flex items-center space-x-2 text-neutral-200 hover:text-white focus:text-white hover:bg-neutral-800 focus:bg-neutral-800"
      >
        <Share2 className="w-4 h-4" />
        <span>Share Post</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator className="bg-neutral-800" />

      <DropdownMenuItem
        onClick={menuActions.handleBlogDelete}
        className="flex items-center space-x-2 text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-neutral-800 focus:bg-neutral-800"
      >
        <Trash2 className="w-4 h-4" />
        <span>Delete Post</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
