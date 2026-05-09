import React, { useEffect, useState } from "react";
import { FaImages, FaUpload } from "react-icons/fa6";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { callWithToast, cn } from "@/lib/utils";
import Img from "../ui/image";
import useUIStore from "@/stores/UIStore";
import { useShallow } from "zustand/shallow";
import { getImageUploadSignedUrl } from "@/actions/mediaActions";
import { updateBlogCoverImage } from "@/actions/blogActions";

export default function ThumbnailModal() {
  const { isOpen, data } = useUIStore(
    useShallow((state) => state.modals.blogThumbnail),
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    data?.thumbnailUrl ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const closeModal = useUIStore().closeAllModals;

  // The Dialog stays mounted, so re-sync state when reopened for a different blog.
  useEffect(() => {
    setSelectedFile(null);
    setPreviewUrl(data?.thumbnailUrl ?? null);
  }, [data?.blogId, data?.thumbnailUrl]);

  const updateThumbnail = async (newThumbnail: File) => {
    if (!data?.blogId) return;
    setIsLoading(true);
    const result = await callWithToast(
      async () => {
        const signed = await getImageUploadSignedUrl(
          {
            fileName: newThumbnail.name,
            contentType: newThumbnail.type,
            contentLength: newThumbnail.size,
          },
          data.blogId,
          true,
        );
        if (signed.status !== "success") throw new Error(signed.message);

        const put = await fetch(signed.data.signedUrl, {
          method: "PUT",
          body: newThumbnail,
          headers: { "Content-Type": newThumbnail.type },
        });
        if (!put.ok) throw new Error("Upload failed");

        const updated = await updateBlogCoverImage(
          data.blogId,
          signed.data.key,
        );
        if (updated.status !== "success") throw new Error(updated.message);

        return updated;
      },
      {
        loading: "Uploading thumbnail...",
        success: "Thumbnail updated",
        err: "Failed to upload thumbnail",
      },
    );
    setIsLoading(false);
    if (result?.status === "success") closeModal();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      updateThumbnail(selectedFile);
    }
  };

  const resetSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(data?.thumbnailUrl || null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-3xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Update Thumbnail
          </DialogTitle>
        </DialogHeader>

        <div className="my-6">
          <div
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-border transition-all hover:border-border/80",
              previewUrl ? "h-96" : "h-64",
            )}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0 z-10"
              id="thumbnail-upload"
            />

            {previewUrl ? (
              <div className="relative h-full w-full">
                <Img
                  src={previewUrl}
                  alt="Thumbnail Preview"
                  className="h-full w-full object-cover transition-opacity"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <FaUpload size={32} className="mb-2 text-background" />
                  <p className="font-medium text-background">
                    Click to replace image
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-6">
                <FaImages size={48} className="mb-3 text-muted-foreground" />
                <p className="mb-2 text-center font-medium text-foreground">
                  Drag and drop or click to upload
                </p>
                <p className="text-center text-sm text-muted-foreground">
                  Recommended: 1200 × 630px or larger (16:9 ratio)
                </p>
              </div>
            )}
          </div>

          {selectedFile && (
            <p className="mt-2 text-sm text-muted-foreground">
              Selected: {selectedFile.name} (
              {Math.round(selectedFile.size / 1024)} KB)
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {selectedFile && (
            <Button
              variant="outline"
              onClick={resetSelection}
              className="w-full sm:w-auto"
            >
              Reset
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            className="w-full sm:w-auto disabled:bg-muted disabled:text-muted-foreground"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Updating...
              </span>
            ) : (
              "Update Thumbnail"
            )}
          </Button>
          <Button
            onClick={closeModal}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
