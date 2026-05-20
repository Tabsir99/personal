import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface H2Props extends HTMLAttributes<HTMLElement> {}

export const H2 = ({ className, children, ...props }: H2Props) => {
  return (
    <h2
      {...props}
      className={cn(
        "h-serif text-[clamp(48px,6.4vw,96px)] leading-[0.98]",
        className,
      )}
    >
      {children}
    </h2>
  );
};
