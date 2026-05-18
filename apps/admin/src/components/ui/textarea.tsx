import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-border bg-transparent px-2.5 py-2 text-base transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:bg-foreground/4 disabled:opacity-50 aria-invalid:border-destructive md:text-sm dark:bg-foreground/4",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
