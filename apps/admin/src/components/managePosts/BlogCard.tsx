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
import { BlogDB, BlogStatus } from "@/types/blogTypes";
import BlogMenu from "./BlogMenu";
import { UseManageBlogs } from "@/hooks/useManageBlogs";

export default function CMSBlogCard({
  blog,
  handleShareBlog,
  handleThumbnail,
  handleStatus,
  confirmDelete,
  handleSelectPost,
}: {
  blog: BlogDB;
  handleShareBlog: UseManageBlogs["handleShareBlog"];
  handleThumbnail: UseManageBlogs["handleThumbnail"];
  handleStatus: UseManageBlogs["handleStatus"];
  confirmDelete: UseManageBlogs["confirmDelete"];
  handleSelectPost: UseManageBlogs["handleSelectPost"];
}) {
  // Get appropriate status color
  const getStatusClass = (status: BlogDB["status"]) => {
    switch (status) {
      case BlogStatus.Active:
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case BlogStatus.Draft:
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case BlogStatus.Inactive:
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const statusClass = getStatusClass(blog.status);

  const title = blog.status === BlogStatus.Draft ? blog.draftTitle : blog.title;
  const description =
    blog.status === BlogStatus.Draft ? blog.draftDescription : blog.description;
  const tags = blog.status === BlogStatus.Draft ? blog.draftTags : blog.tags;
  const stats =
    blog.status === BlogStatus.Draft
      ? {
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
        }
      : blog.stats;
  const estReadTime =
    blog.status === BlogStatus.Draft ? blog.draftEstReadTime : blog.estReadTime;

  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all text-white flex flex-col justify-between">
      <CardHeader className="pb-3 pt-5">
        <div className="flex justify-between items-start gap-4">
          {/* Blog Title */}
          <div className="flex flex-col space-y-2">
            <h2 className="text-xl font-bold text-zinc-100 capitalize">
              {title}
            </h2>

            {/* Blog Description - single line with ellipsis */}
            <p className="text-zinc-400 text-sm line-clamp-1">{description}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center">
            <BlogMenu
              blogName={title}
              blogId={blog.blogId}
              status={blog.status!}
              actions={{
                handleShareBlog,
                handleThumbnail,
                handleStatus,
                confirmDelete,
                handleSelectPost: () => handleSelectPost(blog),
              }}
            />

            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            >
              <Link
                href={`${process.env.NEXT_PUBLIC_BLOGSITE_HOSTNAME}/blogs/${blog.link}`}
                target="_blank"
                title="View Blog"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4 pt-2">
        <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400">
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
            <span>{estReadTime} min read</span>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="border-zinc-700 text-zinc-300 text-xs"
              >
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge
                variant="outline"
                className="border-zinc-700 text-zinc-300 text-xs"
              >
                +{tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {/* Stats Section */}
      <CardFooter className="border-t border-zinc-800 pt-4 pb-4 grid grid-cols-4 gap-4">
        <MetricItem
          icon={<Eye className="h-4 w-4 text-zinc-500" />}
          label="Views"
          value={stats.totalViews}
        />
        <MetricItem
          icon={<ThumbsUp className="h-4 w-4 text-zinc-500" />}
          label="Likes"
          value={stats.totalLikes}
        />
        <MetricItem
          icon={<MessageSquare className="h-4 w-4 text-zinc-500" />}
          label="Comments"
          value={stats.totalComments}
        />
        <MetricItem
          icon={<Share2 className="h-4 w-4 text-zinc-500" />}
          label="Shares"
          value={stats.totalShares}
        />
      </CardFooter>
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
      <span className="text-base font-semibold text-zinc-200">
        {value ?? 0}
      </span>
      <span className="text-xs text-zinc-400">{label}</span>
    </div>
  </div>
);
