import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock } from "lucide-react";
import { BlogFormData, BlogStatus } from "@/types/blogTypes";
import BlogMenu from "./BlogMenu";
import Link from "next/link";
import { getTimeSince } from "@/lib/appUtils";

export default function DraftBlogCard({
  blog,
  confirmDelete,
}: {
  blog: Partial<BlogFormData>;
  confirmDelete: (blogId: string) => void;
}) {
  return (
    <Link draggable={false} href={`write-blog/${blog.blogId}`}>
      <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer">
        <CardHeader className="pb-2 pt-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold text-zinc-100">
              {blog?.title}
            </CardTitle>

            <BlogMenu
              blogName={blog.title!}
              status={BlogStatus.Draft}
              blogId={blog.blogId!}
              confirmDelete={() => confirmDelete(blog.blogId!)}
            />
          </div>
          <CardDescription className="text-zinc-400 line-clamp-2">
            {blog.description || "No description yet..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-2">
          <div className="flex flex-wrap gap-2">
            {blog.tags?.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-zinc-700 text-zinc-300 text-xs"
              >
                {tag}
              </Badge>
            ))}
            {blog.tags?.length === 0 && (
              <span className="text-zinc-500 text-sm italic">No tags yet</span>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-2 pb-4 flex justify-between items-center text-sm text-zinc-500">
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            <span>Updated {getTimeSince(blog.updatedAt || 0)}</span>
          </div>
          <div className="flex items-center">
            <span>{blog.estReadTime} min read </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
