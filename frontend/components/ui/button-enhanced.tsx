"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  // Base styles - 미술관 라벨/사인 컨셉
  "relative inline-flex items-center justify-center font-medium transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B5B95]/20 focus-visible:ring-offset-4 disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed overflow-hidden",
  {
    variants: {
      variant: {
        // Primary - 메인 전시실 입장 버튼
        primary: [
          "bg-[#6B5B95] text-white",
          "hover:bg-[#5A4A84] hover:shadow-[0_6px_20px_rgba(107,91,149,0.25)]",
          "active:bg-[#4B3B75]",
          "after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/10 after:to-transparent after:opacity-0",
          "hover:after:opacity-100 after:transition-opacity after:duration-500"
        ].join(" "),
        
        // Secondary - 갤러리 안내판 스타일  
        secondary: [
          "bg-white text-gray-800 border-2 border-gray-200",
          "hover:border-gray-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]",
          "active:bg-gray-50",
          "dark:bg-gray-800 dark:text-white dark:border-gray-700"
        ].join(" "),
        
        // Gallery - 작품 라벨 스타일
        gallery: [
          "bg-[#FAFAFA] text-gray-700 border border-gray-300",
          "hover:bg-white hover:border-[#6B5B95] hover:text-[#6B5B95]",
          "active:bg-[#F5F5F5]",
          "shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.04)]"
        ].join(" "),
        
        // Ghost - 미니멀 텍스트 버튼
        ghost: [
          "text-gray-600",
          "hover:text-gray-900 hover:bg-gray-50",
          "active:bg-gray-100",
          "dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
        ].join(" "),
        
        // Destructive - 작품 제거
        destructive: [
          "bg-red-50 text-red-700 border border-red-200",
          "hover:bg-red-100 hover:border-red-300",
          "active:bg-red-200"
        ].join(" "),
      },
      size: {
        xs: "h-7 min-w-[60px] px-3 text-xs gap-1.5",
        sm: "h-9 min-w-[80px] px-4 text-sm gap-2",      
        default: "h-11 min-w-[100px] px-5 text-base gap-2",
        lg: "h-13 min-w-[120px] px-6 text-lg gap-2.5",
        icon: "h-10 w-10 min-w-0 p-0",
      },
      // 둥글기 옵션 - 미술관의 부드러운 모서리
      radius: {
        sm: "rounded-lg",
        default: "rounded-xl", 
        lg: "rounded-2xl",
        full: "rounded-full"
      },
      // 새로운 옵션: 갤러리 스타일 효과
      galleryEffect: {
        true: "hover:-translate-y-0.5 hover:shadow-lg",
        false: ""
      },
      fullWidth: {
        true: "w-full",
        false: ""
      },
      loading: {
        true: "cursor-wait",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      radius: "default",
      galleryEffect: true,
      fullWidth: false,
      loading: false,
    },
  }
)

// 클릭 시 리플 효과를 위한 훅
const useRipple = () => {
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([])
  
  const addRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    
    const id = Date.now()
    setRipples(prev => [...prev, { x, y, id }])
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id))
    }, 600)
  }
  
  return { ripples, addRipple }
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  enableRipple?: boolean
  galleryLabel?: string // 작품 라벨처럼 하단에 표시되는 텍스트
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    radius,
    galleryEffect,
    fullWidth,
    asChild = false, 
    loading = false,
    loadingText,
    enableRipple = true,
    galleryLabel,
    children,
    disabled,
    onClick,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const { ripples, addRipple } = useRipple()
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!loading && !disabled && enableRipple && variant === 'primary') {
        addRipple(e)
      }
      onClick?.(e)
    }
    
    const buttonElement = (
      <Comp
        className={cn(buttonVariants({ variant, size, radius, galleryEffect, fullWidth, loading, className }))}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {/* 리플 효과 - primary 버튼만 */}
        {enableRipple && variant === 'primary' && ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute animate-ripple rounded-full bg-white/25"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: '100%',
              height: '100%',
            }}
          />
        ))}
        
        {/* 미술관 프레임 효과 */}
        {variant === 'gallery' && (
          <span className="absolute inset-0 border-2 border-transparent hover:border-[#6B5B95]/20 rounded-inherit transition-colors duration-300" />
        )}
        
        {/* 로딩 상태 */}
        {loading && (
          <Loader2 className={cn(
            "animate-spin",
            size === "xs" ? "h-3 w-3" :
            size === "sm" ? "h-3.5 w-3.5" : 
            size === "lg" ? "h-5 w-5" : "h-4 w-4"
          )} />
        )}
        
        {/* 버튼 내용 */}
        <span className={cn(
          "relative z-10",
          loading && !loadingText && "opacity-0"
        )}>
          {loading && loadingText ? loadingText : children}
        </span>
      </Comp>
    )
    
    // 갤러리 라벨이 있으면 래핑
    if (galleryLabel) {
      return (
        <div className="relative inline-flex flex-col items-center gap-2">
          {buttonElement}
          <span className="text-xs text-gray-500 font-medium">
            {galleryLabel}
          </span>
        </div>
      )
    }
    
    return buttonElement
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }