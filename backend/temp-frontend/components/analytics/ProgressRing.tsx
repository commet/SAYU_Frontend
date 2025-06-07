'use client';

import { motion } from 'framer-motion';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'pink';
  showPercentage?: boolean;
  className?: string;
}

const colorMap = {
  purple: {
    stroke: '#8B5CF6',
    gradient: ['#8B5CF6', '#EC4899']
  },
  blue: {
    stroke: '#3B82F6',
    gradient: ['#3B82F6', '#06B6D4']
  },
  green: {
    stroke: '#10B981',
    gradient: ['#10B981', '#34D399']
  },
  yellow: {
    stroke: '#F59E0B',
    gradient: ['#F59E0B', '#FCD34D']
  },
  red: {
    stroke: '#EF4444',
    gradient: ['#EF4444', '#F87171']
  },
  pink: {
    stroke: '#EC4899',
    gradient: ['#EC4899', '#F472B6']
  }
};

export function ProgressRing({ 
  percentage, 
  size = 120, 
  strokeWidth = 8, 
  color = 'purple',
  showPercentage = true,
  className = ''
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const colors = colorMap[color];
  const gradientId = `gradient-${color}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Gradient Definition */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.gradient[0]} />
            <stop offset="100%" stopColor={colors.gradient[1]} />
          </linearGradient>
        </defs>
        
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(75, 85, 99, 0.3)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
      
      {/* Percentage Text */}
      {showPercentage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {Math.round(percentage)}%
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Complete
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Glow Effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-20 blur-xl"
        style={{ 
          background: `radial-gradient(circle, ${colors.stroke}40 0%, transparent 70%)`,
          transform: 'scale(0.8)'
        }}
      />
    </div>
  );
}