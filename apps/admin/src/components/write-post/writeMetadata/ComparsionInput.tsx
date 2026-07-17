import { Button } from "premium-ds/button";
import { TextField } from "premium-ds/text-field";
import { Textarea } from "premium-ds/textarea";
import { Kbd } from "@/components/ui/Kbd";
import { cn } from "@/lib/utils";

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
  label?: string | ReactNode;
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
  label,
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


  const striking = activeSuggestion != null && phase === "idle";
  const applyingOrApplied = phase === "accepting" || phase === "applied";

  let currentHelper: ReactNode = helperText;
  let currentSuccess: ReactNode = undefined;
  
  if (applyingOrApplied) {
    currentSuccess = "Applied";
  } else if (phase === "dismissed") {
    currentHelper = "Dismissed";
  } else if (activeSuggestion != null) {
    currentHelper = (
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-sm text-foreground">
          {activeSuggestion}
        </span>
        <div className="flex shrink-0 items-center">
          <Button
            variant="ghost"
            onClick={reject}
            onMouseDown={(e) => e.preventDefault()}
            className="h-6 px-1.5 py-1"
            aria-label="Dismiss suggestion"
          >
            <Kbd pressed={pressedKey === "esc"}>esc</Kbd>
          </Button>
          <Button
            variant="ghost"
            onClick={accept}
            onMouseDown={(e) => e.preventDefault()}
            className="h-6 px-1.5 py-1"
            aria-label="Accept suggestion"
          >
            <Kbd pressed={pressedKey === "tab"}>tab</Kbd>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {multiLine ? (
        <Textarea
          id={id}
          label={label}
          helper={currentHelper}
          success={currentSuccess}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(striking && "line-through opacity-50")}
        />
      ) : (
        <TextField
          id={id}
          type={type}
          label={label}
          helper={currentHelper}
          success={currentSuccess}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(striking && "line-through opacity-50")}
        />
      )}
    </div>
  );
}
