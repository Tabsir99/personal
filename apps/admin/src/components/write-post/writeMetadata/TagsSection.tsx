"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { addTag as addTagAction } from "@/actions/tagActions";
import { callWithToast } from "@/lib/utils";

export default function TagsSection() {
  const { data, mutate, isLoading } = useCustomSWR<string[]>("/api/tags");
  const available = data ?? [];

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

  const handleSelect = (tag: string) => {
    addTag(tag);
    setSearch("");
  };

  const handleCreate = async () => {
    if (!canCreate) return;

    addTag(normalized);
    mutate([...available, normalized].sort(), false);
    setSearch("");

    const result = await callWithToast(() => addTagAction(normalized), {
      loading: "Creating tag...",
      success: "Tag created",
      err: "Failed to create tag",
    });

    if (result?.status === "success") {
      mutate(result.data.tags, false);
    } else {
      await mutate();
    }
  };

  return (
    <Card className="bg-card/70 border-border">
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-medium">Tags & Categories</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground/80">
              Add Tags
            </Label>
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
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        Loading tags...
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
  );
}
