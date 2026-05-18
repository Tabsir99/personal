import { cn } from "@/lib/utils"

/**
 * Loading placeholder with a left-to-right shimmer. Reads as "loading"
 * rather than the "is this broken?" of a static muted block.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-foreground/6",
        "before:absolute before:inset-0 before:-translate-x-full before:bg-linear-to-r before:from-transparent before:via-foreground/6 before:to-transparent before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite]",
        "dark:before:via-foreground/10",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
