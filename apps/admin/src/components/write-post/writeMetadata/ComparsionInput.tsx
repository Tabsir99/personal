import { Button } from "premium-ds/button";
import { TextField } from "premium-ds/text-field";
import { Textarea } from "premium-ds/textarea";
import { Kbd } from "@/components/ui/Kbd";
import { cn } from "@/lib/utils";
import { Check, X } from "@phosphor-icons/react";
import {
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

const norm = (s: string | null | undefined): string => (s ?? "").trim();
const differs = (
  a: string | null | undefined,
  b: string | null | undefined,
): boolean => norm(a).toLowerCase() !== norm(b).toLowerCase();

type Phase = "idle" | "accepting" | "applied" | "dismissed";
type PressedKey = "tab" | "esc" | null;

export interface SuggestionFieldProps {
  id?: string | undefined;
  type?: string | undefined;
  helperText?: ReactNode;
  placeholder?: string | undefined;
  value: string | undefined;
  onChange: (next: string) => void;
  suggested?: string | null | undefined;
  onAccept?: ((applied: string) => void) | undefined;
  onReject?: ((rejected: string) => void) | undefined;
  className?: string | undefined;
  multiLine?: boolean | undefined;
}

export function SuggestionField({
  id,
  type = "text",
  helperText,
  placeholder,
  value,
  onChange,
  suggested,
  onAccept,
  onReject,
  className = "",
  multiLine = false,
}: SuggestionFieldProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [pressedKey, setPressedKey] = useState<PressedKey>(null);
  const [dismissedSuggestion, setDismissedSuggestion] = useState<string | null>(
    null,
  );

  const activeSuggestion: string | null =
    suggested != null &&
    suggested.length > 0 &&
    differs(value, suggested) &&
    suggested !== dismissedSuggestion
      ? suggested
      : null;

  const accept = (): void => {
    if (activeSuggestion == null || phase !== "idle") return;
    setPressedKey("tab");
    setPhase("accepting");
    setTimeout(() => setPressedKey(null), 140);
    setTimeout(() => {
      onChange(activeSuggestion);
      onAccept?.(activeSuggestion);
      setPhase("applied");
      setTimeout(() => setPhase("idle"), 1100);
    }, 360);
  };

  const reject = (): void => {
    if (activeSuggestion == null || phase !== "idle") return;
    setPressedKey("esc");
    setDismissedSuggestion(suggested ?? null);
    onReject?.(activeSuggestion);
    setPhase("dismissed");
    setTimeout(() => setPressedKey(null), 140);
    setTimeout(() => setPhase("idle"), 1100);
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    if (activeSuggestion == null || phase !== "idle" || e.defaultPrevented)
      return;
    if (e.key === "Tab") {
      e.preventDefault();
      accept();
    } else if (e.key === "Escape") {
      e.preventDefault();
      reject();
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    onChange(e.target.value);
  };

  const stripVisible = phase !== "idle" || activeSuggestion != null;
  const striking = activeSuggestion != null && phase === "idle";
  const applyingOrApplied = phase === "accepting" || phase === "applied";

  return (
    <div className={`w-full ${className}`}>
      <div className="overflow-hidden rounded-lg bg-background ring-1 ring-border/50 transition-all duration-200 focus-within:ring-2 focus-within:ring-border focus-within:ring-offset-2">
        {multiLine ? (
          <Textarea
            id={id}
            placeholder={placeholder}
            value={value ?? ""}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full border-none bg-transparent [&_.txa]:border-none [&_.txa]:bg-transparent [&_.txa]:shadow-none [&_.txa__input]:bg-transparent [&_.txa__input]:focus:shadow-none [&_.txa__input]:focus:ring-0",
              striking &&
                "[&_.txa\_\_input]:text-muted-foreground [&_.txa\_\_input]:line-through [&_.txa\_\_input]:decoration-muted-foreground/50 [&_.txa\_\_mirror]:text-muted-foreground [&_.txa\_\_mirror]:line-through [&_.txa\_\_mirror]:decoration-muted-foreground/50",
            )}
          />
        ) : (
          <TextField
            id={id}
            type={type}
            placeholder={placeholder}
            value={value ?? ""}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full border-none bg-transparent [&_.fld__input]:border-none [&_.fld__input]:bg-transparent [&_.fld__input]:focus:bg-transparent [&_.fld__input]:focus:shadow-none [&_.fld__input]:focus:ring-0",
              striking &&
                "[&_.fld\_\_input]:text-muted-foreground [&_.fld\_\_input]:line-through [&_.fld\_\_input]:decoration-muted-foreground/50",
            )}
          />
        )}

        {/* Suggestion strip — slides in/out on max-height */}
        <div
          className={cn(
            "flex h-8 items-center justify-between border-t border-border/50 bg-muted/40 px-3 text-xs transition-all duration-300 ease-out",
            stripVisible ? "max-h-20 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          {applyingOrApplied ? (
            <div className="flex items-center gap-2 py-1 text-success">
              <Check size={12} weight="bold" />
              <span>Applied</span>
            </div>
          ) : phase === "dismissed" ? (
            <div className="flex items-center gap-2 py-1 text-muted-foreground">
              <X size={12} weight="bold" />
              <span>Dismissed</span>
            </div>
          ) : activeSuggestion != null ? (
            <>
              <span className="min-w-0 truncate text-sm">
                {activeSuggestion}
              </span>
              <div className="ml-2 flex shrink-0 items-center">
                <Button
                  variant="ghost"
                  onClick={reject}
                  onMouseDown={(e) => e.preventDefault()}
                  className="px-1.5 py-2"
                  aria-label="Dismiss suggestion"
                >
                  <Kbd pressed={pressedKey === "esc"}>esc</Kbd>
                </Button>
                <Button
                  variant="ghost"
                  onClick={accept}
                  onMouseDown={(e) => e.preventDefault()}
                  className="px-1.5 py-2"
                  aria-label="Accept suggestion"
                >
                  <Kbd pressed={pressedKey === "tab"}>tab</Kbd>
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {helperText && (
        <p className="mt-2 px-0.5 text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}
