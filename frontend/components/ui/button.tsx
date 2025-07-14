import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base styles - Timeless Elegance 철학 반영
  "inline-flex items-center justify-center font-medium transition-all duration-base ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ring-offset-background",
  {
    variants: {
      variant: {
        // Primary - 주요 액션 (5% 사용)
        primary: "bg-primary text-white hover:bg-primary-dark active:bg-primary-dark shadow-gentle hover:shadow-moderate",
        
        // Secondary - 보조 액션 (20% 사용)  
        secondary: "bg-off-white text-black border border-gray hover:bg-light-gray active:bg-gray shadow-subtle hover:shadow-gentle",
        
        // Ghost - 최소 강조 (75% 사용)
        ghost: "text-dark-gray hover:bg-off-white hover:text-black active:bg-light-gray",
        
        // Legacy support
        destructive: "bg-error text-white hover:bg-error/90",
        outline: "border border-gray text-dark-gray hover:bg-off-white hover:text-black",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-md text-sm rounded-sm",         // 32px height
        default: "h-10 px-md text-base rounded-md", // 40px height  
        lg: "h-12 px-lg text-lg rounded-lg",        // 48px height
        icon: "h-10 w-10 rounded-md",               // Square icon
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
