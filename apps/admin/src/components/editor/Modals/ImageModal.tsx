import { Editor } from "@tiptap/react";
import { useRef, useState } from "react";
import { ImageIcon, UploadIcon, Link2Icon } from "lucide-react";
import { uploadImage } from "@/actions/categoryActions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import useBlogFormData from "@/hooks/useMetadata";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const ImageInsertButton = ({ editor }: { editor: Editor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const { blogFormData } = useBlogFormData();

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);

      const id = slugify(blogFormData.blogName);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("blogLink", id);

      const response = await uploadImage(formData);

      if (response.data) {
        insertImage(response.data);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const insertImage = (src: string) => {
    if (src) {
      editor.chain().focus().setImage({ src, alt: "" }).run();
      setIsOpen(false);
      setIsUrlDialogOpen(false);
      setImageUrl("");
    }
  };

  const handleUrlSubmit = () => {
    insertImage(imageUrl);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "p-2 rounded-md text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-200 active:scale-95",
                  isOpen && "bg-zinc-800 text-zinc-100 shadow-inner"
                )}
                aria-label="Insert image"
              >
                <ImageIcon className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>Insert image</TooltipContent>
          </Tooltip>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-56 dark">
          <div
            onClick={() => setIsUrlDialogOpen(true)}
            className="cursor-pointer flex pl-3 py-2 items-center hover:bg-zinc-800 transition rounded-md"
          >
            <Link2Icon className="mr-2 h-4 w-4" />
            <span>Insert from URL</span>
          </div>
          <div
            onClick={() => uploadRef.current?.click()}
            className="cursor-pointer flex pl-3 py-2 items-center hover:bg-zinc-800 transition rounded-md"
          >
            <UploadIcon className="mr-2 h-4 w-4" />
            <span>Upload from device</span>
          </div>
        </PopoverContent>
      </Popover>

      <input
        type="file"
        className="hidden"
        ref={uploadRef}
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImageUpload(file);
          }
        }}
      />

      <Dialog open={isUrlDialogOpen} onOpenChange={setIsUrlDialogOpen}>
        <DialogContent className="sm:max-w-md dark">
          <DialogHeader>
            <DialogTitle>Insert Image from URL</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <Input
              id="imageUrl"
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsUrlDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!imageUrl.trim()}
            >
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isUploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>Uploading image...</p>
          </div>
        </div>
      )}
    </>
  );
};
