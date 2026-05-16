import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-md border border-border bg-transparent px-2.5 py-1 text-base transition-[border-color,box-shadow] outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:shadow-focus-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-foreground/[0.04] disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-focus-ring aria-invalid:[--tw-ring-color:var(--destructive)] md:text-sm dark:bg-foreground/[0.04]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
