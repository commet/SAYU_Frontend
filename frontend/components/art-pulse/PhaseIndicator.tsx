'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Eye, MessageCircle, Vote } from 'lucide-react';
import { ArtPulseSession } from '@sayu/shared';
import { cn } from '@/lib/utils';

interface PhaseIndicatorProps {
  phase: ArtPulseSession['phase'];
  className?: string;
}

export function PhaseIndicator({ phase, className }: PhaseIndicatorProps) {
  const phaseConfig = {
    contemplation: {
      label: '감상 중',
      icon: Eye,
      color: 'bg-blue-500',
      description: '작품을 감상하고 감정을 표현하는 시간'
    },
    sharing: {
      label: '사유 중',
      icon: MessageCircle,
      color: 'bg-green-500',
      description: '사유를 나누고 소통하는 시간'
    },
    voting: {
      label: '투표 중',
      icon: Vote,
      color: 'bg-purple-500',
      description: '가장 인상 깊은 사유를 선택하는 시간'
    }
  };

  const config = phaseConfig[phase];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn("relative", className)}
    >
      <Badge 
        className={cn(
          "flex items-center gap-2 px-3 py-1 text-white",
          config.color
        )}
      >
        <motion.div
          animate={{ rotate: phase === 'contemplation' ? 360 : 0 }}
          transition={{ duration: 2, repeat: phase === 'contemplation' ? Infinity : 0, ease: "linear" }}
        >
          <Icon className="w-4 h-4" />
        </motion.div>
        <span className="font-medium">{config.label}</span>
      </Badge>
      
      {/* Pulse animation for active phase */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full opacity-30",
          config.color
        )}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}