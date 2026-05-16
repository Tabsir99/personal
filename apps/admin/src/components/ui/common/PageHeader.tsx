import { ReactNode } from "react";

import { Button } from "../button";
import { Eyebrow } from "../Eyebrow";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionButton?: {
    onClick: () => void;
    text: ReactNode;
    isLoading?: boolean;
    disabled?: boolean;
  };
}

export const PageHeader = ({
  eyebrow,
  title,
  description,
  actionButton,
}: PageHeaderProps) => {
  return (
    <header className="col-span-1 mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-foreground/[0.06] pb-4 md:col-span-2 lg:col-span-3">
      <div className="flex min-w-0 flex-col gap-1.5">
        {eyebrow && (
          <Eyebrow tone="muted" family="mono">
            {eyebrow}
          </Eyebrow>
        )}
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actionButton && (
        <Button
          onClick={actionButton.onClick}
          disabled={actionButton.disabled || actionButton.isLoading}
        >
          {actionButton.isLoading ? "Loading…" : actionButton.text}
        </Button>
      )}
    </header>
  );
};
