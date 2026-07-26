"use client";

import { Button } from "premium-ds/button";
import { Popover } from "premium-ds/popover";
import { TextField } from "premium-ds/text-field";
import { useState } from "react";
import { CaretUpDown, Plus, X } from "@phosphor-icons/react";
import { callWithToast } from "@/lib/utils";
import type { ApiResponse } from "@/lib/appUtils";

type SelectionMode = "single" | "multi";

interface ConfigMultiSelectProps {
  value: string[];
  onChange: (next: string[]) => void;
  available: string[];
  loading?: boolean;
  onCreate: (value: string) => Promise<ApiResponse<{ values: string[] }>>;
  onAfterCreate?: (values: string[]) => void;
  onOptimisticCreate?: (values: string[]) => void;
  mode?: SelectionMode;
  placeholder?: string;
  searchPlaceholder?: string;
  selectedLabel?: (selected: string[]) => string;
  itemIcon?: any;
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
    return value.length ? `${value.length} selected` : placeholder;
  })();

  const handleSelect = (item: string, close: () => void) => {
    if (mode === "single") {
      onChange([item]);
      close();
    } else {
      onChange([...value, item]);
    }
    setSearch("");
  };

  const handleRemove = (item: string) => {
    onChange(value.filter((v) => v !== item));
  };

  const handleCreate = async (close: () => void) => {
    if (!canCreate) return;

    if (mode === "single") {
      onChange([normalized]);
      close();
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

  const filteredUnselected = unselected.filter((item) =>
    item.toLowerCase().includes(normalized.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <Popover
        side="bottom"
        align="start"
        trigger={
          <Button
            variant="secondary"
            className="w-full justify-between font-normal text-muted-foreground"
            iconRight={<CaretUpDown size={16} className="opacity-50" />}
          >
            <span className={value.length ? "text-foreground" : undefined}>
              {triggerLabel}
            </span>
          </Button>
        }
      >
        {({ close }) => (
          <div className="flex max-h-80 w-64 flex-col space-y-2 overflow-hidden rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-dialog">
            <TextField
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="sm"
              htmlProps={{ autoFocus: true }}
            />

            <div className="flex-1 space-y-1 overflow-y-auto pr-1">
              {loading ? (
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
                  {filteredUnselected.length > 0 ? (
                    <div className="space-y-0.5">
                      <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Existing
                      </div>
                      {filteredUnselected.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleSelect(item, close)}
                          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-foreground/4"
                        >
                          {ItemIcon && (
                            <ItemIcon
                              className="shrink-0 text-muted-foreground"
                              size={14}
                            />
                          )}
                          <span>{item}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    !canCreate && (
                      <div className="py-3 text-center text-xs text-muted-foreground">
                        No matches.
                      </div>
                    )
                  )}
                  {canCreate && (
                    <button
                      type="button"
                      onClick={() => handleCreate(close)}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      <Plus size={14} className="shrink-0" />
                      <span>Create &quot;{normalized}&quot;</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Popover>

      {showPills && (
        <div className="flex animate-in flex-wrap gap-2 duration-200 fade-in">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-stretch overflow-hidden rounded-full border border-border bg-muted text-xs font-medium text-foreground"
            >
              <span className="flex items-center gap-1 py-1 pr-1.5 pl-2.5">
                {ItemIcon && (
                  <ItemIcon className="text-muted-foreground" size={12} />
                )}
                {item}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(item)}
                aria-label={`Remove ${item}`}
                className="flex cursor-pointer items-center px-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
