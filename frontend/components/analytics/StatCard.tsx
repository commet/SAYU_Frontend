'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'pink';
  trend?: number;
  subtitle?: string;
}

const colorMap = {
  blue: {
    bg: 'from-blue-500/20 to-blue-600/20',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    text: 'text-blue-300'
  },
  green: {
    bg: 'from-green-500/20 to-green-600/20',
    border: 'border-green-500/30',
    icon: 'text-green-400',
    text: 'text-green-300'
  },
  purple: {
    bg: 'from-purple-500/20 to-purple-600/20',
    border: 'border-purple-500/30',
    icon: 'text-purple-400',
    text: 'text-purple-300'
  },
  yellow: {
    bg: 'from-yellow-500/20 to-yellow-600/20',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-400',
    text: 'text-yellow-300'
  },
  red: {
    bg: 'from-red-500/20 to-red-600/20',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    text: 'text-red-300'
  },
  pink: {
    bg: 'from-pink-500/20 to-pink-600/20',
    border: 'border-pink-500/30',
    icon: 'text-pink-400',
    text: 'text-pink-300'
  }
};

export function StatCard({ title, value, icon, color, trend, subtitle }: StatCardProps) {
  const colors = colorMap[color];

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    } else if (trend < 0) {
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-400';
    return trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`
        relative overflow-hidden
        bg-gradient-to-br ${colors.bg}
        backdrop-blur-lg rounded-2xl p-6
        border ${colors.border}
        transition-all duration-200
        hover:shadow-lg hover:shadow-${color}-500/10
      `}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 transform rotate-12 translate-x-8 -translate-y-8">
          <div className={`w-full h-full ${colors.icon} opacity-20`}>
            {icon}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.bg} ${colors.border} border`}>
            <div className={colors.icon}>
              {icon}
            </div>
          </div>
          
          {trend !== undefined && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">
            {title}
          </h3>
          
          <div className="text-2xl font-bold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          
          {subtitle && (
            <p className={`text-sm ${colors.text}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div className={`
        absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200
        bg-gradient-to-br ${colors.bg}
      `} />
    </motion.div>
  );
}