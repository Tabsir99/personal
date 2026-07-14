"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleNotch } from "@phosphor-icons/react";

import { Dialog } from "premium-ds/dialog";
import { Button } from "premium-ds/button";
import { Textarea } from "premium-ds/textarea";
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
      router.push(`/analytics/write-blog/${result.data.blogId}`);
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
      title="Draft with AI"
      description="Web research and a structured outline returned as a working draft."
      footer={
        <div className="flex justify-end gap-2.5">
          <Button
            variant="secondary"
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
            iconLeft={isSubmitting ? <CircleNotch className="animate-spin" /> : <StatusDot tone="primary" size="xs" />}
          >
            {isSubmitting ? "Generating…" : "Generate draft"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        <Textarea
          id="ai-topic"
          label="Topic"
          placeholder="Why static typing won't save your codebase — the false sense of safety across module boundaries."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          minRows={4}
          max={500}
          disabled={isSubmitting}
          helper="Be specific — angle, audience, stakes."
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground select-none">
            Kind
          </label>
          <ConfigSingleSelect
            value={kind}
            onValueChange={setKind}
            field="kinds"
            placeholder="Pick or create a kind…"
          />
        </div>
      </div>
    </Dialog>
  );
};
