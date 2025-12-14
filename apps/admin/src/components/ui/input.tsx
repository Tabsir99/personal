import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full text-zinc-100 rounded-md border border-white/10 bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-white/40 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };

import { forwardRef } from "react";

interface NumericInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange"
  > {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  allowDecimal?: boolean;
  errorMessage?: string;
}

export const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      value,
      onChange,
      min = 0,
      max,
      allowDecimal = false,
      errorMessage,
      className,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState(value.toString());
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
      setDisplayValue(value.toString());
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      if (inputValue === "") {
        setDisplayValue("");
        setError(null);
        return;
      }

      const parsed = allowDecimal
        ? parseFloat(inputValue)
        : parseInt(inputValue, 10);

      if (isNaN(parsed)) return;

      if (parsed < min) {
        setError(errorMessage || `Minimum value is ${min}`);
        return;
      }
      if (max !== undefined && parsed > max) {
        setError(errorMessage || `Maximum value is ${max}`);
        return;
      }

      setError(null);
      setDisplayValue(inputValue);
      onChange(parsed);
    };

    const handleBlur = () => {
      if (displayValue === "" || isNaN(Number(displayValue))) {
        setDisplayValue(min.toString());
        onChange(min);
        setError(null);
      }
    };

    return (
      <div className="w-full">
        <Input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={!!error}
          className={className}
          onKeyDown={(e) => {
            if (["e", "E", "+", "-"].includes(e.key)) {
              e.preventDefault();
            }
            if (
              [8, 9, 27, 13, 46].includes(e.keyCode) ||
              (e.keyCode === 65 && e.ctrlKey) ||
              (e.keyCode === 67 && e.ctrlKey) ||
              (e.keyCode === 86 && e.ctrlKey) ||
              (e.keyCode === 88 && e.ctrlKey)
            ) {
              return;
            }
            if (
              (e.key < "0" || e.key > "9") &&
              !(allowDecimal && e.key === ".")
            ) {
              e.preventDefault();
            }
          }}
          {...props}
        />

        {/* Use CSS grid to animate the error message */}
        {
          <div
            className={cn(
              "grid transition-all duration-200 ease-in-out",
              error ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="overflow-hidden">
              <p className="text-destructive text-xs mt-1.5">{error}</p>
            </div>
          </div>
        }
      </div>
    );
  }
);

NumericInput.displayName = "NumericInput";
