import Link from "next/link";
import { ArrowSquareOut, Star } from "@phosphor-icons/react";

import { Badge } from "premium-ds/badge";
import { StatusBadge } from "premium-ds/status-badge";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MetricNumber } from "@/components/ui/MetricNumber";
import {
  BlogDraftDB,
  BlogStatus,
  PublishedBlogDB,
} from "@tabsircg/schemas/blog";
import BlogMenu from "./BlogMenu";
import { clientEnv } from "@/config/env.client";



const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function CMSBlogCard({
  blog,
  isFeatured = false,
  hideStatusBadge = false,
  toggleStatus,
  confirmDelete,
  setFeatured,
}: {
  blog: PublishedBlogDB | BlogDraftDB;
  isFeatured?: boolean;
  hideStatusBadge?: boolean;
  toggleStatus: (blogId: string) => void;
  confirmDelete: (blogId: string) => void;
  setFeatured?: (blogId: string) => void;
}) {
  const isPublished = blog.status !== BlogStatus.draft;
  const visibleTags = blog.tags.slice(0, 2);
  const overflowTags = blog.tags.length - visibleTags.length;

  return (
    <div className="group/blog-card tactile-lift flex flex-col justify-between rounded-lg border border-foreground/6 bg-card text-card-foreground shadow-card-rest">
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {isFeatured && (
              <span className="inline-flex items-center gap-1.5">
                <Star
                  size={12}
                  weight="fill"
                  className="fill-warning text-warning"
                  aria-hidden="true"
                />
                <Eyebrow tone="primary" size="xs" family="mono">
                  Featured
                </Eyebrow>
              </span>
            )}
            <h2 className="truncate text-lg leading-snug font-semibold tracking-tight text-foreground transition-colors group-hover/blog-card:text-foreground/90">
              {blog.title}
            </h2>
            <p className="line-clamp-1 text-sm leading-relaxed text-muted-foreground">
              {blog.metaDescription || "No description yet…"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
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
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-foreground/4 hover:text-foreground transition-colors"
              >
                <ArrowSquareOut size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pt-1 pb-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted-foreground">
          {!hideStatusBadge && (
            <>
              <StatusBadge status={blog.status === BlogStatus.published ? "published" : blog.status === BlogStatus.unpublished ? "failed" : "draft"} />
              <span aria-hidden="true">·</span>
            </>
          )}
          <time dateTime={new Date(blog.createdAt!).toISOString()}>
            {dateFormatter.format(new Date(blog.createdAt!))}
          </time>
          <span aria-hidden="true">·</span>
          <span>{blog.readTime} min read</span>
        </div>

        {visibleTags.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {visibleTags.map((tag, index) => (
              <Badge key={index} tone="neutral">
                {tag}
              </Badge>
            ))}
            {overflowTags > 0 && (
              <Badge tone="neutral" variant="outline">+{overflowTags}</Badge>
            )}
          </div>
        )}
      </div>

      {isPublished && (
        <div className="grid grid-cols-3 gap-4 border-t border-foreground/6 px-6 pt-4 pb-4">
          <Stat label="Views" value={blog.stats.views} />
          <Stat label="Score" value={blog.stats.score} />
          <Stat label="Shares" value={blog.stats.shares} />
        </div>
      )}
    </div>
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
