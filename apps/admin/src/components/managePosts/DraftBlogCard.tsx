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
import { BlogFormData, BlogStatus } from "@/schemas/blogSchemas";
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
      <Card className="cursor-pointer transition-all hover:border-border/80">
        <CardHeader className="pb-2 pt-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold">{blog?.title}</CardTitle>

            <BlogMenu
              blogName={blog.title!}
              status={BlogStatus.draft}
              blogId={blog.blogId!}
              confirmDelete={() => confirmDelete(blog.blogId!)}
            />
          </div>
          <CardDescription className="line-clamp-2">
            {blog.metaDescription || "No description yet..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-2">
          <div className="flex flex-wrap gap-2">
            {blog.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {blog.tags?.length === 0 && (
              <span className="text-sm italic text-muted-foreground">
                No tags yet
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between pb-4 pt-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            <span>Updated {getTimeSince(blog.updatedAt || 0)}</span>
          </div>
          <div className="flex items-center">
            <span>{blog.readTime} min read </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
