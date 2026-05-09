"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlogKind, SchemaType } from "@/schemas/blogSchemas";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useShallow } from "zustand/shallow";
import { FileText } from "lucide-react";

const KIND_OPTIONS: { value: BlogKind; label: string }[] = [
  { value: "essay", label: "Essay" },
  { value: "deep-dive", label: "Deep Dive" },
  { value: "war-story", label: "War Story" },
  { value: "notes", label: "Notes" },
];

export default function BasicInfoSection() {
  const { setBlogFormData } = useBlogEditorStore.getState();

  const [title, dek, kind, schemaType] = useBlogEditorStore(
    useShallow((state) => {
      const d = state.blogFormData;
      return [d.title, d.dek, d.kind, d.schemaType];
    }),
  );

  return (
    <Card className="bg-card/70 border-border">
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-medium">Basic Information</h3>
        </div>

        <div className="space-y-4">
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
              onChange={(e) => setBlogFormData({ title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="dek"
              className="text-sm font-medium text-foreground/80"
            >
              Subtitle / Hook
            </Label>
            <Textarea
              id="dek"
              rows={2}
              placeholder="A short hook displayed beneath the title..."
              value={dek}
              onChange={(e) => setBlogFormData({ dek: e.target.value })}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground/80">
                Kind
              </Label>
              <Select
                value={kind}
                onValueChange={(value: BlogKind) =>
                  setBlogFormData({ kind: value })
                }
              >
                <SelectTrigger className="capitalize">
                  <SelectValue placeholder="Select kind..." />
                </SelectTrigger>
                <SelectContent>
                  {KIND_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground/80">
                Schema Type
              </Label>
              <Select
                value={schemaType}
                onValueChange={(value: SchemaType) =>
                  setBlogFormData({ schemaType: value })
                }
              >
                <SelectTrigger className="capitalize">
                  <SelectValue placeholder="Select schema type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SchemaType.Article}>Article</SelectItem>
                  <SelectItem value={SchemaType.BlogPosting}>
                    Blog Posting
                  </SelectItem>
                  <SelectItem value={SchemaType.NewsArticle}>
                    News Article
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
