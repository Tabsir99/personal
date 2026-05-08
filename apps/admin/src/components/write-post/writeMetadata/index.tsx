"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import BasicInfoSection from "./BasicInfoSection";
import CoverImageSection from "./CoverImageSection";
import SeoSocialSection from "./SeoSocialSection";
import TagsSection from "./TagsSection";

export default function WriteMetadataComp({
  closeSidebar,
  showSidebar,
}: {
  closeSidebar: () => void;
  showSidebar: boolean;
}) {
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
              <BasicInfoSection />
              <TagsSection />
              <CoverImageSection />
              <SeoSocialSection />

              <Separator className="bg-border" />

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
