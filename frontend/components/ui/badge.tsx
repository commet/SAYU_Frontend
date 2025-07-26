import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sayu-tangerine-zest focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-sayu-tangerine-zest text-white hover:bg-sayu-dark-purple shadow-sm hover:shadow-md",
        secondary:
          "border-transparent bg-sayu-powder-blue text-sayu-text-primary hover:bg-sayu-powder-blue/80 shadow-sm",
        destructive:
          "border-transparent bg-sayu-double-bounce text-white hover:bg-sayu-double-bounce/80 shadow-sm hover:shadow-md",
        outline: "text-sayu-text-primary border-sayu-powder-blue/50 hover:bg-sayu-powder-blue/10",
        
        // SAYU specific variants
        warm:
          "border-transparent bg-gradient-to-r from-sayu-peach-breeze to-sayu-apricot-whisper text-sayu-text-primary hover:from-sayu-peach-breeze/80 hover:to-sayu-apricot-whisper/80",
        cool:
          "border-transparent bg-sayu-sage text-sayu-text-primary hover:bg-sayu-sage/80 shadow-sm",
        soft:
          "border-transparent bg-sayu-lavender-dream/30 text-sayu-text-primary hover:bg-sayu-lavender-dream/50",
        accent:
          "border-transparent bg-sayu-match-point text-sayu-dark-purple hover:bg-sayu-match-point/80 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }