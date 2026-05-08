"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlogType } from "@/types/blogTypes";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useShallow } from "zustand/shallow";
import { useRef, useState } from "react";
import {
  Plus,
  Upload,
  X,
  Tag,
  FileText,
  Image as ImageIcon,
  Globe,
  Hash,
} from "lucide-react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function WriteMetadataComp({
  closeSidebar,
  showSidebar,
}: {
  closeSidebar: () => void;
  showSidebar: boolean;
}) {
  const { setBlogFormData, addTag, removeTag } = useBlogEditorStore.getState();

  const [title, socialTitle, type, description, tags, coverImageUrl] =
    useBlogEditorStore(
      useShallow((state) => {
        const d = state.blogFormData;
        return [
          d.title,
          d.socialTitle,
          d.type,
          d.metaDescription,
          d.tags,
          d.coverImageUrl,
        ];
      }),
    );

  const [tagInput, setTagInput] = useState("");
  const uploadRef = useRef<HTMLInputElement | null>(null);

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const imageFile = e.target.files?.[0];
    if (!imageFile) return;
    // TODO: Handle thumbnail upload
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      addTag(tagInput.trim());
      setTagInput("");
    }
  };

  return (
    <Sheet open={showSidebar} onOpenChange={closeSidebar}>
      <SheetContent side="right" className="border-border p-0 overflow-hidden">
        <SheetHeader className="px-6 py-6 border-b border-border bg-card/40">
          <SheetTitle className="text-xl font-semibold text-left">
            Blog Metadata
          </SheetTitle>
          <SheetDescription className="mt-1 text-sm text-muted-foreground text-left">
            Configure your blog's SEO and display settings
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto h-[calc(100vh-120px)]">
          <div className="p-6">
            <div className="space-y-6">
              {/* Basic Information Section */}
              <Card className="bg-card/70 border-border">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Basic Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="blogTitle"
                          className="text-sm font-medium text-foreground/80"
                        >
                          Blog Title *
                        </Label>
                        <Input
                          id="blogTitle"
                          placeholder="Enter your blog title..."
                          value={title}
                          onChange={(e) =>
                            setBlogFormData({ title: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="socialTitle"
                          className="text-sm font-medium text-foreground/80"
                        >
                          Social Media Title
                        </Label>
                        <Input
                          id="socialTitle"
                          placeholder="Title for social media sharing..."
                          value={socialTitle}
                          onChange={(e) =>
                            setBlogFormData({
                              socialTitle: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground/80">
                          Blog Type
                        </Label>
                        <Select
                          value={type}
                          onValueChange={(value: BlogType) =>
                            setBlogFormData({ type: value })
                          }
                        >
                          <SelectTrigger className="bg-muted/40 border-border">
                            <SelectValue placeholder="Select blog type..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={BlogType.Article}>
                              Article
                            </SelectItem>
                            <SelectItem value={BlogType.BlogPosting}>
                              Blog Posting
                            </SelectItem>
                            <SelectItem value={BlogType.NewsArticle}>
                              News Article
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags Section */}
              <Card className="bg-card/70 border-border">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Tags & Categories</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <div className="flex-1 space-y-2">
                        <Label
                          htmlFor="tagInput"
                          className="text-sm font-medium text-foreground/80"
                        >
                          Add Tags
                        </Label>
                        <Input
                          id="tagInput"
                          placeholder="Enter a tag..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                        />
                      </div>
                      <div className="pt-8">
                        <Button
                          onClick={handleAddTag}
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {tags && tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-muted text-foreground hover:bg-accent pr-1"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTag(tag)}
                              className="ml-2 h-4 w-4 p-0 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Featured Image Section */}
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

              {/* Description Section */}
              <Card className="bg-card/70 border-border">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium">SEO & Description</h3>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="metaDescription"
                      className="text-sm font-medium text-foreground/80"
                    >
                      Blog Description
                    </Label>
                    <Textarea
                      id="metaDescription"
                      rows={4}
                      placeholder="Enter a brief description about the blog..."
                      value={description}
                      onChange={(e) =>
                        setBlogFormData({ metaDescription: e.target.value })
                      }
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      {description?.length || 0}/160 characters (recommended for
                      SEO)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Separator className="bg-border" />

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={closeSidebar}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                >
                  Save Metadata
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
