import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  // Base styles - SAYU Elegant Input Design
  "flex w-full font-body transition-all duration-300 ease-out placeholder:text-sayu-text-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:font-medium text-sayu-text-primary",
  {
    variants: {
      variant: {
        // Default - SAYU 기본 스타일
        default: "bg-sayu-bg-card border border-sayu-powder-blue/30 focus-visible:border-sayu-tangerine-zest focus-visible:ring-2 focus-visible:ring-sayu-tangerine-zest/20 hover:border-sayu-powder-blue/50",
        
        // Ghost - 부드러운 배경 스타일
        ghost: "bg-sayu-ivory-mist border-0 focus-visible:bg-sayu-bg-card focus-visible:ring-2 focus-visible:ring-sayu-lavender-dream/30 hover:bg-sayu-peach-breeze/20",
        
        // Glass - SAYU 글래스 모포이즘
        glass: "bg-sayu-bg-card/60 backdrop-blur-lg border border-sayu-lavender-dream/30 focus-visible:bg-sayu-bg-card/80 focus-visible:border-sayu-tangerine-zest/60 hover:bg-sayu-bg-card/70",
        
        // Warm - 따뜻한 스타일 (APT 테스트 등에 사용)
        warm: "bg-gradient-to-r from-sayu-peach-breeze/20 to-sayu-apricot-whisper/20 border border-sayu-tangerine-zest/30 focus-visible:border-sayu-tangerine-zest focus-visible:ring-2 focus-visible:ring-sayu-tangerine-zest/20",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-lg",          // 32px height - SAYU rounded
        default: "h-11 px-4 text-base rounded-lg",  // 44px height (WCAG 터치 타겟) - SAYU rounded
        lg: "h-12 px-6 text-lg rounded-xl",         // 48px height - SAYU rounded
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