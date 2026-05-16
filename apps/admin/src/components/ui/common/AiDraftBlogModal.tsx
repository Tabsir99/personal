"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateBlogDraft } from "@/actions/aiActions";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { callWithToast } from "@/lib/utils";
import ConfigSingleSelect from "@/components/write-post/writeMetadata/ConfigSingleSelect";

export const AiDraftBlogModal = () => {
  const router = useRouter();
  const isOpen = useBlogEditorStore((s) => s.isAiDraftDialogOpen);
  const { closeAiDraftDialog, setBlogFormData } = useBlogEditorStore.getState();

  const [topic, setTopic] = useState("");
  const [kind, setKind] = useState("essay");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setTopic("");
    setKind("essay");
    setIsSubmitting(false);
  };

  const handleGenerate = async () => {
    const trimmed = topic.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);

    const result = await callWithToast(
      () => generateBlogDraft(trimmed, kind || undefined),
      {
        loading: "Researching with web search & drafting…",
        success: "Draft created",
        err: "Failed to generate draft",
      },
    );

    setIsSubmitting(false);

    if (result?.status === "success") {
      setBlogFormData(result.data);
      reset();
      closeAiDraftDialog();
      router.push(`/dashboard/write-blog/${result.data.blogId}`);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          reset();
          closeAiDraftDialog();
        }
      }}
    >
      <DialogContent>
        <DialogHeader className="p-2.5">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create from AI
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Give a topic and (optionally) a kind. Claude will research and
            return a structured starting draft.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-2.5">
          <div>
            <Label htmlFor="ai-topic" className="mb-2 block">
              Topic
            </Label>
            <Textarea
              id="ai-topic"
              placeholder="e.g. Why static typing won't save your codebase — focus on the false sense of safety it gives across module boundaries."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {topic.length}/500. Be specific — angle, audience, stakes.
            </p>
          </div>

          <div>
            <Label className="mb-2 block">Kind</Label>
            <ConfigSingleSelect
              value={kind}
              onValueChange={setKind}
              field="kinds"
              placeholder="Pick or create a kind…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              closeAiDraftDialog();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!topic.trim() || isSubmitting}
          >
            <Sparkles className="h-4 w-4" />
            {isSubmitting ? "Generating…" : "Generate Draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
