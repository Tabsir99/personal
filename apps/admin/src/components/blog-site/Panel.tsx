import * as React from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/utils";

/**
 * Editorial section card for the blog-site config pages.
 *
 * Composes the chrome shared by SectionCard but keeps the count separator
 * inline with the eyebrow for the “EDITING · 3” pattern these panels use.
 */
export default function Panel({
  eyebrow,
  title,
  description,
  count,
  children,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  count?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-foreground/6 bg-card shadow-card-rest">
      <div className="flex items-start justify-between gap-6 px-6 pt-5">
        <div className="min-w-0">
          {(eyebrow || count) && (
            <div className="flex items-center gap-2">
              {eyebrow && (
                <Eyebrow size="xs" tone="muted">
                  {eyebrow}
                </Eyebrow>
              )}
              {count != null && count !== "" && (
                <Eyebrow size="xs" tone="muted" family="mono">
                  · {count}
                </Eyebrow>
              )}
            </div>
          )}
          <h2
            className={cn(
              "text-base leading-snug font-semibold tracking-tight",
              eyebrow || count ? "mt-2" : "",
            )}
          >
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="mt-5 border-t border-foreground/6 px-6 py-5">
        {children}
      </div>
    </section>
  );
}
