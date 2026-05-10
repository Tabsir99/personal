"use client";

import { useState } from "react";
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
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useCustomSWR } from "@/hooks/useCustomSwr";
import {
  addConfigValue,
  type ConfigField,
} from "@/actions/configActions";
import { callWithToast } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ConfigSingleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  field: Exclude<ConfigField, "tags">;
  apiPath: string;
  placeholder?: string;
  className?: string;
}

export default function ConfigSingleSelect({
  value,
  onValueChange,
  field,
  apiPath,
  placeholder = "Select...",
  className,
}: ConfigSingleSelectProps) {
  const { data, mutate, isLoading } = useCustomSWR<string[]>(apiPath);
  const available = data ?? [];

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const trimmed = search.trim();
  const exactMatch = available.some(
    (v) => v.toLowerCase() === trimmed.toLowerCase(),
  );
  const canCreate = trimmed.length > 0 && !exactMatch;

  const handleSelect = (next: string) => {
    onValueChange(next);
    setSearch("");
    setOpen(false);
  };

  const handleCreate = async () => {
    if (!canCreate) return;

    onValueChange(trimmed);
    mutate([...available, trimmed].sort((a, b) => a.localeCompare(b)), false);
    setSearch("");
    setOpen(false);

    const result = await callWithToast(
      () => addConfigValue(field, trimmed),
      {
        loading: "Saving...",
        success: "Added",
        err: "Failed to add",
      },
    );

    if (result?.status === "success") {
      mutate(result.data.values, false);
      onValueChange(result.data.value);
    } else {
      await mutate();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal",
              !value && "text-muted-foreground",
              className,
            )}
          >
            <span className="truncate">{value || placeholder}</span>
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
                Loading...
              </div>
            ) : (
              <>
                {available.length > 0 && (
                  <CommandGroup heading="Existing">
                    {available.map((opt) => {
                      const isCurrent = opt === value;
                      return (
                        <CommandItem
                          key={opt}
                          value={opt}
                          onSelect={() => handleSelect(opt)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              isCurrent ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {opt}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
                <CommandEmpty>
                  {canCreate ? null : "No matches."}
                </CommandEmpty>
                {canCreate && (
                  <CommandGroup>
                    <CommandItem
                      value={`__create__${trimmed}`}
                      onSelect={handleCreate}
                      className="text-primary"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create &quot;{trimmed}&quot;
                    </CommandItem>
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
