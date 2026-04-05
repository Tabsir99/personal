import { Editor } from "@tiptap/react";
import { useRef, useState } from "react";
import { ImageIcon, UploadIcon, Link2Icon } from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

export const ImageInsertButton = ({ editor }: { editor: Editor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const uploadRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      console.log("What the hell", file);

      insertImage(URL.createObjectURL(file));
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
                  isOpen && "bg-zinc-800 text-zinc-100 shadow-inner",
                )}
                aria-label="Insert image"
              >
                <ImageIcon className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-950 text-zinc-200 text-xs border-zinc-800">
              Insert image
            </TooltipContent>
          </Tooltip>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-64 p-2 dark">
          <div className="space-y-1">
            <button
              onClick={() => {
                setIsUrlDialogOpen(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/40 transition-colors rounded-md group"
            >
              <div className="p-1.5 rounded-md bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                <Link2Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-medium">Insert from URL</span>
                <span className="text-xs text-zinc-500">Paste image link</span>
              </div>
            </button>

            <div className="h-px bg-zinc-800 my-1" />

            <button
              onClick={() => {
                uploadRef.current?.click();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/40 transition-colors rounded-md group"
            >
              <div className="p-1.5 rounded-md bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                <UploadIcon className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-medium">Upload from device</span>
                <span className="text-xs text-zinc-500">JPG, PNG, GIF</span>
              </div>
            </button>
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
            <DialogTitle className="text-zinc-100">
              Insert Image from URL
            </DialogTitle>
            <p className="text-sm text-zinc-400 mt-1">
              Enter the URL of the image you want to insert
            </p>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-xs text-zinc-400">
                Image URL
              </Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && imageUrl.trim()) {
                    handleUrlSubmit();
                  }
                }}
              />
            </div>

            {/* Optional: Preview if URL is valid */}
            {imageUrl && (
              <div className="mt-3 p-2 rounded-md">
                <p className="text-xs text-zinc-500 mb-2">Preview</p>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-32 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsUrlDialogOpen(false)}
              className="hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!imageUrl.trim()}
              className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
            >
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isUploading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in-0">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg shadow-2xl flex items-center gap-3 animate-in zoom-in-95">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            <p className="text-zinc-200 font-medium">Uploading image...</p>
          </div>
        </div>
      )}
    </>
  );
};
