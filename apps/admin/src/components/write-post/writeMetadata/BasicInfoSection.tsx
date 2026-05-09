"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlogKind, SchemaType } from "@tabsircg/schemas/blog";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useShallow } from "zustand/shallow";
import { FileText, Star } from "lucide-react";
import { featureBlog } from "@/actions/blogActions";
import { callWithToast } from "@/lib/utils";

const KIND_OPTIONS: { value: BlogKind; label: string }[] = [
  { value: "essay", label: "Essay" },
  { value: "deep-dive", label: "Deep Dive" },
  { value: "war-story", label: "War Story" },
  { value: "notes", label: "Notes" },
];

function formatRelative(ms: number): string {
  const diff = Date.now() - ms;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BasicInfoSection() {
  const { setBlogFormData } = useBlogEditorStore.getState();
  const [isFeaturing, startFeaturing] = useTransition();
  const [optimisticFeaturedAt, setOptimisticFeaturedAt] = useState<
    number | null
  >(null);

  const [title, dek, excerpt, kind, schemaType, parentBlogId, featuredAt] =
    useBlogEditorStore(
      useShallow((state) => {
        const d = state.blogFormData;
        return [
          d.title,
          d.dek,
          d.excerpt,
          d.kind,
          d.schemaType,
          d.parentBlogId,
          d.featuredAt,
        ];
      }),
    );

  const effectiveFeaturedAt = optimisticFeaturedAt ?? featuredAt;
  const canFeature = parentBlogId != null;

  const handleSetFeatured = () => {
    if (!parentBlogId) return;
    startFeaturing(async () => {
      const now = Date.now();
      const result = await callWithToast(() => featureBlog(parentBlogId), {
        loading: "Setting as featured...",
        success: "Set as featured",
        err: "Failed to set as featured",
      });
      if (result?.status === "success") {
        setOptimisticFeaturedAt(now);
        setBlogFormData({ featuredAt: now });
      }
    });
  };

  return (
    <Card className="bg-card/70 border-border">
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-medium">Basic Information</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="blogTitle"
              className="text-sm font-medium text-foreground/80"
            >
              Blog Title *
            </Label>
            <Input
              id="blogTitle"
              placeholder="Enter your blog title..."
              value={title}
              onChange={(e) => setBlogFormData({ title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="dek"
              className="text-sm font-medium text-foreground/80"
            >
              Subtitle / Hook
            </Label>
            <Textarea
              id="dek"
              rows={2}
              placeholder="A short hook displayed beneath the title..."
              value={dek}
              onChange={(e) => setBlogFormData({ dek: e.target.value })}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="excerpt"
              className="text-sm font-medium text-foreground/80"
            >
              Excerpt
            </Label>
            <Textarea
              id="excerpt"
              rows={3}
              placeholder="One- or two-sentence summary shown on blog list cards and SEO previews..."
              value={excerpt}
              onChange={(e) => setBlogFormData({ excerpt: e.target.value })}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground/80">
                Kind
              </Label>
              <Select
                value={kind}
                onValueChange={(value: BlogKind) =>
                  setBlogFormData({ kind: value })
                }
              >
                <SelectTrigger className="capitalize">
                  <SelectValue placeholder="Select kind..." />
                </SelectTrigger>
                <SelectContent>
                  {KIND_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground/80">
                Schema Type
              </Label>
              <Select
                value={schemaType}
                onValueChange={(value: SchemaType) =>
                  setBlogFormData({ schemaType: value })
                }
              >
                <SelectTrigger className="capitalize">
                  <SelectValue placeholder="Select schema type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SchemaType.Article}>Article</SelectItem>
                  <SelectItem value={SchemaType.BlogPosting}>
                    Blog Posting
                  </SelectItem>
                  <SelectItem value={SchemaType.NewsArticle}>
                    News Article
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground/80">
              Featured
            </Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSetFeatured}
                disabled={!canFeature || isFeaturing}
                className="flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                Set as featured (now)
              </Button>
              <span className="text-xs text-muted-foreground">
                {!canFeature
                  ? "Publish first to feature this post."
                  : effectiveFeaturedAt != null
                    ? `Currently featured: ${formatRelative(effectiveFeaturedAt)}`
                    : "Not featured."}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
