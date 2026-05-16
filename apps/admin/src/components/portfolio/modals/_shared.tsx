import * as React from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/utils";

interface ModalSectionProps {
  eyebrow: string;
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Inner section grouping inside a modal: tracked eyebrow + optional title +
 * stacked content. Replaces the `<h3 class="text-sm font-semibold
 * text-muted-foreground">` pattern repeated across every portfolio modal.
 */
export function ModalSection({
  eyebrow,
  title,
  description,
  className,
  children,
}: ModalSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <Eyebrow tone="muted" family="mono">
          {eyebrow}
        </Eyebrow>
        {title && (
          <h3 className="text-base leading-tight font-semibold tracking-tight">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

interface ModalSectionDividerProps {
  className?: string;
}

export function ModalSectionDivider({ className }: ModalSectionDividerProps) {
  return (
    <hr
      className={cn(
        "my-2 h-px border-0 bg-foreground/[0.06]",
        className,
      )}
    />
  );
}
