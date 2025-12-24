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

  const [
    title,
    socialTitle,
    type,
    description,
    recommendationTitle,
    tags,
    featuredImageUrl,
  ] = useBlogEditorStore(
    useShallow((state) => {
      const d = state.blogFormData;
      return [
        d.title,
        d.socialTitle,
        d.type,
        d.description,
        d.recommendationTitle,
        d.tags,
        d.featuredImageUrl,
      ];
    })
  );

  const [tagInput, setTagInput] = useState("");
  const uploadRef = useRef<HTMLInputElement | null>(null);

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
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
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl dark border-zinc-800/50 p-0 overflow-hidden"
      >
        <SheetHeader className="px-6 py-6 border-b border-zinc-800/50 bg-zinc-900/50">
          <SheetTitle className="text-xl font-semibold text-zinc-100 text-left">
            Blog Metadata
          </SheetTitle>
          <SheetDescription className="text-sm text-zinc-400 text-left mt-1">
            Configure your blog's SEO and display settings
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto h-[calc(100vh-120px)]">
          <div className="p-6">
            <div className="space-y-6">
              {/* Basic Information Section */}
              <Card className="bg-zinc-900/50 border-zinc-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="h-4 w-4 text-zinc-400" />
                    <h3 className="text-lg font-medium text-zinc-100">
                      Basic Information
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="blogTitle"
                          className="text-zinc-300 text-sm font-medium"
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
                          className="text-zinc-300 text-sm font-medium"
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
                        <Label className="text-zinc-300 text-sm font-medium">
                          Blog Type
                        </Label>
                        <Select
                          value={type}
                          onValueChange={(value: BlogType) =>
                            setBlogFormData({ type: value })
                          }
                        >
                          <SelectTrigger className="bg-zinc-800/50 border-zinc-700/50 text-zinc-100">
                            <SelectValue placeholder="Select blog type..." />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-700">
                            <SelectItem
                              value={BlogType.Article}
                              className="text-zinc-100"
                            >
                              Article
                            </SelectItem>
                            <SelectItem
                              value={BlogType.BlogPosting}
                              className="text-zinc-100"
                            >
                              Blog Posting
                            </SelectItem>
                            <SelectItem
                              value={BlogType.NewsArticle}
                              className="text-zinc-100"
                            >
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
              <Card className="bg-zinc-900/50 border-zinc-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Hash className="h-4 w-4 text-zinc-400" />
                    <h3 className="text-lg font-medium text-zinc-100">
                      Tags & Categories
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <div className="flex-1 space-y-2">
                        <Label
                          htmlFor="tagInput"
                          className="text-zinc-300 text-sm font-medium"
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
                          className="bg-blue-600 hover:bg-blue-700 text-white"
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
                            className="bg-zinc-800/70 text-zinc-200 hover:bg-zinc-700/70 pr-1"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTag(tag)}
                              className="ml-2 h-4 w-4 p-0 hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label
                        htmlFor="recTitle"
                        className="text-zinc-300 text-sm font-medium"
                      >
                        Recommendation Title
                      </Label>
                      <Input
                        id="recTitle"
                        placeholder="Title for recommendations..."
                        value={recommendationTitle}
                        onChange={(e) =>
                          setBlogFormData({
                            recommendationTitle: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Featured Image Section */}
              <Card className="bg-zinc-900/50 border-zinc-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <ImageIcon className="h-4 w-4 text-zinc-400" />
                    <h3 className="text-lg font-medium text-zinc-100">
                      Featured Image
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {featuredImageUrl ? (
                      <div className="space-y-3">
                        <div className="relative rounded-lg border border-zinc-700/50 overflow-hidden">
                          <Image
                            src={featuredImageUrl}
                            alt="Featured image"
                            width={400}
                            height={200}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => uploadRef.current?.click()}
                              className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
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
                        className="border-2 border-dashed border-zinc-700/50 rounded-lg p-8 text-center cursor-pointer hover:border-zinc-600/50 hover:bg-zinc-800/20 transition-all"
                      >
                        <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-3" />
                        <p className="text-zinc-300 font-medium mb-1">
                          Upload Featured Image
                        </p>
                        <p className="text-zinc-500 text-sm">
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
              <Card className="bg-zinc-900/50 border-zinc-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Globe className="h-4 w-4 text-zinc-400" />
                    <h3 className="text-lg font-medium text-zinc-100">
                      SEO & Description
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-zinc-300 text-sm font-medium"
                    >
                      Blog Description
                    </Label>
                    <Textarea
                      id="description"
                      rows={4}
                      placeholder="Enter a brief description about the blog..."
                      value={description}
                      onChange={(e) =>
                        setBlogFormData({ description: e.target.value })
                      }
                      className="resize-none"
                    />
                    <p className="text-xs text-zinc-500">
                      {description?.length || 0}/160 characters (recommended for
                      SEO)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Separator className="bg-zinc-800/50" />

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={closeSidebar}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
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
