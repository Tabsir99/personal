import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface H2Props extends HTMLAttributes<HTMLElement> {}

export const H2 = ({ className, children, ...props }: H2Props) => {
  return (
    <h2
      {...props}
      className={cn(
        "h-serif text-[clamp(2.5rem,7vw,5rem)] leading-[0.88] tracking-tight",
        className,
      )}
    >
      {children}
    </h2>
  );
};

interface H3Props extends HTMLAttributes<HTMLElement> {}
export const H3 = ({ className, children, ...props }: H3Props) => {
  return (
    <h3
      {...props}
      className={cn(
        "font-mono text-xs tracking-widest uppercase text-muted mb-2",
        className,
      )}
    >
      {children}
    </h3>
  );
};
