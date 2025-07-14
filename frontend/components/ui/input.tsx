import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  // Base styles - 미니멀하고 접근성 좋은 인풋
  "flex w-full font-body transition-all duration-base ease-out placeholder:text-dark-gray focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:font-medium",
  {
    variants: {
      variant: {
        // Default - 기본 스타일
        default: "bg-white border border-gray focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
        
        // Ghost - 경계선 없는 스타일
        ghost: "bg-off-white border-0 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20",
        
        // Glass - 투명한 글래스 효과
        glass: "bg-white/50 backdrop-blur-subtle border border-white/20 focus-visible:bg-white/80 focus-visible:border-primary/50",
      },
      size: {
        sm: "h-8 px-sm text-sm rounded-sm",         // 32px height
        default: "h-11 px-md text-base rounded-md", // 44px height (WCAG 터치 타겟)
        lg: "h-12 px-lg text-lg rounded-lg",        // 48px height
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }