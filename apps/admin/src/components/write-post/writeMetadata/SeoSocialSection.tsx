"use client";

import type { AIBlogMetadata } from "@tabsircg/schemas/ai";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useShallow } from "zustand/shallow";
import { Globe, ShareNetwork } from "@phosphor-icons/react";
import { SuggestionField } from "./ComparsionInput";
import { SectionHeader } from "./SectionHeader";
import { FieldLabel } from "@/components/ui/label";

type ProseField = Exclude<keyof AIBlogMetadata, "tags">;

interface SeoSocialSectionProps {
  suggestion: AIBlogMetadata | null;
  onApplyField: (key: ProseField) => void;
  onSkipField: (key: ProseField) => void;
}

export default function SeoSocialSection({
  suggestion,
  onApplyField,
  onSkipField,
}: SeoSocialSectionProps) {
  const { setBlogFormData } = useBlogEditorStore.getState();

  const [seoTitle, metaDescription, socialTitle, socialDescription] =
    useBlogEditorStore(
      useShallow((state) => {
        const d = state.blogFormData;
        return [
          d.seoTitle,
          d.metaDescription,
          d.socialTitle,
          d.socialDescription,
        ];
      }),
    );

  const seoComplete = Boolean(seoTitle && metaDescription);
  const socialComplete = Boolean(socialTitle && socialDescription);

  return (
    <div className="rounded-lg border border-border bg-card/60 p-6 space-y-6">
      <div>
        <SectionHeader icon={Globe} title="SEO" complete={seoComplete} />

        <div className="space-y-4">
          <div className="space-y-2">
            <FieldLabel>SEO Title</FieldLabel>
            <SuggestionField
              id="seoTitle"
              placeholder="Title used in search results..."
              value={seoTitle}
              suggested={suggestion?.seoTitle}
              onAccept={() => onApplyField("seoTitle")}
              onReject={() => onSkipField("seoTitle")}
              onChange={(v) => setBlogFormData({ seoTitle: v })}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>
              Meta Description
            </FieldLabel>
            <SuggestionField
              id="metaDescription"
              placeholder="Brief description shown in search results..."
              value={metaDescription}
              suggested={suggestion?.metaDescription}
              onChange={(v) => setBlogFormData({ metaDescription: v })}
              onAccept={() => onApplyField("metaDescription")}
              onReject={() => onSkipField("metaDescription")}
              className="resize-none"
              type="textarea"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-foreground/6 w-full" />

      <div>
        <SectionHeader
          icon={ShareNetwork}
          title="Social Sharing"
          complete={socialComplete}
        />

        <div className="space-y-4">
          <div className="space-y-2">
            <FieldLabel>
              Social Title
            </FieldLabel>
            <SuggestionField
              id="socialTitle"
              placeholder="Title used when shared on social media..."
              value={socialTitle}
              suggested={suggestion?.socialTitle}
              onAccept={() => onApplyField("socialTitle")}
              onReject={() => onSkipField("socialTitle")}
              onChange={(v) => setBlogFormData({ socialTitle: v })}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>
              Social Description
            </FieldLabel>
            <SuggestionField
              id="socialDescription"
              placeholder="Description shown when shared on social media..."
              value={socialDescription}
              suggested={suggestion?.socialDescription}
              onAccept={() => onApplyField("socialDescription")}
              onReject={() => onSkipField("socialDescription")}
              onChange={(v) => setBlogFormData({ socialDescription: v })}
              className="resize-none"
              type="textarea"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

