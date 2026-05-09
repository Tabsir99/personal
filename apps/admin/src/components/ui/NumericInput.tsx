import { ChangeEvent, forwardRef, useEffect, useState } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface NumericInputProps extends Omit<
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
    ref,
  ) => {
    const [displayValue, setDisplayValue] = useState(value.toString());
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      setDisplayValue(value.toString());
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
              error ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div className="overflow-hidden">
              <p className="text-destructive text-xs mt-1.5">{error}</p>
            </div>
          </div>
        }
      </div>
    );
  },
);

NumericInput.displayName = "NumericInput";
