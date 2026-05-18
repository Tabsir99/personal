"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AIBlogMetadata } from "@tabsircg/schemas/ai";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useShallow } from "zustand/shallow";
import { FileText, Star } from "lucide-react";
import { featureBlog } from "@/actions/blogActions";
import { callWithToast } from "@/lib/utils";
import { SuggestionField } from "./ComparsionInput";
import ConfigSingleSelect from "./ConfigSingleSelect";
import { SectionHeader } from "./SectionHeader";
import { FieldLabel } from "@/components/ui/label";

type ProseField = Exclude<keyof AIBlogMetadata, "tags">;

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

interface BasicInfoSectionProps {
  suggestion: AIBlogMetadata | null;
  onApplyField: (key: ProseField) => void;
  onSkipField: (key: ProseField) => void;
}

export default function BasicInfoSection({
  suggestion,
  onApplyField,
  onSkipField,
}: BasicInfoSectionProps) {
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
  const isComplete = Boolean(title && dek && excerpt && kind && schemaType);

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
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="p-6">
        <SectionHeader
          icon={FileText}
          title="Basic Information"
          complete={isComplete}
          size="large"
        />

        <div className="space-y-4">
          <div className="space-y-2">
            <FieldLabel>Blog Title</FieldLabel>
            <SuggestionField
              id="blogTitle"
              onAccept={() => onApplyField("title")}
              onReject={() => onSkipField("title")}
              onChange={(v) => setBlogFormData({ title: v })}
              value={title}
              suggested={suggestion?.title}
              placeholder="Enter blog title..."
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Subtitle / Hook</FieldLabel>
            <SuggestionField
              id="dek"
              value={dek}
              suggested={suggestion?.dek}
              onAccept={() => onApplyField("dek")}
              onReject={() => onSkipField("dek")}
              onChange={(v) => setBlogFormData({ dek: v })}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Excerpt</FieldLabel>
            <SuggestionField
              id="excerpt"
              onAccept={() => onApplyField("excerpt")}
              onReject={() => onSkipField("excerpt")}
              onChange={(v) => setBlogFormData({ excerpt: v })}
              value={excerpt}
              suggested={suggestion?.excerpt}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FieldLabel>Kind</FieldLabel>
              <ConfigSingleSelect
                value={kind}
                onValueChange={(value) => setBlogFormData({ kind: value })}
                field="kinds"
                placeholder="Select kind..."
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Schema Type</FieldLabel>
              <ConfigSingleSelect
                value={schemaType}
                onValueChange={(value) =>
                  setBlogFormData({ schemaType: value })
                }
                field="schemaTypes"
                placeholder="Select schema type..."
              />
            </div>
          </div>

          <div className="space-y-2">
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
