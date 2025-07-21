'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'success' | 'warning' | 'danger' | 'elegant' | 'creative' | 'art' | 'golden';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variants = {
  default: 'glass text-foreground hover:text-primary',
  primary: 'bg-primary/80 backdrop-blur-md text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary/80 backdrop-blur-md text-secondary-foreground hover:bg-secondary/90',
  ghost: 'hover:bg-white/10 backdrop-blur-sm',
  success: 'bg-gradient-to-r from-emerald-500/80 to-teal-500/80 backdrop-blur-md text-white hover:from-emerald-600/90 hover:to-teal-600/90 shadow-lg shadow-emerald-500/25',
  warning: 'bg-gradient-to-r from-amber-500/80 to-orange-500/80 backdrop-blur-md text-white hover:from-amber-600/90 hover:to-orange-600/90 shadow-lg shadow-amber-500/25',
  danger: 'bg-gradient-to-r from-rose-500/80 to-pink-500/80 backdrop-blur-md text-white hover:from-rose-600/90 hover:to-pink-600/90 shadow-lg shadow-rose-500/25',
  elegant: 'bg-gradient-to-r from-slate-700/80 to-gray-700/80 backdrop-blur-md text-white hover:from-slate-800/90 hover:to-gray-800/90 shadow-lg shadow-slate-500/25',
  creative: 'bg-gradient-to-r from-violet-500/80 via-purple-500/80 to-fuchsia-500/80 backdrop-blur-md text-white hover:from-violet-600/90 hover:via-purple-600/90 hover:to-fuchsia-600/90 shadow-lg shadow-purple-500/25',
  art: 'bg-gradient-to-r from-indigo-500/80 via-blue-500/80 to-cyan-500/80 backdrop-blur-md text-white hover:from-indigo-600/90 hover:via-blue-600/90 hover:to-cyan-600/90 shadow-lg shadow-blue-500/25',
  golden: 'bg-gradient-to-r from-yellow-500/80 to-amber-600/80 backdrop-blur-md text-white hover:from-yellow-600/90 hover:to-amber-700/90 shadow-lg shadow-yellow-500/25',
};

const sizes = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-base',
  lg: 'h-12 px-8 text-lg',
};

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ 
    variant = 'default', 
    size = 'md', 
    loading = false, 
    icon, 
    children, 
    className,
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'relative inline-flex items-center justify-center font-medium rounded-xl',
      'border border-white/20',
      'transition-all duration-200',
      'hover:scale-105 active:scale-95',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
      variants[variant],
      sizes[size],
      className
    );

    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        disabled={disabled || loading}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700">
            <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
          </div>
        </div>

        {/* Content */}
        <span className="relative flex items-center gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : icon ? (
            <span className="w-5 h-5">{icon}</span>
          ) : null}
          {children}
        </span>
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

// Icon Button variant
export const GlassIconButton = React.forwardRef<
  HTMLButtonElement,
  Omit<GlassButtonProps, 'children'> & { 'aria-label': string }
>(({ className, size = 'md', ...props }, ref) => {
  const iconSizes = {
    sm: 'h-9 w-9',
    md: 'h-11 w-11',
    lg: 'h-12 w-12',
  };

  return (
    <GlassButton
      ref={ref}
      className={cn(iconSizes[size], 'p-0', className)}
      size={size}
      {...props}
    >
      <span className="sr-only">{props['aria-label']}</span>
      {props.icon}
    </GlassButton>
  );
});

GlassIconButton.displayName = 'GlassIconButton';