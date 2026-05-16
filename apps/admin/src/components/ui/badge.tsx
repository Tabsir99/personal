import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border border-transparent px-2 py-0.5 text-[11px] font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/85",
        accent:
          "border-primary/20 bg-primary/[0.08] text-primary [a]:hover:bg-primary/[0.12]",
        success:
          "border-success/20 bg-success/[0.10] text-success [a]:hover:bg-success/[0.16]",
        warning:
          "border-warning/30 bg-warning/[0.12] text-warning-foreground dark:text-warning [a]:hover:bg-warning/[0.18]",
        destructive:
          "border-destructive/20 bg-destructive/[0.10] text-destructive [a]:hover:bg-destructive/[0.16]",
        neutral:
          "border-foreground/[0.08] bg-foreground/[0.04] text-foreground/80 [a]:hover:bg-foreground/[0.06]",
        outline:
          "border-border text-foreground [a]:hover:bg-foreground/[0.04] [a]:hover:text-foreground",
        ghost:
          "text-muted-foreground [a]:hover:bg-foreground/[0.04] [a]:hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Retained for back-compat with current callers; reads as neutral now.
        secondary:
          "border-foreground/[0.08] bg-foreground/[0.04] text-foreground/80 [a]:hover:bg-foreground/[0.06]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
