import * as React from "react";

import { cn } from "@/lib/utils";

import { Eyebrow } from "./Eyebrow";

interface SectionCardProps
  extends Omit<React.ComponentProps<"section">, "title"> {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  /** Hide the header even if eyebrow/title are passed (use a custom header inside children). */
  bareHeader?: boolean;
}

function SectionCard({
  className,
  eyebrow,
  title,
  description,
  action,
  bareHeader,
  children,
  ...props
}: SectionCardProps) {
  const hasHeader = !bareHeader && (eyebrow || title || action);

  return (
    <section
      data-slot="section-card"
      className={cn(
        "rounded-lg border border-foreground/[0.06] bg-card text-card-foreground shadow-card-rest",
        className,
      )}
      {...props}
    >
      {hasHeader && (
        <header
          data-slot="section-card-header"
          className="flex items-start justify-between gap-4 px-5 pt-5 pb-4"
        >
          <div className="flex min-w-0 flex-col gap-1.5">
            {eyebrow && <Eyebrow tone="muted">{eyebrow}</Eyebrow>}
            {title && (
              <h2 className="truncate text-base leading-snug font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action && (
            <div className="flex shrink-0 items-center gap-2">{action}</div>
          )}
        </header>
      )}
      <div
        data-slot="section-card-body"
        className={cn("px-5 pb-5", !hasHeader && "pt-5")}
      >
        {children}
      </div>
    </section>
  );
}

function SectionCardDivider({
  className,
  ...props
}: React.ComponentProps<"hr">) {
  return (
    <hr
      data-slot="section-card-divider"
      className={cn(
        "my-4 -mx-5 h-px border-0 bg-foreground/[0.06]",
        className,
      )}
      {...props}
    />
  );
}

export { SectionCard, SectionCardDivider };
export type { SectionCardProps };
