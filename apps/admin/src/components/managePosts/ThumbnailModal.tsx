import { uploadImage } from "@/actions/categoryActions";
import {
  NotificationType,
  useNotification,
} from "@/context/NotificationContext";
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
import { cn } from "@/lib/utils";
// import { toast } from "@/components/ui/use-toast";

export default function ThumbnailModal({
  isOpen,
  onClose,
  currentThumbnail,
  blogLink,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentThumbnail?: string;
  blogLink: string;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    if (currentThumbnail) {
      setPreviewUrl(currentThumbnail);
    }
  }, [currentThumbnail]);

  const onThumbnailChange = async (newThumbnail: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", newThumbnail);
      formData.append("blogLink", blogLink);
      const res = await uploadImage(formData, true);

      if (res.status === "success") {
        addNotification({
          message: "Thumbnail has been updated",
          type: NotificationType.SUCCESS,
        });
        // toast({
        //   title: "Success",
        //   description: "Thumbnail has been updated successfully",
        //   variant: "success",
        // });
      } else {
        addNotification({
          message: "Failed to update thumbnail",
          type: NotificationType.ERROR,
        });
        // toast({
        //   title: "Error",
        //   description: "Failed to update thumbnail",
        //   variant: "destructive",
        // });
      }
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      // toast({
      //   title: "Error",
      //   description: "An unexpected error occurred",
      //   variant: "destructive",
      // });
    } finally {
      setIsLoading(false);
      onClose();
    }
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
      onThumbnailChange(selectedFile);
    }
  };

  const resetSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(currentThumbnail || null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl bg-zinc-900 border border-neutral-800 text-neutral-100 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Update Thumbnail
          </DialogTitle>
        </DialogHeader>

        <div className="my-6">
          <div
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-neutral-700 transition-all hover:border-neutral-500",
              previewUrl ? "h-96" : "h-64"
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
                <img
                  src={previewUrl}
                  alt="Thumbnail Preview"
                  className="h-full w-full object-cover transition-opacity"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 flex flex-col items-center justify-center group-hover:opacity-100 transition-opacity">
                  <FaUpload size={32} className="text-white mb-2" />
                  <p className="text-white font-medium">
                    Click to replace image
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-6">
                <FaImages size={48} className="text-neutral-400 mb-3" />
                <p className="text-neutral-300 text-center font-medium mb-2">
                  Drag and drop or click to upload
                </p>
                <p className="text-neutral-500 text-sm text-center">
                  Recommended: 1200 × 630px or larger (16:9 ratio)
                </p>
              </div>
            )}
          </div>

          {selectedFile && (
            <p className="mt-2 text-sm text-neutral-400">
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
              className="w-full sm:w-auto border-neutral-700 text-neutral-300 hover:bg-zinc-800 hover:text-white"
            >
              Reset
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-neutral-400"
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
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto border-neutral-700 text-neutral-300 hover:bg-zinc-800 hover:text-white"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
