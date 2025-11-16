import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-base font-normal font-mono transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border border-foreground shadow-[4px_4px_0px_0px_rgb(0,0,0)] hover:shadow-[0px_0px_0px_0px_rgb(0,0,0)] hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-[0px_0px_0px_0px_rgb(0,0,0)] active:translate-x-[4px] active:translate-y-[4px]",
        destructive:
          "bg-destructive text-white border border-foreground shadow-[4px_4px_0px_0px_rgb(0,0,0)] hover:shadow-[0px_0px_0px_0px_rgb(0,0,0)] hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-[0px_0px_0px_0px_rgb(0,0,0)] active:translate-x-[4px] active:translate-y-[4px]",
        outline:
          "border border-foreground bg-background shadow-[4px_4px_0px_0px_rgb(0,0,0)] hover:shadow-[0px_0px_0px_0px_rgb(0,0,0)] hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-[0px_0px_0px_0px_rgb(0,0,0)] active:translate-x-[4px] active:translate-y-[4px]",
        secondary:
          "bg-secondary text-secondary-foreground border border-foreground shadow-[4px_4px_0px_0px_rgb(0,0,0)] hover:shadow-[0px_0px_0px_0px_rgb(0,0,0)] hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-[0px_0px_0px_0px_rgb(0,0,0)] active:translate-x-[4px] active:translate-y-[4px]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-9 gap-1.5 px-4 has-[>svg]:px-3 text-sm",
        lg: "h-12 px-8 has-[>svg]:px-6 text-lg",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
