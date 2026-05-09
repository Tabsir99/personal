"use client";

import { useMemo, useState } from "react";
import { Sparkles, Plus, Minus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AIBlogMetadata } from "@tabsircg/schemas/ai";
import type { BlogFormData } from "@tabsircg/schemas/blog";
import { cn } from "@/lib/utils";

type ProseField = Exclude<keyof AIBlogMetadata, "tags">;

type CurrentValues = Pick<BlogFormData, ProseField | "tags">;

const FIELDS: { key: ProseField; label: string; max: number }[] = [
  { key: "title", label: "Title", max: 120 },
  { key: "dek", label: "Subtitle / Hook", max: 200 },
  { key: "excerpt", label: "Excerpt", max: 280 },
  { key: "seoTitle", label: "SEO Title", max: 60 },
  { key: "metaDescription", label: "Meta Description", max: 160 },
  { key: "socialTitle", label: "Social Title", max: 70 },
  { key: "socialDescription", label: "Social Description", max: 200 },
];

const norm = (s: string) => s.trim().toLowerCase();
const differs = (a: string, b: string) => norm(a) !== norm(b);

function charClass(len: number, max: number): string {
  if (len > max) return "text-destructive";
  if (len / max >= 0.9) return "text-amber-500";
  return "text-emerald-500/90";
}

interface MetadataDiffRowProps {
  label: string;
  current: string;
  suggested: string;
  max: number;
  isOn: boolean;
  onToggle: (next: boolean) => void;
}

function MetadataDiffRow({
  label,
  current,
  suggested,
  max,
  isOn,
  onToggle,
}: MetadataDiffRowProps) {
  const changed = differs(current, suggested) && suggested.length > 0;
  const len = suggested.length;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card/40 p-4 transition-colors",
        changed ? "border-primary/30" : "border-border/60",
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          {changed ? (
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] border-primary/40 text-primary"
            >
              changed
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] border-border text-muted-foreground"
            >
              same
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("text-[11px] tabular-nums", charClass(len, max))}>
            {len}/{max}
          </span>
          <Switch
            size="sm"
            checked={isOn}
            onCheckedChange={onToggle}
            disabled={!changed}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Current
          </div>
          <p
            className={cn(
              "text-sm leading-relaxed text-muted-foreground/90 break-words",
              changed && isOn && "line-through opacity-60",
              !current && "italic text-muted-foreground/50",
            )}
          >
            {current || "(empty)"}
          </p>
        </div>
        <div className={cn("md:border-l md:pl-3", changed && "border-primary/40")}>
          <div className="text-[10px] uppercase tracking-wider text-primary/80 mb-1">
            AI Suggestion
          </div>
          <p
            className={cn(
              "text-sm leading-relaxed text-foreground break-words",
              !suggested && "italic text-muted-foreground/50",
            )}
          >
            {suggested || "(empty)"}
          </p>
        </div>
      </div>
    </div>
  );
}

interface TagDiffRowProps {
  current: string[];
  suggested: string[];
  additionsOn: Record<string, boolean>;
  removalsOn: Record<string, boolean>;
  onToggleAddition: (tag: string, next: boolean) => void;
  onToggleRemoval: (tag: string, next: boolean) => void;
}

function TagDiffRow({
  current,
  suggested,
  additionsOn,
  removalsOn,
  onToggleAddition,
  onToggleRemoval,
}: TagDiffRowProps) {
  const currentSet = new Set(current);
  const suggestedSet = new Set(suggested);
  const additions = suggested.filter((t) => !currentSet.has(t));
  const removals = current.filter((t) => !suggestedSet.has(t));
  const kept = current.filter((t) => suggestedSet.has(t));
  const hasChanges = additions.length > 0 || removals.length > 0;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card/40 p-4",
        hasChanges ? "border-primary/30" : "border-border/60",
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Tags
        </span>
        {hasChanges ? (
          <Badge
            variant="outline"
            className="h-5 px-1.5 text-[10px] border-primary/40 text-primary"
          >
            {additions.length} added · {removals.length} removed
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="h-5 px-1.5 text-[10px] border-border text-muted-foreground"
          >
            same
          </Badge>
        )}
      </div>

      {!hasChanges && kept.length === 0 ? (
        <p className="text-sm italic text-muted-foreground/50">No tags.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {kept.map((tag) => (
            <Badge
              key={`kept-${tag}`}
              variant="outline"
              className="text-xs border-border text-muted-foreground"
            >
              {tag}
            </Badge>
          ))}
          {additions.map((tag) => {
            const on = additionsOn[tag] ?? true;
            return (
              <button
                key={`add-${tag}`}
                type="button"
                onClick={() => onToggleAddition(tag, !on)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
                  on
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                    : "border-dashed border-border text-muted-foreground/60 line-through",
                )}
                title={on ? "Click to skip adding" : "Click to add"}
              >
                <Plus className="h-3 w-3" />
                {tag}
              </button>
            );
          })}
          {removals.map((tag) => {
            const on = removalsOn[tag] ?? false;
            return (
              <button
                key={`rem-${tag}`}
                type="button"
                onClick={() => onToggleRemoval(tag, !on)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
                  on
                    ? "border-destructive/40 bg-destructive/10 text-destructive line-through"
                    : "border-dashed border-border text-muted-foreground/60",
                )}
                title={on ? "Click to keep" : "Click to remove"}
              >
                <Minus className="h-3 w-3" />
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface AIMetadataPreviewModalProps {
  open: boolean;
  onClose: () => void;
  suggestion: AIBlogMetadata;
  currentValues: CurrentValues;
  onApply: (partial: Partial<BlogFormData>) => void;
}

export default function AIMetadataPreviewModal({
  open,
  onClose,
  suggestion,
  currentValues,
  onApply,
}: AIMetadataPreviewModalProps) {
  const initialApplyMap = useMemo(() => {
    const map = {} as Record<ProseField, boolean>;
    for (const { key } of FIELDS) {
      const current = currentValues[key] ?? "";
      const suggested = suggestion[key] ?? "";
      map[key] = differs(current, suggested) && suggested.length > 0;
    }
    return map;
  }, [suggestion, currentValues]);

  const initialAdditions = useMemo(() => {
    const cur = new Set(currentValues.tags ?? []);
    const map: Record<string, boolean> = {};
    for (const t of suggestion.tags) if (!cur.has(t)) map[t] = true;
    return map;
  }, [suggestion.tags, currentValues.tags]);

  const initialRemovals = useMemo(() => {
    const sug = new Set(suggestion.tags);
    const map: Record<string, boolean> = {};
    for (const t of currentValues.tags ?? []) if (!sug.has(t)) map[t] = false;
    return map;
  }, [suggestion.tags, currentValues.tags]);

  const [applyMap, setApplyMap] = useState(initialApplyMap);
  const [additionsOn, setAdditionsOn] = useState(initialAdditions);
  const [removalsOn, setRemovalsOn] = useState(initialRemovals);

  const handleApply = () => {
    const partial: Partial<BlogFormData> = {};
    for (const { key } of FIELDS) {
      if (applyMap[key]) partial[key] = suggestion[key];
    }
    const tagAddsOn = Object.entries(additionsOn).some(([, on]) => on);
    const tagRemsOn = Object.entries(removalsOn).some(([, on]) => on);
    if (tagAddsOn || tagRemsOn) {
      const cur = new Set(currentValues.tags ?? []);
      for (const [tag, on] of Object.entries(removalsOn)) {
        if (on) cur.delete(tag);
      }
      for (const [tag, on] of Object.entries(additionsOn)) {
        if (on) cur.add(tag);
      }
      partial.tags = Array.from(cur);
    }
    onApply(partial);
    onClose();
  };

  const selectedCount =
    Object.values(applyMap).filter(Boolean).length +
    (Object.values(additionsOn).some(Boolean) ||
    Object.values(removalsOn).some(Boolean)
      ? 1
      : 0);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-4 w-4 text-primary" />
            Review AI suggestions
          </DialogTitle>
          <DialogDescription>
            Pick which fields to apply. Identical-value rows are disabled by
            default.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {FIELDS.map(({ key, label, max }) => (
            <MetadataDiffRow
              key={key}
              label={label}
              current={currentValues[key] ?? ""}
              suggested={suggestion[key] ?? ""}
              max={max}
              isOn={applyMap[key]}
              onToggle={(next) => setApplyMap((m) => ({ ...m, [key]: next }))}
            />
          ))}
          <TagDiffRow
            current={currentValues.tags ?? []}
            suggested={suggestion.tags}
            additionsOn={additionsOn}
            removalsOn={removalsOn}
            onToggleAddition={(tag, next) =>
              setAdditionsOn((m) => ({ ...m, [tag]: next }))
            }
            onToggleRemoval={(tag, next) =>
              setRemovalsOn((m) => ({ ...m, [tag]: next }))
            }
          />
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-card/40 -mx-0 -mb-0 rounded-none">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={selectedCount === 0}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            Apply Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
