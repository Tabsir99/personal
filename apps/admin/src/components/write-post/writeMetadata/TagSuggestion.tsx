import { Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="mt-1 space-y-2 border-t border-border/50 pt-3">
      {additions.length > 0 && (
        <SuggestionRow eyebrow="Add" count={additions.length}>
          {additions.map((tag) => (
            <SuggestedChip
              key={`add-${tag}`}
              kind="add"
              tag={tag}
              onAccept={() => onAdd(tag)}
              onDismiss={() => onDismissAddition(tag)}
            />
          ))}
        </SuggestionRow>
      )}

      {removals.length > 0 && (
        <SuggestionRow eyebrow="Remove" count={removals.length}>
          {removals.map((tag) => (
            <SuggestedChip
              key={`rem-${tag}`}
              kind="remove"
              tag={tag}
              onAccept={() => onRemove(tag)}
              onDismiss={() => onDismissRemoval(tag)}
            />
          ))}
        </SuggestionRow>
      )}
    </div>
  );
}

function SuggestionRow({
  eyebrow,
  count,
  children,
}: {
  eyebrow: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
      <div className="flex shrink-0 items-baseline gap-1.5 text-muted-foreground">
        <span className="text-xs font-medium text-muted-foreground">
          {eyebrow}
        </span>
        <span className="text-xs text-muted-foreground/50">·</span>
        <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function SuggestedChip({
  kind,
  tag,
  onAccept,
  onDismiss,
}: {
  kind: "add" | "remove";
  tag: string;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const isAdd = kind === "add";
  const Icon = isAdd ? Plus : Minus;

  return (
    <div
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-full border border-dashed text-xs font-medium",
        isAdd
          ? "border-primary/40 bg-primary/4 text-primary"
          : "border-destructive/40 bg-destructive/4 text-destructive",
      )}
    >
      <button
        type="button"
        onClick={onAccept}
        className={cn(
          "flex items-center gap-1 py-0.5 pl-2 pr-2 transition-colors",
          isAdd ? "hover:bg-primary/10" : "hover:bg-destructive/10",
        )}
        aria-label={isAdd ? `Add tag: ${tag}` : `Remove tag: ${tag}`}
      >
        <Icon className="h-3 w-3" strokeWidth={2.5} />
        <span
          className={cn(!isAdd && "line-through decoration-destructive/20")}
        >
          {tag}
        </span>
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className={cn(
          "flex items-center border-l px-1.5 transition-colors",
          isAdd
            ? "border-primary/20 text-primary/40 hover:bg-primary/10 hover:text-primary/80"
            : "border-destructive/20 text-destructive/40 hover:bg-destructive/10 hover:text-destructive/80",
        )}
        aria-label={isAdd ? `Skip adding ${tag}` : `Keep ${tag}`}
      >
        <X className="h-3 w-3" strokeWidth={2} />
      </button>
    </div>
  );
}
