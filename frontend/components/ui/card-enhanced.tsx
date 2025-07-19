"use client"

import { forwardRef, useState } from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from '@/lib/utils';

const cardVariants = cva(
  // Base styles - 미술관 카드 컨셉 with enhanced interactions
  "relative bg-white border border-gray/30 transition-all duration-500 ease-out overflow-hidden group",
  {
    variants: {
      variant: {
        // Default - 서브틀한 리프트 효과
        default: [
          "shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
          "hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]",
          "hover:-translate-y-1",
          "after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-black/5",
          "after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500"
        ].join(" "),
        
        // Gallery - 액자 효과와 줌
        gallery: [
          "shadow-[0_2px_4px_rgba(0,0,0,0.06)]",
          "hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)]",
          "border-2 border-gray/20 hover:border-gray/40",
          "before:absolute before:inset-0 before:border-8 before:border-white/50",
          "before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-500",
          "before:scale-95 hover:before:scale-100"
        ].join(" "),
        
        // Glass - 프리미엄 글래스 효과
        glass: [
          "bg-white/60 backdrop-blur-xl border-white/30",
          "shadow-[0_8px_32px_rgba(0,0,0,0.06)]",
          "hover:bg-white/80 hover:border-white/50",
          "hover:shadow-[0_12px_48px_rgba(0,0,0,0.10)]",
          "before:absolute before:inset-0 before:bg-gradient-to-br",
          "before:from-white/20 before:to-transparent before:opacity-0",
          "hover:before:opacity-100 before:transition-opacity before:duration-700"
        ].join(" "),
        
        // Artistic - 예술적 그라디언트 효과
        artistic: [
          "bg-gradient-to-br from-white to-off-white",
          "shadow-[0_4px_12px_rgba(107,91,149,0.08)]",
          "hover:shadow-[0_12px_32px_rgba(107,91,149,0.15)]",
          "hover:scale-[1.02]",
          "before:absolute before:inset-0 before:opacity-0",
          "before:bg-gradient-to-br before:from-primary/5 before:via-transparent before:to-secondary/5",
          "hover:before:opacity-100 before:transition-opacity before:duration-1000"
        ].join(" "),
        
        // Minimal - 미니멀한 라인 애니메이션
        minimal: [
          "shadow-none border-gray/20",
          "hover:border-gray/50",
          "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]",
          "after:bg-gradient-to-r after:from-primary after:to-secondary",
          "after:scale-x-0 hover:after:scale-x-100",
          "after:transition-transform after:duration-500 after:origin-left"
        ].join(" "),
      },
      size: {
        compact: "rounded-lg",      // 리스트용 
        default: "rounded-xl",      // 기본
        expanded: "rounded-2xl",    // 상세 정보용
      },
      padding: {
        none: "",
        sm: "p-4",                  // 16px
        default: "p-6",             // 24px  
        lg: "p-8",                  // 32px
      },
      // 새로운 옵션: 3D 효과
      perspective: {
        true: "transform-gpu perspective-1000",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default", 
      padding: "default",
      perspective: false,
    },
  }
);

// 마우스 위치에 따른 3D 틸트 효과를 위한 훅
const use3DTilt = (enabled: boolean = false) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return;
    
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tiltX = ((y - centerY) / centerY) * 10;
    const tiltY = ((centerX - x) / centerX) * 10;
    
    setTilt({ x: tiltX, y: tiltY });
  };
  
  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };
  
  return { tilt, handleMouseMove, handleMouseLeave };
};

export interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  enable3D?: boolean;
  shimmer?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, padding, perspective, enable3D = false, shimmer = false, style, ...props }, ref) => {
    const { tilt, handleMouseMove, handleMouseLeave } = use3DTilt(enable3D);
    
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, size, padding, perspective: enable3D }),
          shimmer && "shimmer-effect",
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          ...style,
          transform: enable3D ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : undefined,
        }}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

// 나머지 컴포넌트들은 기존과 동일하지만 애니메이션 추가
const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-2 transition-all duration-300",
          "group-hover:translate-x-1", // 호버 시 살짝 이동
          className
        )}
        {...props}
      />
    );
  }
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "font-display font-medium text-xl text-black leading-tight",
          "transition-colors duration-300 group-hover:text-primary",
          className
        )}
        {...props}
      />
    );
  }
);
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          "font-body text-sm text-dark-gray leading-normal",
          "transition-all duration-500 group-hover:text-gray-700",
          className
        )}
        {...props}
      />
    );
  }
);
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn(
          "font-body text-base text-black leading-normal",
          "transition-all duration-300",
          className
        )} 
        {...props} 
      />
    );
  }
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 transition-all duration-300",
          "group-hover:gap-3", // 호버 시 간격 늘어남
          className
        )}
        {...props}
      />
    );
  }
);
CardFooter.displayName = "CardFooter";

// 이미지가 있는 카드를 위한 특별한 컴포넌트
const CardImage = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { src?: string; alt?: string }>(
  ({ className, src, alt, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-lg",
          "transition-all duration-700 group-hover:rounded-xl",
          className
        )}
        {...props}
      >
        {src && (
          <img 
            src={src} 
            alt={alt || ""} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    );
  }
);
CardImage.displayName = "CardImage";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardImage };