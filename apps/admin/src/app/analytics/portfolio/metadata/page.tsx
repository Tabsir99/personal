"use client";
import { useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import { Pencil, Plus, X } from "@phosphor-icons/react";

import KeywordsSection from "@/components/portfolio/metadata/KeyWords";
import ResumeSection from "@/components/portfolio/metadata/ResumeSection";
import SocialLinksSection from "@/components/portfolio/metadata/SocialLinkSection";
import { TextField } from "premium-ds/text-field";
import { Textarea } from "premium-ds/textarea";
import { Button } from "premium-ds/button";
import Img from "@/components/ui/image";
import { usePortfolioStore } from "@/stores/PortfolioStore";

export default function PortfolioMetadata() {
  const {
    title,
    description,
    profilePicture,
    aboutText,
    heroStats,
    studioName,
    address,
  } = usePortfolioStore(
    useShallow((state) => ({
      title: state.pageData.title,
      description: state.pageData.description,
      profilePicture: state.pageData.profilePicture,
      aboutText: state.pageData.aboutText,
      heroStats: state.pageData.heroStats,
      studioName: state.pageData.studioName,
      address: state.pageData.address,
    })),
  );

  const updatePageData = usePortfolioStore.getState().updatePageData;
  const heroStat = usePortfolioStore().heroStats;
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [newStat, setNewStat] = useState({ value: "", label: "" });

  const setField = (
    field: "title" | "description" | "aboutText" | "studioName" | "address",
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

      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-1 pt-5 pb-3 px-6">
          <h2 className="text-base leading-tight font-semibold tracking-tight">
            Title & description
          </h2>
        </div>
        <div className="space-y-5 pt-1 pb-5 px-6">
          <TextField
            id="site-title"
            label="Site title"
            helper="Appears in browser tabs and search results."
            value={title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Tabsir CG · Portfolio"
          />
          <Textarea
            id="description"
            label="Site description"
            helper={`${description.length} / 160 characters · recommended for SEO`}
            value={description}
            onChange={(e) => setField("description", e.target.value)}
            minRows={4}
            placeholder="A few sentences on what this portfolio is and who it's for."
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-1 pt-5 pb-3 px-6">
          <h2 className="text-base leading-tight font-semibold tracking-tight">
            Studio
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The identity line and address shown in the site footer.
          </p>
        </div>
        <div className="space-y-5 pt-1 pb-5 px-6">
          <TextField
            id="studio-name"
            label="Studio name"
            helper="The identity line, e.g. practice name and descriptor."
            value={studioName}
            onChange={(e) => setField("studioName", e.target.value)}
            placeholder="Tabsir CG · Independent practice"
          />
          <Textarea
            id="studio-address"
            label="Address"
            helper="One line per row."
            value={address}
            onChange={(e) => setField("address", e.target.value)}
            minRows={3}
            placeholder={"Apt 4B, Banani Road 11\nDhaka 1213, Bangladesh"}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-1 pt-5 pb-3 px-6">
          <h2 className="text-base leading-tight font-semibold tracking-tight">
            About me
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The short bio paragraph rendered alongside the headline stats.
          </p>
        </div>
        <div className="pt-1 pb-5 px-6">
          <Textarea
            id="about-bio"
            label="Bio"
            helper={`${aboutText.length} characters · one paragraph reads best.`}
            value={aboutText}
            onChange={(e) => setField("aboutText", e.target.value)}
            minRows={6}
            placeholder="I write code for the messy middle — where product specs collide with reality…"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-1 pt-5 pb-3 px-6">
          <h2 className="text-base leading-tight font-semibold tracking-tight">
            Profile picture
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The avatar that shows up next to the bio.
          </p>
        </div>
        <div className="pt-1 pb-5 px-6">
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
                iconLeft={<Pencil size={14} />}
                className="bg-background/90 text-foreground hover:bg-background"
                onClick={() => imageInputRef.current?.click()}
              >
                Change image
              </Button>
            </div>
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
          </div>
        </div>
      </div>

      <ResumeSection />

      <KeywordsSection />
      <SocialLinksSection />

      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-1 pt-5 pb-3 px-6">
          <h2 className="text-base leading-tight font-semibold tracking-tight">
            Headline stats
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The strip of value/label pairs shown above the fold.
          </p>
        </div>
        <div className="space-y-3 pt-1 pb-5 px-6">
          {heroStats.map((stat, i) => (
            <div
              key={i}
              className="group/stat grid grid-cols-[1fr_2fr_auto] items-end gap-2"
            >
              <TextField
                id={`stat-value-${i}`}
                label="Value"
                value={stat.value}
                onChange={(e) =>
                  heroStat.update(i, { value: e.target.value })
                }
                className="font-mono text-sm"
                placeholder="∼2"
              />
              <TextField
                id={`stat-label-${i}`}
                label="Label"
                value={stat.label}
                onChange={(e) =>
                  heroStat.update(i, { label: e.target.value })
                }
                placeholder="Years shipping"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => heroStat.delete(i)}
                className="text-muted-foreground hover:bg-destructive/8 hover:text-destructive"
                aria-label="Remove stat"
                iconLeft={<X size={14} />}
              />
            </div>
          ))}

          <div className="grid grid-cols-[1fr_2fr_auto] items-end gap-2 border-t border-foreground/6 pt-3">
            <TextField
              id="new-stat-value"
              label="New value"
              value={newStat.value}
              onChange={(e) =>
                setNewStat({ ...newStat, value: e.target.value })
              }
              className="font-mono text-sm"
              placeholder="17"
            />
            <TextField
              id="new-stat-label"
              label="New label"
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
            <Button
              size="sm"
              onClick={handleAddStat}
              disabled={!newStat.value.trim() || !newStat.label.trim()}
              aria-label="Add stat"
              iconLeft={<Plus size={14} />}
              variant="secondary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

