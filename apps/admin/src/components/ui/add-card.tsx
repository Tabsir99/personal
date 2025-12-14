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
      className={`flex items-center justify-center group relative overflow-hidden border-2 border-dashed border-white/[0.15] bg-white/[0.02] backdrop-blur-sm w-full transition-all duration-500 hover:border-white/[0.3] hover:bg-white/[0.04] rounded-2xl cursor-pointer active:scale-[0.95]
        ${className}`}
    >
      <CardContent
        className={`p-8 flex flex-col items-center justify-center h-full space-y-4`}
      >
        <div className="bg-white/5 rounded-md p-2">
          {icon || (
            <Plus className="h-7 w-7 text-white/60 group-hover:text-white/90 transition-all duration-300" />
          )}
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-white/70 group-hover:text-white/95 transition-colors duration-300">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-white/50 group-hover:text-white/70 transition-colors duration-300">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
