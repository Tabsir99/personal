"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useShallow } from "zustand/shallow";
import { useState } from "react";
import { ChevronsUpDown, Hash, Plus, Tag, X } from "lucide-react";
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
    <Card className="bg-card/60 border-border">
      <CardContent className="p-6">
        <SectionHeader
          icon={Hash}
          title="Tags & Categories"
          complete={isComplete}
        />

        <div className="space-y-4">
          <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal text-muted-foreground"
                  >
                    {tags?.length
                      ? `${tags.length} tag${tags.length > 1 ? "s" : ""} selected`
                      : "Select or create tags..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                }
              />

              <PopoverContent className="p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search or create..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    {isLoading ? (
                      <div className="p-2 space-y-1">
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
                        {unselected.length > 0 && (
                          <CommandGroup heading="Existing">
                            {unselected.map((tag) => (
                              <CommandItem
                                key={tag}
                                value={tag}
                                onSelect={() => handleSelect(tag)}
                              >
                                <Tag className="mr-2 h-3 w-3" />
                                {tag}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                        <CommandEmpty>
                          {canCreate ? null : "No matching tags."}
                        </CommandEmpty>
                        {canCreate && (
                          <CommandGroup>
                            <CommandItem
                              value={`__create__${normalized}`}
                              onSelect={handleCreate}
                              className="text-primary"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Create &quot;{normalized}&quot;
                            </CommandItem>
                          </CommandGroup>
                        )}
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 animate-in fade-in duration-200">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-stretch overflow-hidden rounded-full border border-border bg-muted text-xs font-medium text-foreground"
                >
                  <span className="flex items-center gap-1 py-1 pl-2.5 pr-1.5">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    {tag}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    aria-label={`Remove ${tag}`}
                    className="flex items-center px-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
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
      </CardContent>
    </Card>
  );
}
