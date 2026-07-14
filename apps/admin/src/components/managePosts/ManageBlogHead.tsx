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
            "flex h-9 w-auto cursor-pointer items-center justify-between gap-1.5 rounded-md border bg-card px-3 text-sm capitalize transition-colors hover:bg-foreground/3",
            isActive
              ? "border-primary/30 bg-primary/5 text-foreground hover:bg-primary/8"
              : "border-border text-foreground",
          )}
        >
          <span className="mr-1 text-muted-foreground">{label}:</span>
          <span className="font-medium">{activeOption?.label || value}</span>
        </button>
      }
    >
      {({ close }) => (
        <div className="flex w-40 flex-col rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-dialog">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                close();
                onChange(option.value);
              }}
              className={cn(
                "flex w-full cursor-pointer items-center rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                option.value === value
                  ? "bg-primary/8 font-medium text-primary"
                  : "text-foreground hover:bg-foreground/4",
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
    <div className="relative z-20 flex flex-wrap items-center gap-6">
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
