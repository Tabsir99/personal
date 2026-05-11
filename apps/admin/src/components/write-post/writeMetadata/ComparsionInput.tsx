import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const norm = (s: string | null | undefined): string => (s ?? "").trim();
const differs = (
  a: string | null | undefined,
  b: string | null | undefined,
): boolean => norm(a).toLowerCase() !== norm(b).toLowerCase();

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────
interface KbdProps {
  children: ReactNode;
  pressed?: boolean | undefined;
}

function Kbd({ children, pressed = false }: KbdProps) {
  return (
    <kbd
      className={[
        "inline-flex items-center justify-center min-w-[22px] h-[20px] px-[5px]",
        "text-[12px] font-medium border rounded-[5px] transition-colors duration-100",
        "font-mono tracking-[-0.02em]",
        pressed
          ? "bg-foreground text-background border-foreground/80 shadow-[inset_0_1px_1px_0_rgba(0,0,0,0.3)]"
          : "bg-background text-muted-foreground border-border shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.04),0_1px_0_0_rgba(0,0,0,0.02)]",
      ].join(" ")}
    >
      {children}
    </kbd>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Phase = "idle" | "accepting" | "applied" | "dismissed";
type PressedKey = "tab" | "esc" | null;

export interface SuggestionFieldProps {
  // Each `| undefined` is explicit so this compiles cleanly under
  // `exactOptionalPropertyTypes: true` when callers pass values coming from
  // chains like `result?.suggestion`.
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

// ─────────────────────────────────────────────────────────────────────────────
// SuggestionField — reusable controlled input with attached suggestion strip.
//
// Parent owns `value` and `suggested`. When `suggested` differs from `value`,
// the input's text is rendered with rose tint + strikethrough to signal "this
// will be replaced", and the strip shows the proposed replacement. Tab accepts
// (calls onChange(suggested)); Esc dismisses until the suggested prop changes.
// ─────────────────────────────────────────────────────────────────────────────
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

  const As = multiLine ? Textarea : Input;

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-background ring-1 ring-border/50 focus-within:ring-border focus-within:ring-2 focus-within:ring-offset-2 rounded-lg overflow-hidden transition-all duration-200">
        <As
          id={id}
          type={type}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "border-none focus-visible:ring-0",
            striking &&
              "text-muted-foreground line-through decoration-muted-foreground/50",
          )}
        />

        {/* Suggestion strip — slides in/out on max-height */}

        <div
          className={cn(
            "px-3 h-8 flex items-center justify-between text-xs transition-all duration-300 ease-out bg-muted/40 border-t border-border/50",
            stripVisible ? "opacity-100 max-h-20" : "opacity-0 max-h-0",
          )}
        >
          {applyingOrApplied ? (
            <div className="flex items-center gap-2 py-1">
              <svg
                width="11"
                height="11"
                viewBox="0 0 12 12"
                fill="none"
                stroke="rgb(16,185,129)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="2.5 6.5 5 9 9.5 3.5" />
              </svg>
              <span>Applied</span>
            </div>
          ) : phase === "dismissed" ? (
            <div className="flex items-center gap-2 py-1">
              <svg
                width="11"
                height="11"
                viewBox="0 0 12 12"
                fill="none"
                stroke="rgb(161,161,170)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="3" x2="9" y2="9" />
                <line x1="9" y1="3" x2="3" y2="9" />
              </svg>
              <span>Dismissed</span>
            </div>
          ) : activeSuggestion != null ? (
            <>
              <span className="text-sm min-w-0 truncate">
                {activeSuggestion}
              </span>
              <div className="flex items-center shrink-0 ml-2">
                <Button
                  variant="ghost"
                  onClick={reject}
                  onMouseDown={(e) => e.preventDefault()}
                  className="py-2 px-1.5"
                  aria-label="Dismiss suggestion"
                >
                  <Kbd pressed={pressedKey === "esc"}>esc</Kbd>
                </Button>
                <Button
                  variant="ghost"
                  onClick={accept}
                  onMouseDown={(e) => e.preventDefault()}
                  className="py-2 px-1.5"
                  aria-label="Accept suggestion"
                >
                  <Kbd pressed={pressedKey === "tab"}>tab</Kbd>
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Helper text */}
      {helperText && (
        <p className="mt-2 text-xs text-zinc-400 px-0.5">{helperText}</p>
      )}
    </div>
  );
}
