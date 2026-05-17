import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BlogFormData, BlogStatus } from "@tabsircg/schemas/blog";
import BlogMenu from "./BlogMenu";
import { getTimeSince } from "@/lib/appUtils";

export default function DraftBlogCard({
  blog,
  confirmDelete,
}: {
  blog: Partial<BlogFormData>;
  confirmDelete: (blogId: string) => void;
}) {
  const tags = blog.tags ?? [];
  const visibleTags = tags.slice(0, 2);
  const overflowTags = tags.length - visibleTags.length;

  return (
    <Link
      draggable={false}
      href={`write-blog/${blog.blogId}`}
      className="block"
    >
      <Card className="group/draft-card tactile-lift cursor-pointer">
        <CardHeader className="pt-5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-2">
              <Eyebrow tone="muted" size="xs" family="mono">
                Draft
              </Eyebrow>
              <h3 className="truncate text-lg leading-snug font-semibold tracking-tight text-foreground">
                {blog?.title || "Untitled"}
              </h3>
              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {blog.metaDescription || "No description yet…"}
              </p>
            </div>
            <BlogMenu
              blogName={blog.title!}
              status={BlogStatus.draft}
              blogId={blog.blogId!}
              slug={blog.slug ?? ""}
              confirmDelete={() => confirmDelete(blog.blogId!)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-1 pb-4">
          {visibleTags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {visibleTags.map((tag) => (
                <Badge key={tag} variant="neutral">
                  {tag}
                </Badge>
              ))}
              {overflowTags > 0 && (
                <Badge variant="ghost">+{overflowTags}</Badge>
              )}
            </div>
          ) : (
            <Eyebrow tone="muted" size="xs">
              No tags yet
            </Eyebrow>
          )}
        </CardContent>
        <CardFooter className="pt-3 pb-4">
          <div className="flex w-full items-center justify-between font-mono text-xs text-muted-foreground">
            <span>Updated {getTimeSince(blog.updatedAt || 0)}</span>
            <span>{blog.readTime ?? 0} min read</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
