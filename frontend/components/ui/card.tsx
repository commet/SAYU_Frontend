import { forwardRef } from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from '@/lib/utils';

const cardVariants = cva(
  // Base styles - SAYU Gallery Card Concept
  "bg-sayu-bg-card dark:bg-sayu-bg-secondary border border-sayu-powder-blue/30 dark:border-sayu-powder-blue/20 text-sayu-text-primary dark:text-sayu-text-primary transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        // Default - 기본 SAYU 카드
        default: "shadow-md hover:shadow-lg hover:border-sayu-powder-blue/50 hover:-translate-y-1",
        
        // Gallery - 미술 작품 전용 (사진 프레임 스타일)
        gallery: "shadow-sm hover:shadow-md border-sayu-tea-rose/40 hover:border-sayu-tea-rose/60 bg-sayu-ivory-mist hover:bg-sayu-peach-breeze/20 transition-all duration-500",
        
        // Glass - SAYU 글래스 모포이즘
        glass: "bg-sayu-bg-card/70 dark:bg-sayu-bg-secondary/70 backdrop-blur-lg border-sayu-lavender-dream/30 dark:border-sayu-lavender-dream/20 shadow-lg hover:shadow-xl",
        
        // Flat - 미니멀 디자인
        flat: "border-sayu-dusty-mauve/20 shadow-none hover:border-sayu-dusty-mauve/40",
        
        // Warm - 따뜻한 느낌 (APT 결과 등에 사용)
        warm: "bg-gradient-to-br from-sayu-peach-breeze/30 to-sayu-apricot-whisper/30 border-sayu-tangerine-zest/30 shadow-md hover:shadow-lg",
        
        // Cool - 차분한 느낌 (분석 데이터 등에 사용)
        cool: "bg-gradient-to-br from-sayu-powder-blue/20 to-sayu-sage/20 border-sayu-silent-night/30 shadow-md hover:shadow-lg",
      },
      size: {
        compact: "rounded-lg",      // 리스트용 - SAYU rounded style
        default: "rounded-xl",      // 기본 - SAYU rounded style
        expanded: "rounded-2xl",    // 상세 정보용 - SAYU rounded style
      },
      padding: {
        none: "",
        sm: "p-4",                  // 16px - SAYU spacing
        default: "p-6",             // 24px - SAYU spacing
        lg: "p-8",                  // 32px - SAYU spacing
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
          "font-display font-medium text-xl text-sayu-text-primary dark:text-sayu-text-primary leading-tight",
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
        className={cn("font-body text-sm text-sayu-text-secondary dark:text-sayu-text-secondary leading-normal", className)}
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
        className={cn("font-body text-base text-sayu-text-primary dark:text-sayu-text-primary leading-normal", className)} 
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