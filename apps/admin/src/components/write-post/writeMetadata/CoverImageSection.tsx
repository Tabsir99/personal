"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useShallow } from "zustand/shallow";
import { useRef } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
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
    <Card className="bg-card/60 border-border">
      <CardContent className="p-6">
        <SectionHeader
          icon={ImageIcon}
          title="Featured Image"
          complete={Boolean(coverImageUrl)}
        />

        <div className="space-y-4">
          {coverImageUrl ? (
            <div className="space-y-3">
              <div className="group relative rounded-lg border border-border overflow-hidden">
                <Image
                  src={coverImageUrl}
                  alt="Featured image"
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => uploadRef.current?.click()}
                    className="bg-background/90 backdrop-blur-sm text-foreground hover:bg-background"
                  >
                    <Upload className="h-4 w-4" />
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
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <Upload className="h-5 w-5" />
              </div>
              <p className="mb-1 font-medium text-foreground">
                Upload Featured Image
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
      </CardContent>
    </Card>
  );
}
