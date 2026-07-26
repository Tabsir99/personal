import { cn } from "@/lib/utils";
import { ComponentType } from "react";

interface SectionHeaderProps {
  icon: ComponentType<{ className?: string | undefined }>;
  title: string;
  complete?: boolean;
  size?: "default" | "large";
}

export function SectionHeader({
  icon: Icon,
  title,
  complete,
  size = "default",
}: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon className="size-4 text-muted-foreground" />
      <h3
        className={cn(
          "tracking-tight",
          size === "large"
            ? "text-lg font-semibold"
            : "text-base font-semibold",
        )}
      >
        {title}
      </h3>
      {complete && (
        <span
          className="size-1.5 rounded-full bg-primary"
          role="status"
          aria-label="Section complete"
        />
      )}
    </div>
  );
}
