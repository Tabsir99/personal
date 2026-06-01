"use client";
import { useRef, useState } from "react";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getResumeUploadSignedUrl } from "@/actions/mediaActions";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { callWithToast } from "@/lib/utils";
import { clientEnv } from "@/config/env.client";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function ResumeSection() {
  const resume = usePortfolioStore(useShallow((s) => s.pageData.resume));
  const updatePageData = usePortfolioStore.getState().updatePageData;

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  // Size is only known for files picked this session; on load we just have the URL.
  const [size, setSize] = useState<number | null>(null);

  const pick = () => inputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be re-selected later
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please choose a PDF file");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File too large", { description: "Keep it under 10 MB." });
      return;
    }

    setUploading(true);
    await callWithToast(
      async () => {
        const signed = await getResumeUploadSignedUrl(file.size);
        if (signed.status !== "success") throw new Error(signed.message);

        const put = await fetch(signed.data.signedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": "application/pdf" },
        });
        if (!put.ok) throw new Error("Upload failed");

        updatePageData({
          resume: {
            url: `${clientEnv.MEDIA_ORIGIN}/${signed.data.key}`,
            filename: file.name,
          },
        });
        setSize(file.size);
      },
      {
        loading: "Uploading resume…",
        success: "Resume uploaded — save to apply",
        err: "Failed to upload resume",
      },
    );
    setUploading(false);
  };

  const remove = () => {
    updatePageData({ resume: { url: "", filename: "" } });
    setSize(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 pt-5 pb-3">
        <h2 className="text-base leading-tight font-semibold tracking-tight">
          Resume / CV
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The PDF served by the “Download CV” button in the site header.
        </p>
      </CardHeader>
      <CardContent className="pt-1 pb-5">
        {resume.url ? (
          <div className="flex items-center gap-3 rounded-lg border border-foreground/8 bg-foreground/2 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {resume.filename || "resume.pdf"}
              </p>
              <a
                href={resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
              >
                PDF{size ? ` · ${formatSize(size)}` : ""} · View ↗
              </a>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={pick}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                Replace
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={remove}
                disabled={uploading}
                className="text-muted-foreground hover:bg-destructive/8 hover:text-destructive"
                aria-label="Remove resume"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={pick}
            disabled={uploading}
            className="group flex w-full flex-col items-center rounded-lg border-2 border-dashed border-border p-8 text-center transition-all hover:border-primary/40 hover:bg-accent/30 disabled:pointer-events-none disabled:opacity-60"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
            </div>
            <p className="mb-1 font-medium text-foreground">
              {uploading ? "Uploading…" : "Upload your resume"}
            </p>
            <p className="text-xs text-muted-foreground">
              PDF · up to 10 MB · click to select
            </p>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFile}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
