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
  const exactMatch = available.some(
    (v) => v.toLowerCase() === normalized,
  );
  const canCreate = trimmed.length > 0 && !exactMatch;

  const filtered = available.filter((opt) =>
    opt.toLowerCase().includes(normalized)
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
          role="combobox"
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
      <div className="w-64 p-3 bg-popover text-popover-foreground rounded-md shadow-md border border-border space-y-3">
        <TextField
          id="config-search"
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
              {filtered.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground px-2 uppercase tracking-wider block">
                    Existing
                  </span>
                  {filtered.map((opt) => {
                    const isCurrent = opt === value;
                    return (
                      <button
                        key={opt}
                        type="button"
                        className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground flex items-center transition-colors cursor-pointer"
                        onClick={() => handleSelect(opt)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 shrink-0",
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
                <div className="text-sm text-muted-foreground px-2 py-4 text-center">
                  No matches.
                </div>
              )}
              {canCreate && (
                <button
                  type="button"
                  className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground flex items-center text-primary font-medium transition-colors cursor-pointer"
                  onClick={handleCreate}
                >
                  <Plus className="mr-2 h-4 w-4 shrink-0" />
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


