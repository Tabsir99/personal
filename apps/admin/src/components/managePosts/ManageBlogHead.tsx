import { BlogKind, BlogStatus, SchemaType } from "@/schemas/blogSchemas";
import SearchInput from "../ui/common/SearchInput";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "../ui/select";

export type BlogFilters = {
  status: BlogStatus | "all";
  kind: BlogKind | "all";
  schemaType: SchemaType | "all";
};

const STATUS_OPTIONS: { value: BlogFilters["status"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: BlogStatus.published, label: "Published" },
  { value: BlogStatus.unpublished, label: "Unpublished" },
  { value: BlogStatus.draft, label: "Draft" },
  { value: BlogStatus.archived, label: "Archived" },
];

const KIND_OPTIONS: { value: BlogFilters["kind"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: "essay", label: "Essay" },
  { value: "deep-dive", label: "Deep Dive" },
  { value: "war-story", label: "War Story" },
  { value: "notes", label: "Notes" },
];

const SCHEMA_TYPE_OPTIONS: {
  value: BlogFilters["schemaType"];
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: SchemaType.Article, label: "Article" },
  { value: SchemaType.BlogPosting, label: "Blog Posting" },
  { value: SchemaType.NewsArticle, label: "News Article" },
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
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger
        className={cn(
          "w-auto capitalize h-9 px-3 gap-1.5 rounded-full border bg-card text-sm transition-colors hover:bg-accent/50",
          isActive
            ? "border-primary/40 bg-primary/5 text-foreground hover:bg-primary/10"
            : "border-border text-foreground",
        )}
      >
        <span className="text-muted-foreground">{label}</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-md" sideOffset={6}>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer text-sm"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
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
  const anyActive =
    filters.status !== "all" ||
    filters.kind !== "all" ||
    filters.schemaType !== "all";

  return (
    <div className="flex flex-wrap items-center gap-2 relative z-20">
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
        options={KIND_OPTIONS}
      />
      <FilterChip
        label="Schema"
        value={filters.schemaType}
        defaultValue="all"
        onChange={(v) => onFilterChange("schemaType", v)}
        options={SCHEMA_TYPE_OPTIONS}
      />
      {anyActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-9 px-2.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
      <div className="ml-auto">
        <SearchInput
          searchTerm={searchTerm}
          handleChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
}
