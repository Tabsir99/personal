"use client";

import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import Image from "next/image";

// Types for our components
interface ImageBlockProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
}

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Maximize } from "lucide-react";

export const ImageBlockNodeview = ({
  node,
  updateAttributes,
  deleteNode,
}: NodeViewProps) => {
  const { src, alt, width, height, caption } = node.attrs;
  const [isEditing, setIsEditing] = useState(false);
  const [tempSrc, setTempSrc] = useState(src);
  const [tempAlt, setTempAlt] = useState(alt || "");
  const [tempWidth, setTempWidth] = useState(width || 800);
  const [tempHeight, setTempHeight] = useState(height || 600);
  const [tempCaption, setTempCaption] = useState(caption || "");
  const [aspectRatio, setAspectRatio] = useState(tempWidth / tempHeight);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  useEffect(() => {
    setTempSrc(src);
    setTempAlt(alt || "");
    setTempWidth(width || 800);
    setTempHeight(height || 600);
    setTempCaption(caption || "");
    if (width && height) {
      setAspectRatio(width / height);
    }
  }, [src, alt, width, height, caption]);

  const handleUpdateImage = useCallback(() => {
    updateAttributes({
      src: tempSrc,
      alt: tempAlt,
      width: tempWidth,
      height: tempHeight,
      caption: tempCaption || null,
    });
    setIsEditing(false);
  }, [updateAttributes, tempSrc, tempAlt, tempWidth, tempHeight, tempCaption]);

  const handleWidthChange = useCallback(
    (value: number[]) => {
      setTempWidth(value[0]);
      if (lockAspectRatio) {
        setTempHeight(Math.round(value[0] / aspectRatio));
      }
    },
    [lockAspectRatio, aspectRatio]
  );

  const handleHeightChange = useCallback(
    (value: number[]) => {
      setTempHeight(value[0]);
      if (lockAspectRatio) {
        setTempWidth(Math.round(value[0] * aspectRatio));
      }
    },
    [lockAspectRatio, aspectRatio]
  );

  return (
    <NodeViewWrapper className="my-6 relative">
      <div className="relative w-full">
        <Popover open={isEditing} onOpenChange={setIsEditing}>
          <div className="cursor-pointer relative group">
            <Image
              src={src}
              alt={alt || ""}
              width={width || 800}
              height={height || 600}
              className="rounded-lg shadow-md max-h-full max-w-full mx-auto"
            />
            {caption && (
              <div className="mt-2 text-sm text-gray-500 italic px-2 text-center">
                {caption}
              </div>
            )}

            <PopoverTrigger asChild>
              <Button className="absolute top-0 right-0 group-hover:opacity-100 opacity-0 transition">
                Edit Image
              </Button>
            </PopoverTrigger>
          </div>

          <PopoverContent
            className="w-80 dark"
            align="end" // Change from "center" to "end"
            side="right"
            sideOffset={-200} // Increased offset
            alignOffset={0} // Added to control horizontal alignment
            avoidCollisions={true}
          >
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="image-url"
                    value={tempSrc}
                    onChange={(e) => setTempSrc(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-alt">Alt Text</Label>
                <Input
                  id="image-alt"
                  value={tempAlt}
                  onChange={(e) => setTempAlt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="image-width">Width: {tempWidth}px</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLockAspectRatio(!lockAspectRatio)}
                    className="h-6"
                  >
                    <Maximize className="h-3 w-3 mr-1" />
                    {lockAspectRatio ? "Locked" : "Unlocked"}
                  </Button>
                </div>
                <Slider
                  id="image-width"
                  value={[tempWidth]}
                  min={100}
                  max={2000}
                  step={10}
                  onValueChange={handleWidthChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-height">Height: {tempHeight}px</Label>
                <Slider
                  id="image-height"
                  value={[tempHeight]}
                  min={100}
                  max={2000}
                  step={10}
                  onValueChange={handleHeightChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-caption">Caption</Label>
                <Textarea
                  id="image-caption"
                  value={tempCaption}
                  onChange={(e) => setTempCaption(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="destructive" size="sm" onClick={deleteNode}>
                  Delete
                </Button>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleUpdateImage}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </NodeViewWrapper>
  );
};

// Preview/User-facing version
export const PreviewImageBlock = ({
  src,
  alt,
  width,
  height,
  caption,
}: ImageBlockProps) => {
  // Default dimensions if none are provided
  const defaultWidth = 800;
  const defaultHeight = 600;

  return (
    <figure className="my-6">
      <Image
        src={src}
        alt={alt || ""}
        width={width || defaultWidth}
        height={height || defaultHeight}
        className="rounded-lg shadow-md max-h-full max-w-full"
        // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {caption && (
        <figcaption className="mt-2 text-sm text-gray-500 italic text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

// For naming convention consistency
ImageBlockNodeview.displayName = "ImageBlockNodeview";
