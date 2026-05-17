import { Plus } from "lucide-react";
import { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AddCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * Empty-slot card for portfolio grids. Solid hairline + faint surface (no
 * dashed border — wireframe pattern). Hovers to a slightly more present
 * surface; relies on Card's shadow recipe for depth.
 */
export function AddCard({
  title,
  description,
  icon,
  onClick,
  className = "min-h-44",
}: AddCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "group/add-card relative flex w-full cursor-pointer items-center justify-center overflow-hidden border-foreground/8 transition-colors duration-200 hover:border-foreground/[0.14] hover:bg-foreground/1",
        className,
      )}
    >
      <CardContent className="flex h-full flex-col items-center justify-center gap-3 p-6">
        <div className="rounded-md border border-foreground/6 bg-card p-2 text-muted-foreground transition-colors group-hover/add-card:text-foreground">
          {icon || <Plus className="h-4 w-4" />}
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-sm font-medium text-foreground">{title}</span>
          {description && (
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
