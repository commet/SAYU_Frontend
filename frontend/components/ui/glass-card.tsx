'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'heavy' | 'light';
  hover?: boolean;
  blur?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ variant = 'default', hover = true, blur = true, children, className, ...props }, ref) => {
    const variants = {
      default: 'glass',
      heavy: 'glass-heavy',
      light: 'glass-light',
    };

    const baseClasses = cn(
      'relative overflow-hidden rounded-2xl p-6',
      blur && variants[variant],
      hover && 'transition-all duration-300 hover:scale-[1.02]',
      className
    );

    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        {...props}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// Convenience components
export const GlassCardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('mb-4 space-y-1', className)}>
    {children}
  </div>
);

export const GlassCardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <h3 className={cn('text-2xl font-semibold tracking-tight', className)}>
    {children}
  </h3>
);

export const GlassCardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <p className={cn('text-sm text-muted-foreground', className)}>
    {children}
  </p>
);

export const GlassCardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('', className)}>
    {children}
  </div>
);

export const GlassCardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('mt-6 flex items-center space-x-4', className)}>
    {children}
  </div>
);