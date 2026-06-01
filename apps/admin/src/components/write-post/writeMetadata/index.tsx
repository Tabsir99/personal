"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import BasicInfoSection from "./BasicInfoSection";
import CoverImageSection from "./CoverImageSection";
import SeoSocialSection from "./SeoSocialSection";
import TagsSection from "./TagsSection";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useShallow } from "zustand/shallow";
import { generateBlogMetadata } from "@/actions/aiActions";
import { callWithToast } from "@/lib/utils";
import type { AIBlogMetadata } from "@tabsircg/schemas/ai";
import type { BlogFormData } from "@tabsircg/schemas/blog";
import { docToText } from "@open-notion/editor";
import {
  GenerateMetadataButton,
  SuggestionsActionBar,
} from "./GenerateMetadataBtn";

type ProseField = Exclude<keyof AIBlogMetadata, "tags">;

const PROSE_FIELDS: ProseField[] = [
  "title",
  "dek",
  "excerpt",
  "seoTitle",
  "metaDescription",
  "socialTitle",
  "socialDescription",
];

const norm = (s: string | undefined) => (s ?? "").trim().toLowerCase();
const differs = (a: string | undefined, b: string | undefined) =>
  norm(a) !== norm(b);

export default function WriteMetadataComp({
  closeSidebar,
  showSidebar,
}: {
  closeSidebar: () => void;
  showSidebar: boolean;
}) {
  const { setBlogFormData, addTag, removeTag } = useBlogEditorStore.getState();
  const [isGenerating, startGenerating] = useTransition();
  const [suggestion, setSuggestion] = useState<AIBlogMetadata | null>(null);

  const { content, kind, ...currentValues } = useBlogEditorStore(
    useShallow((state) => ({
      title: state.blogFormData.title,
      dek: state.blogFormData.dek,
      excerpt: state.blogFormData.excerpt,
      seoTitle: state.blogFormData.seoTitle,
      metaDescription: state.blogFormData.metaDescription,
      socialTitle: state.blogFormData.socialTitle,
      socialDescription: state.blogFormData.socialDescription,
      tags: state.blogFormData.tags,

      content: state.blogFormData.content,
      kind: state.blogFormData.kind,
    })),
  );

  const hasContent = (content?.content?.length ?? 0) > 0;

  const handleGenerate = () => {
    if (!hasContent) return;
    startGenerating(async () => {
      const textContent = await docToText(content);
      if (!textContent) return;
      const result = await callWithToast(
        () => generateBlogMetadata(textContent),
        {
          loading: "Researching with web search…",
          success: "Suggestions ready",
          err: "Failed to generate metadata",
        },
      );
      if (result?.status === "success") {
        setSuggestion(result.data);
      }
    });
  };

  const skipField = (key: ProseField) => {
    setSuggestion((prev) => {
      if (!prev) return null;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const applyField = (key: ProseField) => {
    const value = suggestion?.[key];
    if (typeof value !== "string" || !value) return;
    setBlogFormData({ [key]: value } as Partial<BlogFormData>);
    skipField(key);
  };

  const applyTagAddition = (tag: string) => {
    addTag(tag);
  };

  const applyTagRemoval = (tag: string) => {
    removeTag(tag);
  };

  const dismissTagAddition = (tag: string) => {
    setSuggestion((prev) =>
      prev ? { ...prev, tags: prev.tags.filter((t) => t !== tag) } : prev,
    );
  };

  const dismissTagRemoval = (tag: string) => {
    setSuggestion((prev) =>
      prev ? { ...prev, tags: [...prev.tags, tag] } : prev,
    );
  };

  const changeCount = useMemo(() => {
    if (!suggestion) return 0;
    let n = 0;
    for (const k of PROSE_FIELDS) {
      const sug = suggestion[k];
      if (sug && differs(currentValues[k], sug)) n++;
    }
    if (suggestion.tags) {
      const cur = new Set(currentValues.tags ?? []);
      const sug = new Set(suggestion.tags);
      const additions = suggestion.tags.filter((t) => !cur.has(t));
      const removals = (currentValues.tags ?? []).filter((t) => !sug.has(t));
      if (additions.length > 0 || removals.length > 0) n++;
    }
    return n;
  }, [suggestion, currentValues]);

  useEffect(() => {
    if (suggestion && changeCount === 0) {
      setSuggestion(null);
    }
  }, [suggestion, changeCount]);

  const handleApplyAll = () => {
    if (!suggestion) return;

    const partial: Partial<BlogFormData> = {};
    for (const key of PROSE_FIELDS) {
      const value = suggestion[key];
      if (
        typeof value === "string" &&
        value &&
        differs(currentValues[key], value)
      ) {
        (partial as Record<string, unknown>)[key] = value;
      }
    }
    if (Object.keys(partial).length > 0) {
      setBlogFormData(partial);
    }

    if (suggestion.tags) {
      const curSet = new Set(currentValues.tags ?? []);
      const sugSet = new Set(suggestion.tags);
      for (const t of suggestion.tags) if (!curSet.has(t)) addTag(t);
      for (const t of currentValues.tags ?? [])
        if (!sugSet.has(t)) removeTag(t);
    }

    setSuggestion(null);
  };

  const handleDiscard = () => setSuggestion(null);

  return (
    <Sheet open={showSidebar} onOpenChange={closeSidebar}>
      <SheetContent side="right" className="border-border p-0 overflow-hidden">
        <SheetHeader className="px-6 py-6 border-b border-border bg-card/40">
          <SheetTitle className="text-lg font-semibold tracking-tight text-left">
            Blog Metadata
          </SheetTitle>
          <SheetDescription className="mt-1 text-sm text-muted-foreground text-left">
            Configure your blog's SEO and display settings
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto h-[calc(100vh-120px)] flex flex-col gap-4">
          {!suggestion ? (
            <GenerateMetadataButton
              onClick={handleGenerate}
              loading={isGenerating}
              hasGenerated={!!suggestion}
              disabled={!hasContent}
              className="self-center"
            />
          ) : (
            <SuggestionsActionBar
              count={changeCount}
              onApplyAll={handleApplyAll}
              onDiscardAll={handleDiscard}
            />
          )}
          <Separator className="bg-border" />

          <div className="space-y-6 p-6">
            <BasicInfoSection
              suggestion={suggestion}
              onApplyField={applyField}
              onSkipField={skipField}
            />
            <TagsSection
              suggestion={suggestion}
              onApplyTagAddition={applyTagAddition}
              onApplyTagRemoval={applyTagRemoval}
              onDismissTagAddition={dismissTagAddition}
              onDismissTagRemoval={dismissTagRemoval}
            />
            <CoverImageSection />
            <SeoSocialSection
              suggestion={suggestion}
              onApplyField={applyField}
              onSkipField={skipField}
            />

            <Separator className="bg-border" />

            <div className="flex justify-end">
              <Button
                onClick={closeSidebar}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
              >
                Save Metadata
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
