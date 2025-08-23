'use client';

import { motion } from 'framer-motion';
import { Users, Eye, Brain, Compass } from 'lucide-react';

interface PersonalityAxesProps {
  personalityType: string;
  scores?: Record<string, number>;
}

export function PersonalityAxes({ personalityType, scores = {} }: PersonalityAxesProps) {
  // Parse personality type (e.g., "SAMF" -> S, A, M, F)
  const types = personalityType.split('');
  
  // Calculate percentages for each axis
  const calculatePercentages = (leftScore: number, rightScore: number) => {
    const total = leftScore + rightScore;
    if (total === 0) return { left: 50, right: 50 };
    return {
      left: Math.round((leftScore / total) * 100),
      right: Math.round((rightScore / total) * 100)
    };
  };
  
  // Get scores from aptScores if available, otherwise from raw scores
  const lsPercent = scores.L && scores.S 
    ? calculatePercentages(scores.L, scores.S)
    : { left: types[0] === 'L' ? 65 : 35, right: types[0] === 'S' ? 65 : 35 };
    
  const arPercent = scores.A && scores.R
    ? calculatePercentages(scores.A, scores.R)
    : { left: types[1] === 'A' ? 65 : 35, right: types[1] === 'R' ? 65 : 35 };
    
  const emPercent = scores.E && scores.M
    ? calculatePercentages(scores.E, scores.M)
    : { left: types[2] === 'E' ? 65 : 35, right: types[2] === 'M' ? 65 : 35 };
    
  const fcPercent = scores.F && scores.C
    ? calculatePercentages(scores.F, scores.C)
    : { left: types[3] === 'F' ? 65 : 35, right: types[3] === 'C' ? 65 : 35 };

  const axes = [
    {
      leftLabel: 'Lone',
      leftLabelKo: '독립적',
      rightLabel: 'Social',
      rightLabelKo: '사회적',
      leftPercent: lsPercent.left,
      rightPercent: lsPercent.right,
      leftDesc: 'Individual, introspective',
      leftDescKo: '혼자 작품 감상, 내적 성찰',
      rightDesc: 'Interactive, collaborative',
      rightDescKo: '함께 토론, 경험 공유',
      userSide: types[0],
      barColor: '#3B82F6' // 파란색 계열로 통일
    },
    {
      leftLabel: 'Abstract',
      leftLabelKo: '추상적',
      rightLabel: 'Representational',
      rightLabelKo: '재현적',
      leftPercent: arPercent.left,
      rightPercent: arPercent.right,
      leftDesc: 'Atmospheric, symbolic',
      leftDescKo: '분위기와 감정, 상징적',
      rightDesc: 'Realistic, concrete',
      rightDescKo: '사실적 묘사, 기법 중시',
      userSide: types[1],
      barColor: '#10B981' // 초록색 계열로 통일
    },
    {
      leftLabel: 'Emotional',
      leftLabelKo: '감정적',
      rightLabel: 'Meaning-driven',
      rightLabelKo: '의미중심',
      leftPercent: emPercent.left,
      rightPercent: emPercent.right,
      leftDesc: 'Affective, feeling-based',
      leftDescKo: '직감적 감상, 감정 우선',
      rightDesc: 'Analytical, rational',
      rightDescKo: '작품 해석, 의미 탐구',
      userSide: types[2],
      barColor: '#F59E0B' // 주황색 계열로 통일
    },
    {
      leftLabel: 'Flow',
      leftLabelKo: '유동적',
      rightLabel: 'Constructive',
      rightLabelKo: '구조적',
      leftPercent: fcPercent.left,
      rightPercent: fcPercent.right,
      leftDesc: 'Fluid, spontaneous',
      leftDescKo: '자유로운 탐험, 즉흥적',
      rightDesc: 'Structured, systematic',
      rightDescKo: '계획적 관람, 체계적',
      userSide: types[3],
      barColor: '#8B5CF6' // 보라색 계열로 통일
    }
  ];

  return (
    <div className="space-y-3 mb-4 mt-2">
      {/* Section Title */}
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold text-white mb-0.5">각 축의 세부 설명</h3>
        <p className="text-gray-300 text-xs">당신의 예술 페르소나를 4개 축으로 분석한 결과입니다</p>
      </div>
      
      <div className="space-y-3">
        {axes.map((axis, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-1"
        >
          {/* Labels */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${
                axis.userSide === axis.leftLabel[0] ? 'text-white' : 'text-gray-300'
              }`}>
                {axis.leftLabel}
              </span>
              <span className={`text-sm font-medium ${
                axis.userSide === axis.leftLabel[0] ? 'text-white' : 'text-gray-400'
              }`}>
                {axis.leftPercent}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${
                axis.userSide === axis.rightLabel[0] ? 'text-white' : 'text-gray-400'
              }`}>
                {axis.rightPercent}%
              </span>
              <span className={`font-semibold ${
                axis.userSide === axis.rightLabel[0] ? 'text-white' : 'text-gray-300'
              }`}>
                {axis.rightLabel}
              </span>
            </div>
          </div>
          
          {/* Bar Chart */}
          <div className="relative h-4 bg-gray-800/30 rounded-full overflow-hidden border border-gray-700/50">
            {/* Single unified bar with gradient based on dominant side */}
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ 
                background: `linear-gradient(to right, ${axis.barColor}20 0%, ${axis.barColor} 50%, ${axis.barColor}20 100%)`,
                width: '100%'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            />
            
            {/* Dominant side highlight */}
            <motion.div
              className="absolute top-0 h-full rounded-full"
              style={{ 
                backgroundColor: axis.barColor,
                left: axis.userSide === axis.leftLabel[0] ? '0%' : `${axis.leftPercent}%`,
                width: `${axis.userSide === axis.leftLabel[0] ? axis.leftPercent : axis.rightPercent}%`
              }}
              initial={{ width: 0 }}
              animate={{ 
                width: `${axis.userSide === axis.leftLabel[0] ? axis.leftPercent : axis.rightPercent}%`
              }}
              transition={{ duration: 1.2, ease: "easeOut", delay: index * 0.1 + 0.3 }}
            />
            
            {/* Center divider line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-600/50 -translate-x-1/2" />
          </div>
          
          {/* Descriptions */}
          <div className="flex justify-between text-xs">
            <span className={`max-w-[45%] ${
              axis.userSide === axis.leftLabel[0] ? 'text-white' : 'text-gray-400'
            }`}>
              {axis.leftDescKo}
            </span>
            <span className={`max-w-[45%] text-right ${
              axis.userSide === axis.rightLabel[0] ? 'text-white' : 'text-gray-400'
            }`}>
              {axis.rightDescKo}
            </span>
          </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}