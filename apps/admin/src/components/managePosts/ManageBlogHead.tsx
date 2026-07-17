"use client";

import { BlogStatus } from "@tabsircg/schemas/blog";
import { Button } from "premium-ds/button";
import { TextField } from "premium-ds/text-field";
import { Select } from "premium-ds/select";
import { X, MagnifyingGlass } from "@phosphor-icons/react";

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
        <div className="w-40">
          <Select
            value={filters.status}
            onChange={(v) => onFilterChange("status", v as any)}
            options={STATUS_OPTIONS}
            leadingIcon={<span className="mr-1 text-muted-foreground">Status:</span>}
            ariaLabel="Status"
          />
        </div>
        <div className="w-40">
          <Select
            value={filters.kind}
            onChange={(v) => onFilterChange("kind", v)}
            options={kindOptions}
            leadingIcon={<span className="mr-1 text-muted-foreground">Kind:</span>}
            ariaLabel="Kind"
          />
        </div>
        <div className="w-40">
          <Select
            value={filters.schemaType}
            onChange={(v) => onFilterChange("schemaType", v)}
            options={schemaTypeOptions}
            leadingIcon={<span className="mr-1 text-muted-foreground">Schema:</span>}
            ariaLabel="Schema"
          />
        </div>
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
