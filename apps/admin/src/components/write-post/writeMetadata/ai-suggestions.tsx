"use client";

import { Sparkles, Check, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const norm = (s: string | undefined) => (s ?? "").trim().toLowerCase();
const differs = (a: string | undefined, b: string | undefined) =>
  norm(a) !== norm(b);

// ─── Char meter ───────────────────────────────────────────────────

function CharMeter({ len, max }: { len: number; max: number }) {
  const pct = Math.min((len / max) * 100, 100);
  const over = len > max;
  const near = !over && len / max >= 0.9;
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-[3px] w-10 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full transition-all",
            over
              ? "bg-destructive"
              : near
                ? "bg-amber-500"
                : "bg-emerald-500/70",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={cn(
          "text-[11px] tabular-nums font-mono",
          over ? "text-destructive" : "text-muted-foreground/70",
        )}
      >
        {len}/{max}
      </span>
    </div>
  );
}

// ─── Top banner ───────────────────────────────────────────────────

interface AISuggestionsBannerProps {
  changeCount: number;
  onApplyAll: () => void;
  onDiscard: () => void;
}

export function AISuggestionsBanner({
  changeCount,
  onApplyAll,
  onDiscard,
}: AISuggestionsBannerProps) {
  if (changeCount === 0) return null;

  return (
    <div className="rounded-lg border border-primary/25 bg-primary/[0.04] p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="h-8 w-8 shrink-0 rounded-md bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {changeCount} suggestion{changeCount === 1 ? "" : "s"} ready
          </p>
          <p className="text-xs text-muted-foreground">
            Review each field below
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDiscard}
          className="h-8 text-xs text-muted-foreground hover:text-foreground"
        >
          Discard
        </Button>
        <Button size="sm" onClick={onApplyAll} className="h-8 text-xs gap-1.5">
          <Check className="h-3.5 w-3.5" />
          Apply all
        </Button>
      </div>
    </div>
  );
}

// ─── Field-level inline diff ──────────────────────────────────────

interface FieldSuggestionProps {
  current: string | undefined;
  suggested: string | undefined;
  max?: number;
  onApply: () => void;
  onSkip: () => void;
}

export function FieldSuggestion({
  current,
  suggested,
  max,
  onApply,
  onSkip,
}: FieldSuggestionProps) {
  if (!suggested || !differs(current, suggested)) return null;

  return (
    <div className="mt-1.5 rounded-md border border-primary/20 bg-primary/[0.03] overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-primary/10">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
            Suggested
          </span>
        </div>
        {max != null && <CharMeter len={suggested.length} max={max} />}
      </div>

      {current ? (
        <p className="px-3 pt-2 text-xs leading-snug text-muted-foreground/60 line-through decoration-muted-foreground/30 break-words">
          {current}
        </p>
      ) : null}

      <p className="px-3 pt-1 pb-2.5 text-sm leading-snug text-foreground break-words">
        {suggested}
      </p>

      <div className="flex items-center justify-end gap-1 px-2 py-1.5 border-t border-primary/10 bg-background/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Skip
        </Button>
        <Button
          size="sm"
          onClick={onApply}
          className="h-7 px-2.5 text-xs gap-1"
        >
          <Check className="h-3 w-3" />
          Apply
        </Button>
      </div>
    </div>
  );
}

// ─── Tag suggestions (inline ghost chips) ─────────────────────────

interface TagSuggestionsProps {
  current: string[];
  suggested: string[] | undefined;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  onDismissAddition: (tag: string) => void;
  onDismissRemoval: (tag: string) => void;
}

export function TagSuggestions({
  current,
  suggested,
  onAdd,
  onRemove,
  onDismissAddition,
  onDismissRemoval,
}: TagSuggestionsProps) {
  if (!suggested) return null;

  const currentSet = new Set(current);
  const suggestedSet = new Set(suggested);
  const additions = suggested.filter((t) => !currentSet.has(t));
  const removals = current.filter((t) => !suggestedSet.has(t));

  if (additions.length === 0 && removals.length === 0) return null;

  return (
    <div className="space-y-1.5 pt-3 mt-1 border-t border-border/40">
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
          Suggested tag changes
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {additions.map((tag) => (
          <span
            key={`add-${tag}`}
            className="inline-flex items-center rounded-full border border-dashed border-primary/40 bg-primary/[0.04] pl-2 pr-0.5 text-xs font-medium text-primary"
          >
            <Plus className="h-3 w-3 mr-1" />
            <span className="py-0.5">{tag}</span>
            <button
              type="button"
              onClick={() => onAdd(tag)}
              title="Add this tag"
              className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-primary/15 transition-colors"
            >
              <Check className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => onDismissAddition(tag)}
              title="Skip"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/60 hover:bg-muted hover:text-foreground transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
          </span>
        ))}
        {removals.map((tag) => (
          <span
            key={`rem-${tag}`}
            className="inline-flex items-center rounded-full border border-dashed border-destructive/40 bg-destructive/[0.04] pl-2 pr-0.5 text-xs font-medium text-destructive"
          >
            <Minus className="h-3 w-3 mr-1" />
            <span className="py-0.5 line-through">{tag}</span>
            <button
              type="button"
              onClick={() => onRemove(tag)}
              title="Remove this tag"
              className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-destructive/15 transition-colors"
            >
              <Check className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => onDismissRemoval(tag)}
              title="Keep tag"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/60 hover:bg-muted hover:text-foreground transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
