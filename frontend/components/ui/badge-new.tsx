'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'gray' | 'blue' | 'purple' | 'amber' | 'red' | 'pink' | 'green' | 'teal' | 'inverted' | 'trial' | 'turbo';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'gray', size = 'md', icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 font-medium',
          // Base styles
          'rounded-full border transition-colors',
          // Size variants
          {
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-1 text-sm': size === 'md', 
            'px-3 py-1.5 text-base': size === 'lg',
          },
          // Color variants
          {
            // Gray
            'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700':
              variant === 'gray',
            // Blue
            'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800':
              variant === 'blue',
            // Purple
            'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800':
              variant === 'purple',
            // Amber
            'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800':
              variant === 'amber',
            // Red
            'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800':
              variant === 'red',
            // Pink
            'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800':
              variant === 'pink',
            // Green
            'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800':
              variant === 'green',
            // Teal
            'bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800':
              variant === 'teal',
            // Inverted
            'bg-gray-900 text-gray-50 border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100':
              variant === 'inverted',
            // Trial
            'bg-gradient-to-r from-orange-400 to-pink-400 text-white border-transparent':
              variant === 'trial',
            // Turbo
            'bg-gradient-to-r from-purple-500 to-blue-600 text-white border-transparent animate-pulse':
              variant === 'turbo',
          },
          className
        )}
        {...props}
      >
        {icon && (
          <span className={cn(
            'flex-shrink-0',
            {
              'w-3 h-3': size === 'sm',
              'w-4 h-4': size === 'md',
              'w-5 h-5': size === 'lg',
            }
          )}>
            {icon}
          </span>
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, type BadgeProps };