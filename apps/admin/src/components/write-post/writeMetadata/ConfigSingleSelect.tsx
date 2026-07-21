"use client";

import { useState } from "react";
import { Button } from "premium-ds/button";
import { Popover } from "premium-ds/popover";
import { TextField } from "premium-ds/text-field";
import { Check, CaretUpDown, Plus } from "@phosphor-icons/react";
import { useCustomSWR } from "@/hooks/useCustomSwr";
import {
  addConfigValue,
  type BlogConfig,
  type ConfigField,
} from "@/actions/configActions";
import { callWithToast } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ConfigSingleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  field: Exclude<ConfigField, "tags">;
  placeholder?: string;
  className?: string;
}

export default function ConfigSingleSelect({
  value,
  onValueChange,
  field,
  placeholder = "Select...",
  className,
}: ConfigSingleSelectProps) {
  const { data, mutate, isLoading } = useCustomSWR<BlogConfig>("/api/config");
  const available = data?.[field] ?? [];

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const trimmed = search.trim();
  const normalized = trimmed.toLowerCase();
  const exactMatch = available.some((v) => v.toLowerCase() === normalized);
  const canCreate = trimmed.length > 0 && !exactMatch;

  const filtered = available.filter((opt) =>
    opt.toLowerCase().includes(normalized),
  );

  const handleSelect = (next: string) => {
    onValueChange(next);
    setSearch("");
    setOpen(false);
  };

  const handleCreate = async () => {
    if (!canCreate) return;

    onValueChange(trimmed);
    const optimistic = [...available, trimmed].sort((a, b) =>
      a.localeCompare(b),
    );
    mutate((prev) => (prev ? { ...prev, [field]: optimistic } : prev), false);
    setSearch("");
    setOpen(false);

    const result = await callWithToast(() => addConfigValue(field, trimmed), {
      loading: "Saving...",
      success: "Added",
      err: "Failed to add",
    });

    if (result?.status === "success") {
      mutate(
        (prev) => (prev ? { ...prev, [field]: result.data.values } : prev),
        false,
      );
      onValueChange(result.data.value);
    } else {
      await mutate();
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="start"
      trigger={
        <Button
          variant="secondary"
          htmlProps={{ role: "combobox" }}
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className,
          )}
          iconRight={<CaretUpDown size={14} className="opacity-50" />}
        >
          <span className="truncate capitalize">{value || placeholder}</span>
        </Button>
      }
    >
      <div className="w-64 space-y-3 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-card-hover">
        <TextField
          id="config-search"
          placeholder="Search or create..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="sm"
          htmlProps={{ autoFocus: true }}
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
              {filtered.length > 0 && (
                <div className="space-y-1">
                  <span className="block px-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Existing
                  </span>
                  {filtered.map((opt) => {
                    const isCurrent = opt === value;
                    return (
                      <button
                        key={opt}
                        type="button"
                        className="flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleSelect(opt)}
                      >
                        <Check
                          className={cn(
                            "mr-2 size-4 shrink-0",
                            isCurrent ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="truncate">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {filtered.length === 0 && !canCreate && (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No matches.
                </div>
              )}
              {canCreate && (
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-left text-sm font-medium text-primary transition-colors hover:bg-accent hover:text-accent-foreground"
                  onClick={handleCreate}
                >
                  <Plus className="mr-2 size-4 shrink-0" />
                  <span className="truncate">Create &quot;{trimmed}&quot;</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </Popover>
  );
}
