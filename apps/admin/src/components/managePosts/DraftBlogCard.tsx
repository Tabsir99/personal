import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit, Trash2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { BlogFormData } from "@/types/blogTypes";

export default function DraftBlogCard({
  blog,
}: {
  blog: Partial<BlogFormData>;
}) {
  const router = useRouter();
  // Calculate time since last update
  const handleEditBlog = (id: string) => {
    router.push(`write-blog/${id}`);
  };

  const handleDeleteBlog = (id: String) => {
    console.log(id);
  };

  const getTimeSince = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    if (interval === 1) return "yesterday";

    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    if (interval === 1) return "1 hour ago";

    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;

    return "just now";
  };

  return (
    <Card
      key={blog.blogId!}
      className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
      onClick={() => handleEditBlog(blog.blogId!)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-zinc-100">
            {blog?.blogName}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-zinc-900 border-zinc-800 text-zinc-100"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                className="cursor-pointer hover:bg-zinc-800"
                onClick={() => handleEditBlog(blog.blogId!)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem
                className="cursor-pointer text-red-500 hover:bg-zinc-800"
                onClick={() => handleDeleteBlog(blog.blogId!)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-zinc-400 line-clamp-2">
          {blog.blogDescription || "No description yet..."}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex flex-wrap gap-2">
          {blog.blogTags?.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-zinc-700 text-zinc-300 text-xs"
            >
              {tag}
            </Badge>
          ))}
          {blog.blogTags?.length === 0 && (
            <span className="text-zinc-500 text-sm italic">No tags yet</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-3 flex justify-between items-center text-sm text-zinc-500">
        <div className="flex items-center">
          <Clock className="mr-1 h-3 w-3" />
          <span>Updated {getTimeSince(blog.updatedAt || 0)}</span>
        </div>
        <div className="flex items-center">
          <span>{blog.estReadTime} min read </span>
        </div>
      </CardFooter>
    </Card>
  );
}
