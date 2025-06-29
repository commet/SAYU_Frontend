'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  level: 'above_average' | 'below_average' | 'average';
  size?: 'sm' | 'md' | 'lg';
}

export function TrendIndicator({ level, size = 'md' }: TrendIndicatorProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const getIndicator = () => {
    switch (level) {
      case 'above_average':
        return {
          icon: <TrendingUp className={sizeClasses[size]} />,
          text: 'Above Average',
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          borderColor: 'border-green-400/20'
        };
      case 'below_average':
        return {
          icon: <TrendingDown className={sizeClasses[size]} />,
          text: 'Below Average',
          color: 'text-red-400',
          bgColor: 'bg-red-400/10',
          borderColor: 'border-red-400/20'
        };
      case 'average':
      default:
        return {
          icon: <Minus className={sizeClasses[size]} />,
          text: 'Average',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/20'
        };
    }
  };

  const indicator = getIndicator();

  return (
    <div className={`
      inline-flex items-center gap-2 px-2 py-1 rounded-full border
      ${indicator.bgColor} ${indicator.borderColor}
    `}>
      <div className={indicator.color}>
        {indicator.icon}
      </div>
      <span className={`font-medium ${indicator.color} ${textSizeClasses[size]}`}>
        {indicator.text}
      </span>
    </div>
  );
}