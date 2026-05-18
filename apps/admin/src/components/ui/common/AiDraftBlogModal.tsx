"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/FormField";
import { StatusDot } from "@/components/ui/StatusDot";
import ConfigSingleSelect from "@/components/write-post/writeMetadata/ConfigSingleSelect";

import { generateBlogDraft } from "@/actions/aiActions";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { callWithToast } from "@/lib/utils";

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
        loading: "Researching and drafting…",
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Draft with AI
          </DialogTitle>
          <DialogDescription>
            Web research and a structured outline returned as a working draft.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <FormField
            label="Topic"
            hint={`${topic.length} / 500 · be specific — angle, audience, stakes.`}
          >
            <Textarea
              id="ai-topic"
              placeholder="Why static typing won't save your codebase — the false sense of safety across module boundaries."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Kind">
            <ConfigSingleSelect
              value={kind}
              onValueChange={setKind}
              field="kinds"
              placeholder="Pick or create a kind…"
            />
          </FormField>
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
            className="gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <StatusDot tone="primary" size="xs" />
                Generate draft
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
