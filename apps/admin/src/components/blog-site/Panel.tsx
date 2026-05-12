import * as React from "react";
import Eyebrow from "./Eyebrow";

// Multi-layer card shadow: 1px contact + soft wide ambient.
// rgb(0 0 0 / x) so it reads in both light and dark themes.
const CARD_SHADOW =
  "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 8px 24px -16px rgb(0 0 0 / 0.10)";

export default function Panel({
  eyebrow,
  title,
  description,
  count,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  count?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section
      className="rounded-lg border border-foreground/[0.06] bg-card"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <div className="flex items-start justify-between gap-6 px-6 pt-5">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Eyebrow>{eyebrow}</Eyebrow>
            {count && (
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/40">
                · {count}
              </span>
            )}
          </div>
          <h2 className="mt-2 text-lg font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div
        className="mt-5 border-t border-foreground/[0.05] px-6 py-5"
      >
        {children}
      </div>
    </section>
  );
}
