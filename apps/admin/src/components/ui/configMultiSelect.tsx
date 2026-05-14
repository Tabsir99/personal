"use client";

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
import { useState } from "react";
import { ChevronsUpDown, Plus, X, type LucideIcon } from "lucide-react";
import { callWithToast } from "@/lib/utils";
import type { ApiResponse } from "@/lib/appUtils";

type SelectionMode = "single" | "multi";

interface ConfigMultiSelectProps {
  value: string[];
  onChange: (next: string[]) => void;
  available: string[];
  loading?: boolean;
  /** Server action that persists a new value to Firestore and returns the new sorted list. */
  onCreate: (value: string) => Promise<ApiResponse<{ values: string[] }>>;
  /** Called with the persisted list after a successful create; use for SWR mutate. */
  onAfterCreate?: (values: string[]) => void;
  /** Called optimistically with `[...available, normalized].sort()` before the server replies. */
  onOptimisticCreate?: (values: string[]) => void;
  mode?: SelectionMode;
  placeholder?: string;
  searchPlaceholder?: string;
  selectedLabel?: (selected: string[]) => string;
  itemIcon?: LucideIcon;
  toastMessages?: {
    loading: string;
    success: string;
    err: string;
  };
}

export function ConfigMultiSelect({
  value,
  onChange,
  available,
  loading = false,
  onCreate,
  onAfterCreate,
  onOptimisticCreate,
  mode = "multi",
  placeholder = "Select or create...",
  searchPlaceholder = "Search or create...",
  selectedLabel,
  itemIcon: ItemIcon,
  toastMessages,
}: ConfigMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const normalized = search.trim();
  const selected = new Set(value);
  const unselected = available.filter((v) => !selected.has(v));

  const exactMatch = available.some(
    (v) => v.toLowerCase() === normalized.toLowerCase(),
  );
  const canCreate =
    normalized.length > 0 &&
    !exactMatch &&
    !value.some((v) => v.toLowerCase() === normalized.toLowerCase());

  const triggerLabel = (() => {
    if (mode === "single") return value[0] ?? placeholder;
    if (selectedLabel) return selectedLabel(value);
    return value.length
      ? `${value.length} selected`
      : placeholder;
  })();

  const handleSelect = (item: string) => {
    if (mode === "single") {
      onChange([item]);
      setOpen(false);
    } else {
      onChange([...value, item]);
    }
    setSearch("");
  };

  const handleRemove = (item: string) => {
    onChange(value.filter((v) => v !== item));
  };

  const handleCreate = async () => {
    if (!canCreate) return;

    if (mode === "single") {
      onChange([normalized]);
      setOpen(false);
    } else {
      onChange([...value, normalized]);
    }
    onOptimisticCreate?.([...available, normalized].sort());
    setSearch("");

    const result = await callWithToast(
      () => onCreate(normalized),
      toastMessages ?? {
        loading: "Creating...",
        success: "Created",
        err: "Failed to create",
      },
    );

    if (result?.status === "success") {
      onAfterCreate?.(result.data.values);
    }
  };

  const showPills = mode === "multi" && value.length > 0;

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal text-muted-foreground"
            >
              <span className={value.length ? "text-foreground" : undefined}>
                {triggerLabel}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          }
        />

        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {loading ? (
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
                      {unselected.map((item) => (
                        <CommandItem
                          key={item}
                          value={item}
                          onSelect={() => handleSelect(item)}
                        >
                          {ItemIcon && <ItemIcon className="mr-2 h-3 w-3" />}
                          {item}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  <CommandEmpty>
                    {canCreate ? null : "No matches."}
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

      {showPills && (
        <div className="flex flex-wrap gap-2 animate-in fade-in duration-200">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-stretch overflow-hidden rounded-full border border-border bg-muted text-xs font-medium text-foreground"
            >
              <span className="flex items-center gap-1 py-1 pl-2.5 pr-1.5">
                {ItemIcon && (
                  <ItemIcon className="h-3 w-3 text-muted-foreground" />
                )}
                {item}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(item)}
                aria-label={`Remove ${item}`}
                className="flex items-center px-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
