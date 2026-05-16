import * as React from "react";

import { cn } from "@/lib/utils";
import { Eyebrow } from "./Eyebrow";

interface FormFieldProps extends React.ComponentProps<"div"> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  required?: boolean;
}

/**
 * Labelled form field. Replaces the `<Label class="mb-2 block">` + `<Input>`
 * stack that was repeated 40+ times across the portfolio modals and write
 * metadata. Label renders as a tracked Eyebrow; optional hint sits below the
 * control in muted body type.
 */
export function FormField({
  label,
  hint,
  required,
  className,
  children,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      <Eyebrow tone="muted">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-destructive">
            *
          </span>
        )}
      </Eyebrow>
      {children}
      {hint && (
        <span className="text-xs leading-relaxed text-muted-foreground">
          {hint}
        </span>
      )}
    </div>
  );
}
