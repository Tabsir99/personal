"use client";

import { ArrowClockwise } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "premium-ds/button";

interface GenerateMetadataButtonProps {
  onClick: () => void;
  loading?: boolean | undefined;
  hasGenerated?: boolean | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
}

export function GenerateMetadataButton({
  onClick,
  loading = false,
  hasGenerated = false,
  disabled = false,
  className,
}: GenerateMetadataButtonProps) {
  const showRegenerate = hasGenerated && !loading;

  return (
    <Button
      variant="secondary"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        loading
          ? "text-foreground/60"
          : "text-foreground/80 hover:text-foreground",
        className,
      )}
      aria-busy={loading || undefined}
      iconLeft={
        showRegenerate && !loading ? (
          <ArrowClockwise
            className="size-3 opacity-50 transition-opacity group-hover:opacity-80"
            aria-hidden
          />
        ) : undefined
      }
    >
      {loading ? (
        <>
          <span
            className="size-1.5 animate-pulse rounded-full bg-foreground/55"
            aria-hidden
          />
          <span>Generating</span>
          <Ellipsis />
        </>
      ) : showRegenerate ? (
        <span>Regenerate metadata</span>
      ) : (
        <span>Generate metadata</span>
      )}
    </Button>
  );
}

// A three-dot ellipsis with staggered fade — calmer than "Generating..." text
// because the dots animate independently, signaling work without flashing the
// whole label.
function Ellipsis() {
  return (
    <span className="ml-px inline-flex items-baseline gap-px" aria-hidden>
      <Dot delay="0ms" />
      <Dot delay="160ms" />
      <Dot delay="320ms" />
    </span>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <>
      <style>{`
        @keyframes gm-dot {
          0%, 60%, 100% { opacity: 0.2; }
          30% { opacity: 0.9; }
        }
      `}</style>
      <span
        className="inline-block"
        style={{
          animation: `gm-dot 1.2s ease-in-out ${delay} infinite`,
        }}
      >
        .
      </span>
    </>
  );
}

interface SuggestionsActionBarProps {
  count: number;
  onApplyAll: () => void;
  onDiscardAll: () => void;
  applying?: boolean | undefined;
  className?: string | undefined;
}

export function SuggestionsActionBar({
  count,
  onApplyAll,
  onDiscardAll,
  applying = false,
  className,
}: SuggestionsActionBarProps) {
  if (count === 0) return null;

  return (
    <div
      className={cn(
        "mx-auto flex items-center justify-between gap-20",
        "rounded-lg px-3.5 py-2",
        "border border-border bg-card",
        "animate-in duration-200 fade-in slide-in-from-top-2",
        className,
      )}
      role="region"
      aria-label="AI suggestions"
    >
      <div className="flex min-w-0 items-baseline gap-1.5">
        <span className="shrink-0 text-sm font-medium text-foreground tabular-nums">
          {count}
        </span>
        <span className="shrink-0 text-sm text-foreground/70">
          {count === 1 ? "suggestion" : "suggestions"}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="secondary"
          type="button"
          onClick={onDiscardAll}
          disabled={applying}
        >
          Discard all
        </Button>
        <Button
          type="button"
          onClick={onApplyAll}
          disabled={applying}
          aria-busy={applying || undefined}
          variant="primary"
        >
          {applying ? (
            <>
              <span
                className="size-1.5 animate-pulse rounded-full bg-primary-foreground/70"
                aria-hidden
              />
              <span>Applying</span>
            </>
          ) : (
            <span>Apply all</span>
          )}
        </Button>
      </div>
    </div>
  );
}

