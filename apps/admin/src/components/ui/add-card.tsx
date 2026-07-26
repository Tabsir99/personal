import { Plus } from "@phosphor-icons/react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AddCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function AddCard({
  title,
  description,
  icon,
  onClick,
  className = "min-h-44",
}: AddCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group/add-card relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-foreground/8 bg-card shadow-card-rest transition-all duration-200 hover:border-foreground/[0.14] hover:bg-foreground/1 hover:shadow-card-hover",
        className,
      )}
    >
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
        <div className="rounded-md border border-foreground/6 bg-card p-2 text-muted-foreground transition-colors group-hover/add-card:text-foreground">
          {icon || <Plus size={16} />}
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-sm font-medium text-foreground">{title}</span>
          {description && (
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
