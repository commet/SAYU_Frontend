import { forwardRef } from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from '@/lib/utils';

const cardVariants = cva(
  // Base styles - 미술관 카드 컨셉 (다크모드 지원)
  "bg-white dark:bg-gray-800 border border-gray dark:border-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-base ease-out",
  {
    variants: {
      variant: {
        // Default - 기본 카드
        default: "shadow-gentle hover:shadow-moderate",
        
        // Gallery - 갤러리 스타일 (artwork 전용)
        gallery: "shadow-subtle hover:shadow-gentle border-light-gray",
        
        // Glass - 투명한 글래스 효과
        glass: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-moderate border-white/20 dark:border-gray-600/20 shadow-gentle",
        
        // Flat - 그림자 없는 플랫 디자인
        flat: "border-gray shadow-none",
      },
      size: {
        compact: "rounded-sm",      // 리스트용 
        default: "rounded-lg",      // 기본
        expanded: "rounded-xl",     // 상세 정보용
      },
      padding: {
        none: "",
        sm: "p-md",                 // 24px
        default: "p-lg",            // 32px  
        lg: "p-xl",                 // 48px
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default", 
      padding: "default",
    },
  }
);

export interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, padding }), className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-sm", className)}
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
          "font-display font-medium text-xl text-gray-900 dark:text-gray-100 leading-tight",
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
        className={cn("font-body text-sm text-gray-600 dark:text-gray-400 leading-normal", className)}
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
        className={cn("font-body text-base text-gray-900 dark:text-gray-100 leading-normal", className)} 
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
        className={cn("flex items-center gap-sm", className)}
        {...props}
      />
    );
  }
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };