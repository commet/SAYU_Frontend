'use client';

import React from 'react';
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function GamificationPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">내 활동 & 보상</h1>
        </div>
        <p className="text-muted-foreground">
          SAYU에서의 활동을 통해 경험치를 획득하고 레벨을 올려보세요!
        </p>
      </motion.div>

      <GamificationDashboard />
    </div>
  );
}