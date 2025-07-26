'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParticipantCounterProps {
  count: number;
  className?: string;
}

export function ParticipantCounter({ count, className }: ParticipantCounterProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={className}
    >
      <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
        <Users className="w-4 h-4" />
        <motion.span
          key={count}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-medium"
        >
          {count.toLocaleString()}만
        </motion.span>
        <span className="text-xs">생각 중</span>
      </Badge>
    </motion.div>
  );
}