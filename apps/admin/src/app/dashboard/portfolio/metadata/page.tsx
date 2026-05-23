"use client";
import { useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import { Pencil, Plus, X } from "lucide-react";

import KeywordsSection from "@/components/portfolio/metadata/KeyWords";
import SocialLinksSection from "@/components/portfolio/metadata/SocialLinkSection";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/FormField";
import Img from "@/components/ui/image";
import { usePortfolioStore } from "@/stores/PortfolioStore";

export default function PortfolioMetadata() {
  const { title, description, profilePicture, aboutText, heroStats } =
    usePortfolioStore(
      useShallow((state) => ({
        title: state.pageData.title,
        description: state.pageData.description,
        profilePicture: state.pageData.profilePicture,
        aboutText: state.pageData.aboutText,
        heroStats: state.pageData.heroStats,
      })),
    );

  const updatePageData = usePortfolioStore.getState().updatePageData;
  const heroStat = usePortfolioStore().heroStats;
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [newStat, setNewStat] = useState({ value: "", label: "" });

  const setField = (
    field: "title" | "description" | "aboutText",
    value: string,
  ) => updatePageData({ [field]: value });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) updatePageData({ profilePicture: URL.createObjectURL(file) });
  };

  const handleAddStat = () => {
    if (!newStat.value.trim() || !newStat.label.trim()) return;
    heroStat.add({
      value: newStat.value.trim(),
      label: newStat.label.trim(),
      order: heroStats.length,
    });
    setNewStat({ value: "", label: "" });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">
          Site metadata
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          SEO surface, contact, and the headline stats shown above the fold.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-col gap-1 pt-5 pb-3">
          <h2 className="text-base leading-tight font-semibold tracking-tight">
            Title & description
          </h2>
        </CardHeader>
        <CardContent className="space-y-5 pt-1 pb-5">
          <FormField
            label="Site title"
            hint="Appears in browser tabs and search results."
          >
            <Input
              id="site-title"
              value={title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Tabsir CG · Portfolio"
            />
          </FormField>
          <FormField
            label="Site description"
            hint={`${description.length} / 160 characters · recommended for SEO`}
          >
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setField("description", e.target.value)}
              rows={4}
              placeholder="A few sentences on what this portfolio is and who it's for."
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-1 pt-5 pb-3">
          <h2 className="text-base leading-tight font-semibold tracking-tight">
            About me
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The short bio paragraph rendered alongside the headline stats.
          </p>
        </CardHeader>
        <CardContent className="pt-1 pb-5">
          <FormField
            label="Bio"
            hint={`${aboutText.length} characters · one paragraph reads best.`}
          >
            <Textarea
              value={aboutText}
              onChange={(e) => setField("aboutText", e.target.value)}
              rows={6}
              placeholder="I write code for the messy middle — where product specs collide with reality…"
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-1 pt-5 pb-3">
          <h2 className="text-base leading-tight font-semibold tracking-tight">
            Profile picture
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The avatar that shows up next to the bio.
          </p>
        </CardHeader>
        <CardContent className="pt-1 pb-5">
          <div className="group relative aspect-square w-48 overflow-hidden rounded-md border border-foreground/6 bg-foreground/2">
            {profilePicture ? (
              <Img
                src={profilePicture}
                alt="Profile picture"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                No image
              </div>
            )}
            <div className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-foreground/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <Button
                size="sm"
                className="gap-2 bg-background/90 text-foreground hover:bg-background"
                onClick={() => imageInputRef.current?.click()}
              >
                <Pencil size={14} />
                Change image
              </Button>
            </div>
            <Input
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
          </div>
        </CardContent>
      </Card>

      <KeywordsSection />
      <SocialLinksSection />

      <Card>
        <CardHeader className="flex flex-col gap-1 pt-5 pb-3">
          <h2 className="text-base leading-tight font-semibold tracking-tight">
            Headline stats
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The strip of value/label pairs shown above the fold.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 pt-1 pb-5">
          {heroStats.map((stat, i) => (
            <div
              key={i}
              className="group/stat grid grid-cols-[1fr_2fr_auto] items-end gap-2"
            >
              <FormField label="Value">
                <Input
                  value={stat.value}
                  onChange={(e) =>
                    heroStat.update(i, { value: e.target.value })
                  }
                  className="font-mono text-sm"
                  placeholder="∼2"
                />
              </FormField>
              <FormField label="Label">
                <Input
                  value={stat.label}
                  onChange={(e) =>
                    heroStat.update(i, { label: e.target.value })
                  }
                  placeholder="Years shipping"
                />
              </FormField>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => heroStat.delete(i)}
                className="text-muted-foreground hover:bg-destructive/8 hover:text-destructive"
                aria-label="Remove stat"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}

          <div className="grid grid-cols-[1fr_2fr_auto] items-end gap-2 border-t border-foreground/6 pt-3">
            <FormField label="New value">
              <Input
                value={newStat.value}
                onChange={(e) =>
                  setNewStat({ ...newStat, value: e.target.value })
                }
                className="font-mono text-sm"
                placeholder="17"
              />
            </FormField>
            <FormField label="New label">
              <Input
                value={newStat.label}
                onChange={(e) =>
                  setNewStat({ ...newStat, label: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddStat();
                  }
                }}
                placeholder="Repos shipped"
              />
            </FormField>
            <Button
              size="default"
              onClick={handleAddStat}
              disabled={!newStat.value.trim() || !newStat.label.trim()}
              aria-label="Add stat"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
