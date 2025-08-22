'use client';

import { motion } from 'framer-motion';
import { Users, Eye, Brain, Compass } from 'lucide-react';

interface AxisData {
  dimension: string;
  leftCode: string;
  leftLabel: string;
  leftDesc: string;
  rightCode: string;
  rightLabel: string;
  rightDesc: string;
  userSide: 'left' | 'right';
  percentage: number;
  icon: React.ReactNode;
}

interface PersonalityAxesProps {
  personalityType: string;
  scores?: Record<string, number>;
}

export function PersonalityAxes({ personalityType, scores = {} }: PersonalityAxesProps) {
  // Parse personality type (e.g., "SAMF" -> S, A, M, F)
  const types = personalityType.split('');
  
  const axes: AxisData[] = [
    {
      dimension: '관람 선호도',
      leftCode: 'L',
      leftLabel: '고독한',
      leftDesc: '개별적, 내성적',
      rightCode: 'S',
      rightLabel: '사교적',
      rightDesc: '상호작용, 협력적',
      userSide: types[0] === 'L' ? 'left' : 'right',
      percentage: types[0] === 'L' ? (scores.L || 30) : (scores.S || 70),
      icon: <Users className="w-5 h-5" />
    },
    {
      dimension: '인식 스타일',
      leftCode: 'A',
      leftLabel: '추상',
      leftDesc: '분위기적, 상징적',
      rightCode: 'R',
      rightLabel: '구상',
      rightDesc: '현실적, 구체적',
      userSide: types[1] === 'A' ? 'left' : 'right',
      percentage: types[1] === 'A' ? (scores.A || 30) : (scores.R || 70),
      icon: <Eye className="w-5 h-5" />
    },
    {
      dimension: '성찰 유형',
      leftCode: 'E',
      leftLabel: '감정적',
      leftDesc: '정서적, 감정기반',
      rightCode: 'M',
      rightLabel: '의미추구',
      rightDesc: '분석적, 이성적',
      userSide: types[2] === 'E' ? 'left' : 'right',
      percentage: types[2] === 'E' ? (scores.E || 30) : (scores.M || 70),
      icon: <Brain className="w-5 h-5" />
    },
    {
      dimension: '탐색 스타일',
      leftCode: 'F',
      leftLabel: '흐름',
      leftDesc: '유동적, 자발적',
      rightCode: 'C',
      rightLabel: '구조적',
      rightDesc: '체계적, 조직적',
      userSide: types[3] === 'F' ? 'left' : 'right',
      percentage: types[3] === 'F' ? (scores.F || 30) : (scores.C || 70),
      icon: <Compass className="w-5 h-5" />
    }
  ];

  return (
    <div className="space-y-6">
      {axes.map((axis, index) => (
        <motion.div
          key={axis.dimension}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
        >
          {/* Dimension Title */}
          <div className="flex items-center gap-2 mb-4">
            <div className="text-purple-400">{axis.icon}</div>
            <h3 className="text-lg font-semibold text-white">{axis.dimension}</h3>
          </div>

          {/* Axis Bar */}
          <div className="relative mb-3">
            {/* Background Bar */}
            <div className="h-12 bg-gradient-to-r from-blue-900/50 via-gray-800/50 to-orange-900/50 rounded-full overflow-hidden">
              {/* Position Indicator */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${axis.percentage}%` }}
                transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                className="h-full relative"
              >
                <div className={`absolute inset-0 ${
                  axis.userSide === 'left' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500' 
                    : 'bg-gradient-to-r from-orange-500 to-orange-600'
                }`} />
                
                {/* Marker */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <div className={`w-4 h-4 rounded-full ${
                    axis.userSide === 'left' ? 'bg-blue-500' : 'bg-orange-500'
                  }`} />
                </div>
              </motion.div>
            </div>

            {/* Labels */}
            <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
              <div className={`text-sm font-medium ${
                axis.userSide === 'left' ? 'text-white' : 'text-gray-400'
              }`}>
                {axis.leftCode}
              </div>
              <div className={`text-sm font-medium ${
                axis.userSide === 'right' ? 'text-white' : 'text-gray-400'
              }`}>
                {axis.rightCode}
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`${
              axis.userSide === 'left' 
                ? 'bg-blue-500/10 border-blue-500/30' 
                : 'bg-white/5 border-white/10'
            } rounded-lg p-3 border transition-all`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`font-semibold ${
                  axis.userSide === 'left' ? 'text-blue-300' : 'text-gray-300'
                }`}>
                  {axis.leftLabel}
                </span>
                {axis.userSide === 'left' && (
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                    당신의 성향
                  </span>
                )}
              </div>
              <p className={`text-xs ${
                axis.userSide === 'left' ? 'text-blue-200' : 'text-gray-400'
              }`}>
                {axis.leftDesc}
              </p>
            </div>

            <div className={`${
              axis.userSide === 'right' 
                ? 'bg-orange-500/10 border-orange-500/30' 
                : 'bg-white/5 border-white/10'
            } rounded-lg p-3 border transition-all`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`font-semibold ${
                  axis.userSide === 'right' ? 'text-orange-300' : 'text-gray-300'
                }`}>
                  {axis.rightLabel}
                </span>
                {axis.userSide === 'right' && (
                  <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">
                    당신의 성향
                  </span>
                )}
              </div>
              <p className={`text-xs ${
                axis.userSide === 'right' ? 'text-orange-200' : 'text-gray-400'
              }`}>
                {axis.rightDesc}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}