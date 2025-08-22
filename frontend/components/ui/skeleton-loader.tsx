'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  };
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton',
    none: ''
  };
  
  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: width || '100%',
        height: height || '20px'
      }}
    />
  );
}

// Quiz Option Skeleton
export function QuizOptionSkeleton() {
  return (
    <div className="w-full p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <Skeleton variant="text" height={24} className="mb-2 w-3/4" />
      <Skeleton variant="text" height={16} className="w-full" />
    </div>
  );
}

// Profile Card Skeleton
export function ProfileCardSkeleton() {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="flex-1">
          <Skeleton variant="text" height={20} className="mb-2 w-32" />
          <Skeleton variant="text" height={16} className="w-24" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton variant="rounded" height={40} />
        <Skeleton variant="rounded" height={40} />
      </div>
    </div>
  );
}

// Exhibition Card Skeleton
export function ExhibitionCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
      <Skeleton variant="rectangular" height={200} />
      <div className="p-4">
        <Skeleton variant="text" height={24} className="mb-2" />
        <Skeleton variant="text" height={16} className="mb-1 w-3/4" />
        <Skeleton variant="text" height={16} className="w-1/2" />
      </div>
    </div>
  );
}

// Loading Screen Component
export function LoadingScreen({ message = '로딩 중...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-white text-lg font-medium">{message}</p>
      </div>
    </div>
  );
}

// Page Transition Wrapper
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-transition-enter page-transition-enter-active">
      {children}
    </div>
  );
}