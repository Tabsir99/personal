"use client";

import { Button } from "premium-ds/button";
import { Popover } from "premium-ds/popover";
import { Tag, TagGroup } from "premium-ds/tag";
import { TextField } from "premium-ds/text-field";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useShallow } from "zustand/shallow";
import { useState } from "react";
import { CaretUpDown, Hash, Plus, Tag as TagIcon } from "@phosphor-icons/react";
import { useCustomSWR } from "@/hooks/useCustomSwr";
import { addConfigValue, type BlogConfig } from "@/actions/configActions";
import { callWithToast } from "@/lib/utils";
import type { AIBlogMetadata } from "@tabsircg/schemas/ai";
import { TagSuggestions } from "./TagSuggestion";
import { SectionHeader } from "./SectionHeader";

interface TagsSectionProps {
  suggestion: AIBlogMetadata | null;
  onApplyTagAddition: (tag: string) => void;
  onApplyTagRemoval: (tag: string) => void;
  onDismissTagAddition: (tag: string) => void;
  onDismissTagRemoval: (tag: string) => void;
}

export default function TagsSection({
  suggestion,
  onApplyTagAddition,
  onApplyTagRemoval,
  onDismissTagAddition,
  onDismissTagRemoval,
}: TagsSectionProps) {
  const { data, mutate, isLoading } = useCustomSWR<BlogConfig>("/api/config");
  const available = data?.tags ?? [];

  const { addTag, removeTag } = useBlogEditorStore.getState();
  const tags = useBlogEditorStore(
    useShallow((state) => state.blogFormData.tags),
  );

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const normalized = search.trim().toLowerCase();
  const selected = new Set(tags ?? []);
  const unselected = available.filter((t) => !selected.has(t));

  const exactMatch = available.some((t) => t.toLowerCase() === normalized);
  const canCreate =
    normalized.length > 0 && !exactMatch && !selected.has(normalized);

  const isComplete = (tags?.length ?? 0) > 0;

  const filteredUnselected = unselected.filter((tag) =>
    tag.toLowerCase().includes(normalized)
  );

  const handleSelect = (tag: string) => {
    addTag(tag);
    setSearch("");
  };

  const handleCreate = async () => {
    if (!canCreate) return;

    addTag(normalized);
    const optimistic = [...available, normalized].sort();
    mutate((prev) => (prev ? { ...prev, tags: optimistic } : prev), false);
    setSearch("");

    const result = await callWithToast(
      () => addConfigValue("tags", normalized),
      {
        loading: "Creating tag...",
        success: "Tag created",
        err: "Failed to create tag",
      },
    );

    if (result?.status === "success") {
      mutate(
        (prev) => (prev ? { ...prev, tags: result.data.values } : prev),
        false,
      );
    } else {
      await mutate();
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card/60 p-6">
      <SectionHeader
        icon={Hash}
        title="Tags & Categories"
        complete={isComplete}
      />

      <div className="space-y-4">
        <div className="space-y-2">
          <Popover 
            open={open} 
            onOpenChange={setOpen}
            align="start"
            trigger={
              <Button
                variant="secondary"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between font-normal text-muted-foreground"
                iconRight={<CaretUpDown size={14} className="opacity-50" />}
              >
                {tags?.length
                  ? `${tags.length} tag${tags.length > 1 ? "s" : ""} selected`
                  : "Select or create tags..."}
              </Button>
            }
          >
            <div className="w-64 space-y-3 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-card-hover">
              <TextField
                id="tag-search"
                placeholder="Search or create..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="sm"
                autoFocus
              />
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {isLoading ? (
                  <div className="space-y-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-7 animate-pulse rounded-md bg-muted/50"
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    {filteredUnselected.length > 0 && (
                      <div className="space-y-1">
                        <span className="block px-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                          Existing
                        </span>
                        {filteredUnselected.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            className="flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                            onClick={() => handleSelect(tag)}
                          >
                            <TagIcon className="mr-2 size-3 shrink-0 text-muted-foreground" />
                            <span className="truncate">{tag}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {filteredUnselected.length === 0 && !canCreate && (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        No matching tags.
                      </div>
                    )}
                    {canCreate && (
                      <button
                        type="button"
                        className="flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-left text-sm font-medium text-primary transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={handleCreate}
                      >
                        <Plus className="mr-2 size-4 shrink-0" />
                        <span className="truncate">Create &quot;{normalized}&quot;</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </Popover>
        </div>

        {tags && tags.length > 0 && (
          <TagGroup label="Selected tags" className="flex animate-in flex-wrap gap-2 duration-200 fade-in">
            {tags.map((tag) => (
              <Tag
                key={tag}
                icon={<TagIcon size={12} />}
                onRemove={() => removeTag(tag)}
                removeLabel={`Remove ${tag}`}
              >
                {tag}
              </Tag>
            ))}
          </TagGroup>
        )}

        <TagSuggestions
          current={tags ?? []}
          suggested={suggestion?.tags}
          onAdd={onApplyTagAddition}
          onRemove={onApplyTagRemoval}
          onDismissAddition={onDismissTagAddition}
          onDismissRemoval={onDismissTagRemoval}
        />
      </div>
    </div>
  );
}


