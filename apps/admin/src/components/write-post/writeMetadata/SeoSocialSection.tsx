"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useShallow } from "zustand/shallow";
import { Globe, Share2 } from "lucide-react";

export default function SeoSocialSection() {
  const { setBlogFormData } = useBlogEditorStore.getState();

  const [seoTitle, metaDescription, socialTitle, socialDescription] =
    useBlogEditorStore(
      useShallow((state) => {
        const d = state.blogFormData;
        return [d.seoTitle, d.metaDescription, d.socialTitle, d.socialDescription];
      }),
    );

  return (
    <>
      <Card className="bg-card/70 border-border">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">SEO</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="seoTitle"
                className="text-sm font-medium text-foreground/80"
              >
                SEO Title
              </Label>
              <Input
                id="seoTitle"
                placeholder="Title used in search results..."
                value={seoTitle}
                onChange={(e) => setBlogFormData({ seoTitle: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {seoTitle?.length || 0}/60 characters (recommended for SEO)
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="metaDescription"
                className="text-sm font-medium text-foreground/80"
              >
                Meta Description
              </Label>
              <Textarea
                id="metaDescription"
                rows={4}
                placeholder="Brief description shown in search results..."
                value={metaDescription}
                onChange={(e) =>
                  setBlogFormData({ metaDescription: e.target.value })
                }
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {metaDescription?.length || 0}/160 characters (recommended for
                SEO)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">Social Sharing</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="socialTitle"
                className="text-sm font-medium text-foreground/80"
              >
                Social Title
              </Label>
              <Input
                id="socialTitle"
                placeholder="Title used when shared on social media..."
                value={socialTitle}
                onChange={(e) =>
                  setBlogFormData({ socialTitle: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="socialDescription"
                className="text-sm font-medium text-foreground/80"
              >
                Social Description
              </Label>
              <Textarea
                id="socialDescription"
                rows={3}
                placeholder="Description shown when shared on social media..."
                value={socialDescription}
                onChange={(e) =>
                  setBlogFormData({ socialDescription: e.target.value })
                }
                className="resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
