"use client";

import { Button } from "premium-ds/button";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useShallow } from "zustand/shallow";
import { useRef } from "react";
import { Image as ImageIcon, Upload } from "@phosphor-icons/react";
import Image from "next/image";
import { SectionHeader } from "./SectionHeader";

export default function CoverImageSection() {
  const coverImageUrl = useBlogEditorStore(
    useShallow((state) => state.blogFormData.coverImageUrl),
  );
  const uploadRef = useRef<HTMLInputElement | null>(null);

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const imageFile = e.target.files?.[0];
    if (!imageFile) return;
    // TODO: Handle thumbnail upload
  };

  return (
    <div className="rounded-lg border border-border bg-card/60 p-6">
      <SectionHeader
        icon={ImageIcon}
        title="Featured Image"
        complete={Boolean(coverImageUrl)}
      />

      <div className="space-y-4">
        {coverImageUrl ? (
          <div className="space-y-3">
            <div className="group relative overflow-hidden rounded-lg border border-border">
              <Image
                src={coverImageUrl}
                alt="Featured image"
                width={400}
                height={200}
                className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => uploadRef.current?.click()}
                  className="bg-background/90 text-foreground backdrop-blur-sm hover:bg-background"
                  iconLeft={<Upload size={16} />}
                >
                  Change Image
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => uploadRef.current?.click()}
            className="group w-full cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center transition-all hover:border-primary/40 hover:bg-accent/30"
          >
            <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <Upload size={20} />
            </div>
            <p className="mb-1 font-medium text-foreground">
              Upload
            </p>
            <p className="text-xs text-muted-foreground">
              PNG or JPEG · click to select
            </p>
          </button>
        )}

        <input
          ref={uploadRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleThumbnailUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}

