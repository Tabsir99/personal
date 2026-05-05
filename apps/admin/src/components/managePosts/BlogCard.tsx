import Link from "next/link";
import {
  ExternalLink,
  Clock,
  Calendar,
  Eye,
  ThumbsUp,
  MessageSquare,
  Share2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlogDraftDB, BlogStatus, PublishedBlogDB } from "@/types/blogTypes";
import BlogMenu from "./BlogMenu";
import { clientEnv } from "@/config/env.client";

export default function CMSBlogCard({
  blog,
  toggleStatus,
  confirmDelete,
}: {
  blog: PublishedBlogDB | BlogDraftDB;
  toggleStatus: (blogId: string) => void;
  confirmDelete: (blogId: string) => void;
}) {
  // Get appropriate status color
  const getStatusClass = (status: BlogStatus) => {
    switch (status) {
      case BlogStatus.Active:
        return "border-primary/20 bg-primary/10 text-primary";
      case BlogStatus.Draft:
        return "border-accent bg-accent text-accent-foreground";
      case BlogStatus.Inactive:
        return "border-destructive/20 bg-destructive/10 text-destructive";
      default:
        return "border-border bg-muted text-muted-foreground";
    }
  };

  const statusClass = getStatusClass(blog.status);

  return (
    <Card className="flex flex-col justify-between transition-all hover:border-border/80">
      <CardHeader className="pb-3 pt-5">
        <div className="flex justify-between items-start gap-4">
          {/* Blog Title */}
          <div className="flex flex-col space-y-2">
            <h2 className="text-xl font-bold capitalize">
              {blog.title}
            </h2>

            {/* Blog Description - single line with ellipsis */}
            <p className="text-sm text-muted-foreground line-clamp-1">
              {blog.description || "No description yet..."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center">
            <BlogMenu
              blogName={blog.title}
              blogId={blog.blogId}
              status={blog.status!}
              thumbnailUrl={blog.featuredImageUrl}
              toggleStatus={() => toggleStatus(blog.blogId)}
              confirmDelete={() => confirmDelete(blog.blogId)}
            />

            {blog.status !== BlogStatus.Draft && (
              <Button
                variant="ghost"
                size="icon"
                render={
                  <Link
                    href={`${clientEnv.BLOG_ORIGIN}/blogs/${blog.link}`}
                    target="_blank"
                    title="View Blog"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                }
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4 pt-2">
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          {/* Status Badge */}
          <Badge
            variant="outline"
            className={`${statusClass} text-xs px-2 py-1`}
          >
            {blog.status}
          </Badge>

          {/* Publication Date */}
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <time>
              {new Date(blog.createdAt!).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>

          {/* Reading Time */}
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span>{blog.estReadTime} min read</span>
          </div>
        </div>

        {/* Tags */}
        {blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {blog.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
            {blog.tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs"
              >
                +{blog.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {/* Stats Section */}
      {blog.status !== BlogStatus.Draft && (
        <CardFooter className="grid grid-cols-4 gap-4 border-t border-border pb-4 pt-4">
          <MetricItem
            icon={<Eye className="h-4 w-4 text-muted-foreground" />}
            label="Views"
            value={blog.stats.views}
          />
          <MetricItem
            icon={<ThumbsUp className="h-4 w-4 text-muted-foreground" />}
            label="Likes"
            value={blog.stats.likes}
          />
          <MetricItem
            icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
            label="Comments"
            value={blog.stats.comments}
          />
          <MetricItem
            icon={<Share2 className="h-4 w-4 text-muted-foreground" />}
            label="Shares"
            value={blog.stats.shares}
          />
        </CardFooter>
      )}
    </Card>
  );
}

// Metric item with icon
const MetricItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
}) => (
  <div className="flex items-center gap-2">
    {icon}
    <div className="flex flex-col">
      <span className="text-base font-semibold text-foreground">
        {value ?? 0}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  </div>
);
