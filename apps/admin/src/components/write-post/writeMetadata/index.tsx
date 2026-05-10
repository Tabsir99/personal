// "use client";

// import { useState, useTransition } from "react";
// import { Sparkles, Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
// } from "@/components/ui/sheet";
// import BasicInfoSection from "./BasicInfoSection";
// import CoverImageSection from "./CoverImageSection";
// import SeoSocialSection from "./SeoSocialSection";
// import TagsSection from "./TagsSection";
// import AIMetadataPreviewModal from "./AIMetadataPreviewModal";
// import { useBlogEditorStore } from "@/stores/BlogEditorStore";
// import { useShallow } from "zustand/shallow";
// import { generateBlogMetadata } from "@/actions/aiActions";
// import { callWithToast } from "@/lib/utils";
// import type { AIBlogMetadata } from "@tabsircg/schemas/ai";
// import type { BlogFormData } from "@tabsircg/schemas/blog";

// export default function WriteMetadataComp({
//   closeSidebar,
//   showSidebar,
// }: {
//   closeSidebar: () => void;
//   showSidebar: boolean;
// }) {
//   const { setBlogFormData } = useBlogEditorStore.getState();
//   const [isGenerating, startGenerating] = useTransition();
//   const [suggestion, setSuggestion] = useState<AIBlogMetadata | null>(null);

//   const [content, title, kind, tags] = useBlogEditorStore(
//     useShallow((state) => {
//       const d = state.blogFormData;
//       return [d.content, d.title, d.kind, d.tags];
//     }),
//   );

//   const hasContent = (content?.content?.length ?? 0) > 0;

//   const currentValues = useBlogEditorStore(
//     useShallow((state) => ({
//       title: state.blogFormData.title,
//       dek: state.blogFormData.dek,
//       excerpt: state.blogFormData.excerpt,
//       seoTitle: state.blogFormData.seoTitle,
//       metaDescription: state.blogFormData.metaDescription,
//       socialTitle: state.blogFormData.socialTitle,
//       socialDescription: state.blogFormData.socialDescription,
//       tags: state.blogFormData.tags,
//     })),
//   );

//   const handleGenerate = () => {
//     if (!hasContent) return;
//     startGenerating(async () => {
//       const payload = JSON.stringify({
//         content,
//         title,
//         kind,
//         currentTags: tags,
//       });
//       const result = await callWithToast(() => generateBlogMetadata(payload), {
//         loading: "Researching with web search…",
//         success: "Suggestions ready",
//         err: "Failed to generate metadata",
//       });
//       if (result?.status === "success") {
//         setSuggestion(result.data);
//       }
//     });
//   };

//   const handleApply = (partial: Partial<BlogFormData>) => {
//     setBlogFormData(partial);
//   };

//   return (
//     <Sheet open={showSidebar} onOpenChange={closeSidebar}>
//       <SheetContent side="right" className="border-border p-0 overflow-hidden">
//         <SheetHeader className="px-6 py-6 border-b border-border bg-card/40">
//           <SheetTitle className="text-xl font-semibold text-left">
//             Blog Metadata
//           </SheetTitle>
//           <SheetDescription className="mt-1 text-sm text-muted-foreground text-left">
//             Configure your blog's SEO and display settings
//           </SheetDescription>
//         </SheetHeader>

//         <div className="flex-1 overflow-y-auto h-[calc(100vh-120px)]">
//           <div className="p-6">
//             <div className="space-y-6">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={handleGenerate}
//                 disabled={!hasContent || isGenerating}
//                 className="w-full justify-center gap-2 bg-linear-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30 hover:border-primary/50 hover:bg-primary/15"
//                 title={
//                   !hasContent
//                     ? "Write some content first"
//                     : "Generate SEO metadata with AI"
//                 }
//               >
//                 {isGenerating ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                     Researching…
//                   </>
//                 ) : (
//                   <>
//                     <Sparkles className="h-4 w-4 text-primary" />
//                     Generate metadata with AI
//                   </>
//                 )}
//               </Button>

//               <BasicInfoSection />
//               <TagsSection />
//               <CoverImageSection />
//               <SeoSocialSection />

//               <Separator className="bg-border" />

//               <div className="flex justify-end">
//                 <Button
//                   onClick={closeSidebar}
//                   className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
//                 >
//                   Save Metadata
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </SheetContent>

//       {suggestion && (
//         <AIMetadataPreviewModal
//           open={suggestion !== null}
//           onClose={() => setSuggestion(null)}
//           suggestion={suggestion}
//           currentValues={currentValues}
//           onApply={handleApply}
//         />
//       )}
//     </Sheet>
//   );
// }

"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
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
import { AISuggestionsBanner } from "./ai-suggestions";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useShallow } from "zustand/shallow";
import { generateBlogMetadata } from "@/actions/aiActions";
import { callWithToast } from "@/lib/utils";
import type { AIBlogMetadata } from "@tabsircg/schemas/ai";
import type { BlogFormData } from "@tabsircg/schemas/blog";

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

  const [content, title, kind, currentTags] = useBlogEditorStore(
    useShallow((state) => {
      const d = state.blogFormData;
      return [d.content, d.title, d.kind, d.tags];
    }),
  );

  const currentValues = useBlogEditorStore(
    useShallow((state) => ({
      title: state.blogFormData.title,
      dek: state.blogFormData.dek,
      excerpt: state.blogFormData.excerpt,
      seoTitle: state.blogFormData.seoTitle,
      metaDescription: state.blogFormData.metaDescription,
      socialTitle: state.blogFormData.socialTitle,
      socialDescription: state.blogFormData.socialDescription,
      tags: state.blogFormData.tags,
    })),
  );

  const hasContent = (content?.content?.length ?? 0) > 0;

  const handleGenerate = () => {
    if (!hasContent) return;
    startGenerating(async () => {
      const payload = JSON.stringify({
        content,
        title,
        kind,
        currentTags,
      });
      const result = await callWithToast(() => generateBlogMetadata(payload), {
        loading: "Researching with web search…",
        success: "Suggestions ready",
        err: "Failed to generate metadata",
      });
      if (result?.status === "success") {
        setSuggestion(result.data);
      }
    });
  };

  // ─── Per-field handlers ─────────────────────────────────────────

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

  // ─── Tag handlers ───────────────────────────────────────────────

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

  // ─── Change count for banner ────────────────────────────────────

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

  // Auto-clear suggestion when nothing meaningful is left to review
  useEffect(() => {
    if (suggestion && changeCount === 0) {
      setSuggestion(null);
    }
  }, [suggestion, changeCount]);

  // ─── Bulk actions ───────────────────────────────────────────────

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

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <Sheet open={showSidebar} onOpenChange={closeSidebar}>
      <SheetContent side="right" className="border-border p-0 overflow-hidden">
        <SheetHeader className="px-6 py-6 border-b border-border bg-card/40">
          <SheetTitle className="text-xl font-semibold text-left">
            Blog Metadata
          </SheetTitle>
          <SheetDescription className="mt-1 text-sm text-muted-foreground text-left">
            Configure your blog's SEO and display settings
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto h-[calc(100vh-120px)]">
          <div className="p-6">
            <div className="space-y-6">
              {suggestion ? (
                <AISuggestionsBanner
                  changeCount={changeCount}
                  onApplyAll={handleApplyAll}
                  onDiscard={handleDiscard}
                />
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={!hasContent || isGenerating}
                  className="w-full justify-center gap-2 bg-linear-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30 hover:border-primary/50 hover:bg-primary/15"
                  title={
                    !hasContent
                      ? "Write some content first"
                      : "Generate SEO metadata with AI"
                  }
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Researching…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-primary" />
                      Generate metadata with AI
                    </>
                  )}
                </Button>
              )}

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
        </div>
      </SheetContent>
    </Sheet>
  );
}
