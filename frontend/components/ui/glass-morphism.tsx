"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// SAYU를 위한 경제적이고 실용적인 Glassmorphism 구현
// Figma/Canva API 없이도 트렌디한 glass 효과 구현

interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark' | 'colorful' | 'minimal'
  blur?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  opacity?: number
  border?: boolean
  shadow?: boolean
  animate?: boolean
}

export const Glass = React.forwardRef<HTMLDivElement, GlassProps>(
  ({ 
    className, 
    variant = 'light',
    blur = 'md',
    opacity = 0.7,
    border = true,
    shadow = true,
    animate = false,
    style,
    children,
    ...props 
  }, ref) => {
    
    const blurValues = {
      none: '0px',
      sm: '4px',
      md: '12px',
      lg: '24px',
      xl: '40px'
    }
    
    const variants = {
      light: {
        background: `rgba(255, 255, 255, ${opacity})`,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: 'rgba(0, 0, 0, 0.1)'
      },
      dark: {
        background: `rgba(0, 0, 0, ${opacity * 0.6})`,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      },
      colorful: {
        background: `linear-gradient(135deg, 
          rgba(107, 91, 149, ${opacity * 0.3}) 0%, 
          rgba(255, 255, 255, ${opacity}) 50%, 
          rgba(230, 57, 70, ${opacity * 0.2}) 100%
        )`,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: 'rgba(107, 91, 149, 0.15)'
      },
      minimal: {
        background: `rgba(255, 255, 255, ${opacity * 0.5})`,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        shadowColor: 'rgba(0, 0, 0, 0.05)'
      }
    }
    
    const selectedVariant = variants[variant]
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl",
          animate && "transition-all duration-500 hover:scale-[1.02]",
          className
        )}
        style={{
          background: selectedVariant.background,
          backdropFilter: `blur(${blurValues[blur]}) saturate(180%)`,
          WebkitBackdropFilter: `blur(${blurValues[blur]}) saturate(180%)`,
          border: border ? `1px solid ${selectedVariant.borderColor}` : 'none',
          boxShadow: shadow ? `0 8px 32px ${selectedVariant.shadowColor}` : 'none',
          ...style
        }}
        {...props}
      >
        {/* 빛 반사 효과 (무료 구현) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, transparent 100%)',
            opacity: 0.6
          }}
        />
        
        {/* 노이즈 텍스처 (품질 향상) */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px'
          }}
        />
        
        {/* 컨텐츠 */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)
Glass.displayName = "Glass"

// 간단한 Glass 버튼 컴포넌트
export const GlassButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
  }
>(({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-13 px-8 text-lg'
  }
  
  const variants = {
    primary: 'bg-primary/20 hover:bg-primary/30 text-primary-foreground',
    secondary: 'bg-white/20 hover:bg-white/30 text-foreground',
    ghost: 'bg-transparent hover:bg-white/10 text-foreground'
  }
  
  return (
    <button
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-xl font-medium transition-all duration-300",
        "backdrop-filter backdrop-blur-md",
        "border border-white/20",
        "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
        "hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]",
        "hover:-translate-y-0.5",
        "active:translate-y-0",
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    >
      {/* 빛나는 효과 */}
      <div className="absolute inset-0 -top-1/2 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
      
      {/* 컨텐츠 */}
      <span className="relative z-10">{children}</span>
    </button>
  )
})
GlassButton.displayName = "GlassButton"

// Glass 카드 프리셋
export const GlassCard = ({ children, className, ...props }: GlassProps) => (
  <Glass
    variant="light"
    blur="lg"
    className={cn("p-6", className)}
    {...props}
  >
    {children}
  </Glass>
)

// 사용 예시
export const GlassDemo = () => {
  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-purple-100 to-pink-100 min-h-screen">
      {/* 기본 Glass */}
      <Glass className="p-6">
        <h3 className="text-xl font-semibold mb-2">기본 Glass 효과</h3>
        <p className="text-gray-600">Figma API 없이도 아름다운 glassmorphism 구현</p>
      </Glass>
      
      {/* 다크 Glass */}
      <Glass variant="dark" className="p-6 text-white">
        <h3 className="text-xl font-semibold mb-2">다크 Glass</h3>
        <p className="text-gray-300">어두운 배경에 적합한 스타일</p>
      </Glass>
      
      {/* 컬러풀 Glass */}
      <Glass variant="colorful" animate className="p-6">
        <h3 className="text-xl font-semibold mb-2">SAYU 시그니처 Glass</h3>
        <p className="text-gray-600">브랜드 컬러가 은은하게 반영된 스타일</p>
      </Glass>
      
      {/* Glass 버튼들 */}
      <div className="flex gap-4">
        <GlassButton variant="primary">Primary Button</GlassButton>
        <GlassButton variant="secondary">Secondary</GlassButton>
        <GlassButton variant="ghost">Ghost</GlassButton>
      </div>
    </div>
  )
}