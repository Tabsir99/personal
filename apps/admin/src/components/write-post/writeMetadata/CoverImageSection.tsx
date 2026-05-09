"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useShallow } from "zustand/shallow";
import { useRef } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
import Image from "next/image";

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
    <Card className="bg-card/70 border-border">
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-medium">Featured Image</h3>
        </div>

        <div className="space-y-4">
          {coverImageUrl ? (
            <div className="space-y-3">
              <div className="relative rounded-lg border border-border overflow-hidden">
                <Image
                  src={coverImageUrl}
                  alt="Featured image"
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => uploadRef.current?.click()}
                    className="bg-background/20 backdrop-blur-sm text-background hover:bg-background/30"
                  >
                    <Upload className="h-4 w-4" />
                    Change Image
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => uploadRef.current?.click()}
              className="cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center transition-all hover:bg-accent/30"
            >
              <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="mb-1 font-medium text-foreground">
                Upload Featured Image
              </p>
              <p className="text-sm text-muted-foreground">
                Click to select an image file
              </p>
            </div>
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
