"use client";

import { BlogStatus } from "@tabsircg/schemas/blog";
import { Button } from "premium-ds/button";
import { Popover } from "premium-ds/popover";
import { TextField } from "premium-ds/text-field";
import { X, MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useCustomSWR } from "@/hooks/useCustomSwr";
import type { BlogConfig } from "@/actions/configActions";

export type BlogFilters = {
  status: BlogStatus | "all";
  kind: string | "all";
  schemaType: string | "all";
};

const STATUS_OPTIONS: { value: BlogFilters["status"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: BlogStatus.published, label: "Published" },
  { value: BlogStatus.unpublished, label: "Unpublished" },
  { value: BlogStatus.archived, label: "Archived" },
];

type FilterChipProps<T extends string> = {
  label: string;
  value: T;
  defaultValue: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
};

function FilterChip<T extends string>({
  label,
  value,
  defaultValue,
  onChange,
  options,
}: FilterChipProps<T>) {
  const isActive = value !== defaultValue;
  const activeOption = options.find((o) => o.value === value);

  return (
    <Popover
      side="bottom"
      align="start"
      trigger={
        <button
          type="button"
          className={cn(
            "w-auto capitalize h-9 px-3 gap-1.5 rounded-md border bg-card text-sm transition-colors hover:bg-foreground/3 flex items-center justify-between cursor-pointer",
            isActive
              ? "border-primary/30 bg-primary/5 text-foreground hover:bg-primary/8"
              : "border-border text-foreground",
          )}
        >
          <span className="text-muted-foreground mr-1">{label}:</span>
          <span className="font-medium">{activeOption?.label || value}</span>
        </button>
      }
    >
      {({ close }) => (
        <div className="flex flex-col p-1 w-40 bg-popover text-popover-foreground rounded-lg border border-border shadow-dialog">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                close();
                onChange(option.value);
              }}
              className={cn(
                "flex w-full items-center px-3 py-1.5 text-left text-sm rounded-md transition-colors cursor-pointer",
                option.value === value
                  ? "bg-primary/8 text-primary font-medium"
                  : "hover:bg-foreground/4 text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </Popover>
  );
}

export default function ManagePostHead({
  searchTerm,
  setSearchTerm,
  filters,
  onFilterChange,
  onClearFilters,
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filters: BlogFilters;
  onFilterChange: <K extends keyof BlogFilters>(
    key: K,
    value: BlogFilters[K],
  ) => void;
  onClearFilters: () => void;
}) {
  const { data: config } = useCustomSWR<BlogConfig>("/api/config");

  const kindOptions: { value: string; label: string }[] = [
    { value: "all", label: "All" },
    ...(config?.kinds ?? []).map((v) => ({ value: v, label: v })),
  ];
  const schemaTypeOptions: { value: string; label: string }[] = [
    { value: "all", label: "All" },
    ...(config?.schemaTypes ?? []).map((v) => ({ value: v, label: v })),
  ];

  const anyActive =
    filters.status !== "all" ||
    filters.kind !== "all" ||
    filters.schemaType !== "all";

  return (
    <div className="flex flex-wrap items-center gap-6 relative z-20">
      <div className="w-full sm:w-72">
        <TextField
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leadingIcon={<MagnifyingGlass size={16} />}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <FilterChip
          label="Status"
          value={filters.status}
          defaultValue="all"
          onChange={(v) => onFilterChange("status", v)}
          options={STATUS_OPTIONS}
        />
        <FilterChip
          label="Kind"
          value={filters.kind}
          defaultValue="all"
          onChange={(v) => onFilterChange("kind", v)}
          options={kindOptions}
        />
        <FilterChip
          label="Schema"
          value={filters.schemaType}
          defaultValue="all"
          onChange={(v) => onFilterChange("schemaType", v)}
          options={schemaTypeOptions}
        />
        {anyActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 px-2.5 text-sm text-muted-foreground hover:text-foreground"
            iconLeft={<X size={14} />}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
