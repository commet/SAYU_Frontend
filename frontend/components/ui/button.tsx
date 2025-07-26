import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base styles - SAYU Design System
  "inline-flex items-center justify-center font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sayu-tangerine-zest focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ring-offset-background",
  {
    variants: {
      variant: {
        // Primary - 주요 액션 (SAYU Tangerine Zest)
        primary: "bg-sayu-tangerine-zest text-white hover:bg-sayu-dark-purple active:bg-sayu-dark-purple shadow-md hover:shadow-lg transition-all duration-300",
        
        // Secondary - 보조 액션 (SAYU Ivory Mist background)
        secondary: "bg-sayu-ivory-mist text-sayu-text-primary border border-sayu-powder-blue/30 hover:bg-sayu-powder-blue/20 active:bg-sayu-powder-blue/30 shadow-sm hover:shadow-md",
        
        // Ghost - 최소 강조 (SAYU Ghost style)
        ghost: "text-sayu-text-secondary hover:bg-sayu-peach-breeze/30 hover:text-sayu-text-primary active:bg-sayu-peach-breeze/50 transition-all duration-200",
        
        // Legacy support with SAYU colors
        default: "bg-sayu-tangerine-zest text-white hover:bg-sayu-dark-purple active:bg-sayu-dark-purple shadow-md hover:shadow-lg",
        destructive: "bg-sayu-double-bounce text-white hover:bg-sayu-double-bounce/90 active:bg-sayu-double-bounce/80 shadow-md hover:shadow-lg",
        outline: "border border-sayu-powder-blue text-sayu-text-secondary hover:bg-sayu-powder-blue/10 hover:text-sayu-text-primary hover:border-sayu-powder-blue/60",
        link: "text-sayu-tangerine-zest underline-offset-4 hover:underline hover:text-sayu-double-bounce transition-colors duration-200",
      },
      size: {
        sm: "h-8 px-4 text-sm rounded-lg",          // 32px height - SAYU rounded
        default: "h-10 px-6 text-base rounded-lg",  // 40px height - SAYU rounded
        lg: "h-12 px-8 text-lg rounded-xl",         // 48px height - SAYU rounded
        icon: "h-10 w-10 rounded-lg",               // Square icon - SAYU rounded
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
