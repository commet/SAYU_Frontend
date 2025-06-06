'use client';

import { motion } from 'framer-motion';
import { usePersonalizedTheme, useThemeAwareAnimations, useThemeAwareLayout } from '@/hooks/usePersonalizedTheme';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface PersonalizedCardProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export function PersonalizedCard({ 
  children, 
  className, 
  gradient = false, 
  hover = true,
  onClick 
}: PersonalizedCardProps) {
  const { theme } = usePersonalizedTheme();
  const animations = useThemeAwareAnimations();
  const layout = useThemeAwareLayout();

  return (
    <motion.div
      className={cn("personalized-card", className)}
      style={{
        background: gradient ? theme?.colors.gradient : undefined,
        color: gradient ? 'white' : undefined
      }}
      whileHover={hover ? { scale: parseFloat(animations.hoverScale) } : undefined}
      transition={{ duration: parseFloat(animations.duration) }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

interface PersonalizedButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function PersonalizedButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className,
  onClick,
  disabled = false
}: PersonalizedButtonProps) {
  const { theme } = usePersonalizedTheme();
  const animations = useThemeAwareAnimations();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: theme?.colors.gradient,
          color: 'white',
          border: 'none'
        };
      case 'secondary':
        return {
          backgroundColor: theme?.colors.secondary,
          color: 'white',
          border: 'none'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: theme?.colors.primary,
          border: `2px solid ${theme?.colors.primary}`
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: theme?.colors.text,
          border: 'none'
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '0.5rem 1rem', fontSize: '0.875rem' };
      case 'lg':
        return { padding: '1rem 2rem', fontSize: '1.125rem' };
      default:
        return { padding: '0.75rem 1.5rem', fontSize: '1rem' };
    }
  };

  return (
    <motion.button
      className={cn("personalized-button", className)}
      style={{
        ...getVariantStyles(),
        ...getSizeStyles(),
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
      whileHover={disabled ? {} : { scale: parseFloat(animations.hoverScale) }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: parseFloat(animations.duration) }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}

interface PersonalizedContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: boolean;
  padding?: boolean;
}

export function PersonalizedContainer({ 
  children, 
  className,
  maxWidth = true,
  padding = true
}: PersonalizedContainerProps) {
  const layout = useThemeAwareLayout();

  return (
    <div
      className={cn("personalized-container", className)}
      style={{
        maxWidth: maxWidth ? layout.maxWidth : 'none',
        padding: padding ? layout.spacing : '0'
      }}
    >
      {children}
    </div>
  );
}

interface PersonalizedHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  gradient?: boolean;
}

export function PersonalizedHeader({ 
  title, 
  subtitle, 
  children,
  gradient = true
}: PersonalizedHeaderProps) {
  const { theme } = usePersonalizedTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8"
    >
      <h1 
        className="text-4xl md:text-6xl font-bold mb-4"
        style={{
          background: gradient ? theme?.colors.gradient : 'transparent',
          WebkitBackgroundClip: gradient ? 'text' : 'border-box',
          WebkitTextFillColor: gradient ? 'transparent' : theme?.colors.text,
          color: gradient ? 'transparent' : theme?.colors.text
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p 
          className="text-lg md:text-xl mb-6"
          style={{ color: theme?.colors.textSecondary }}
        >
          {subtitle}
        </p>
      )}
      {children}
    </motion.div>
  );
}

interface PersonalizedGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PersonalizedGrid({ 
  children, 
  columns = 3,
  gap = 'md',
  className
}: PersonalizedGridProps) {
  const getGridClasses = () => {
    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6'
    };

    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
      6: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
    };

    return `grid ${columnClasses[columns]} ${gapClasses[gap]}`;
  };

  return (
    <div className={cn(getGridClasses(), className)}>
      {children}
    </div>
  );
}

interface PersonalizedBadgeProps {
  children: ReactNode;
  variant?: 'default' | 'accent' | 'muted';
  className?: string;
}

export function PersonalizedBadge({ 
  children, 
  variant = 'default',
  className
}: PersonalizedBadgeProps) {
  const { theme } = usePersonalizedTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'accent':
        return {
          backgroundColor: theme?.colors.accent,
          color: 'white'
        };
      case 'muted':
        return {
          backgroundColor: theme?.colors.muted,
          color: theme?.colors.textSecondary
        };
      default:
        return {
          backgroundColor: theme?.colors.primary,
          color: 'white'
        };
    }
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("px-3 py-1 rounded-full text-sm font-medium", className)}
      style={getVariantStyles()}
    >
      {children}
    </motion.span>
  );
}

interface PersonalizedLoadingProps {
  text?: string;
}

export function PersonalizedLoading({ text = "Loading..." }: PersonalizedLoadingProps) {
  const { theme } = usePersonalizedTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center p-8"
    >
      <motion.div
        className="w-8 h-8 rounded-full"
        style={{ background: theme?.colors.gradient }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p 
        className="mt-4 text-sm"
        style={{ color: theme?.colors.textSecondary }}
      >
        {text}
      </p>
    </motion.div>
  );
}