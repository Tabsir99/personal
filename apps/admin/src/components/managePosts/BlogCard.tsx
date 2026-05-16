import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MetricNumber } from "@/components/ui/MetricNumber";
import {
  BlogDraftDB,
  BlogStatus,
  PublishedBlogDB,
} from "@tabsircg/schemas/blog";
import BlogMenu from "./BlogMenu";
import { clientEnv } from "@/config/env.client";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "success"
  | "destructive"
  | "neutral"
  | "warning"
  | "default"
  | "accent"
  | "outline";

function statusVariant(status: BlogStatus): BadgeVariant {
  switch (status) {
    case BlogStatus.published:
      return "success";
    case BlogStatus.unpublished:
      return "destructive";
    case BlogStatus.draft:
      return "neutral";
    default:
      return "outline";
  }
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function CMSBlogCard({
  blog,
  isFeatured = false,
  toggleStatus,
  confirmDelete,
  setFeatured,
}: {
  blog: PublishedBlogDB | BlogDraftDB;
  isFeatured?: boolean;
  toggleStatus: (blogId: string) => void;
  confirmDelete: (blogId: string) => void;
  setFeatured?: (blogId: string) => void;
}) {
  const isPublished = blog.status !== BlogStatus.draft;
  const visibleTags = blog.tags.slice(0, 2);
  const overflowTags = blog.tags.length - visibleTags.length;

  return (
    <Card className="group/blog-card flex flex-col justify-between transition-shadow hover:shadow-card-hover">
      <CardHeader className="pt-5 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            {isFeatured && (
              <span className="inline-flex items-center gap-1.5">
                <Star
                  className="h-3 w-3 fill-star text-star"
                  aria-hidden="true"
                />
                <Eyebrow tone="primary" size="xs" family="mono">
                  Featured
                </Eyebrow>
              </span>
            )}
            <h2 className="truncate text-lg leading-snug font-semibold tracking-tight text-foreground">
              {blog.title}
            </h2>
            <p className="line-clamp-1 text-sm leading-relaxed text-muted-foreground">
              {blog.metaDescription || "No description yet…"}
            </p>
          </div>

          <div className="flex shrink-0 items-center">
            <BlogMenu
              blogName={blog.title}
              blogId={blog.blogId}
              slug={blog.slug}
              status={blog.status!}
              thumbnailUrl={blog.coverImageUrl}
              toggleStatus={() => toggleStatus(blog.blogId)}
              confirmDelete={() => confirmDelete(blog.blogId)}
              {...(setFeatured
                ? { setFeatured: () => setFeatured(blog.blogId) }
                : {})}
            />

            {isPublished && (
              <Link
                href={`${clientEnv.ADMIN_ORIGIN}/blogs/${blog.slug}`}
                target="_blank"
                title="View Blog"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon-sm" }),
                  "text-muted-foreground hover:text-foreground",
                )}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-1 pb-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[12px] text-muted-foreground">
          <Badge variant={statusVariant(blog.status!)} className="font-sans">
            {blog.status}
          </Badge>
          <span aria-hidden="true">·</span>
          <time dateTime={new Date(blog.createdAt!).toISOString()}>
            {dateFormatter.format(new Date(blog.createdAt!))}
          </time>
          <span aria-hidden="true">·</span>
          <span>{blog.readTime} min read</span>
        </div>

        {visibleTags.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {visibleTags.map((tag, index) => (
              <Badge key={index} variant="neutral">
                {tag}
              </Badge>
            ))}
            {overflowTags > 0 && (
              <Badge variant="ghost">+{overflowTags}</Badge>
            )}
          </div>
        )}
      </CardContent>

      {isPublished && (
        <CardFooter className="grid grid-cols-3 gap-4 pt-4 pb-4">
          <Stat label="Views" value={blog.stats.views} />
          <Stat label="Score" value={blog.stats.score} />
          <Stat label="Shares" value={blog.stats.shares} />
        </CardFooter>
      )}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="flex flex-col gap-1">
      <Eyebrow tone="muted" size="xs">
        {label}
      </Eyebrow>
      <MetricNumber size="md" value={value ?? 0} />
    </div>
  );
}
