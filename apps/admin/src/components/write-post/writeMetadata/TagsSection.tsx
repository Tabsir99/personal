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
            <div className="w-64 p-3 bg-popover text-popover-foreground rounded-md shadow-md border border-border space-y-3">
              <TextField
                id="tag-search"
                placeholder="Search or create..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="sm"
                autoFocus
              />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {isLoading ? (
                  <div className="space-y-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-7 rounded bg-muted/50 animate-pulse"
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    {filteredUnselected.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-muted-foreground px-2 uppercase tracking-wider block">
                          Existing
                        </span>
                        {filteredUnselected.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground flex items-center transition-colors cursor-pointer"
                            onClick={() => handleSelect(tag)}
                          >
                            <TagIcon className="mr-2 h-3 w-3 shrink-0 text-muted-foreground" />
                            <span className="truncate">{tag}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {filteredUnselected.length === 0 && !canCreate && (
                      <div className="text-sm text-muted-foreground px-2 py-4 text-center">
                        No matching tags.
                      </div>
                    )}
                    {canCreate && (
                      <button
                        type="button"
                        className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground flex items-center text-primary font-medium transition-colors cursor-pointer"
                        onClick={handleCreate}
                      >
                        <Plus className="mr-2 h-4 w-4 shrink-0" />
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
          <TagGroup label="Selected tags" className="flex flex-wrap gap-2 animate-in fade-in duration-200">
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


