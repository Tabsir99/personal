// components/ui/add-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { ReactNode } from "react";

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
    <Card
      onClick={onClick}
      className={`group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card backdrop-blur-sm transition-all duration-500 hover:border-accent-foreground/50 hover:bg-card-foreground/2 active:scale-[0.95]
        ${className}`}
    >
      <CardContent
        className={`p-8 flex flex-col items-center justify-center h-full space-y-4`}
      >
        <div className="rounded-md bg-muted p-2">
          {icon || (
            <Plus className="h-7 w-7 text-muted-foreground transition-all duration-300 group-hover:text-foreground" />
          )}
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground/80 transition-colors duration-300 group-hover:text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
