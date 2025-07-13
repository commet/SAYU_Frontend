'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Title {
  id: string;
  name: string;
  description: string;
  earnedAt?: Date;
  progress?: number;
  requirement?: number;
}

interface TitleBadgesProps {
  userId?: string;
  showProgress?: boolean;
}

const ALL_TITLES = [
  { id: 'early-bird', name: '얼리버드', description: '오전 10시 이전 관람 5회', icon: '🌅' },
  { id: 'night-owl', name: '야행성 올빼미', description: '야간 개장 관람 3회', icon: '🦉' },
  { id: 'slow-walker', name: '느긋한 산책자', description: '평균 관람 시간 2시간 이상', icon: '🚶' },
  { id: 'passion-runner', name: '열정 관람러', description: '하루 3개 이상 전시 관람', icon: '🏃' },
  { id: 'modern-art', name: '현대미술 마니아', description: '현대미술 전시 20회', icon: '🎭' },
  { id: 'photo-lover', name: '사진전 애호가', description: '사진전 15회', icon: '📸' },
  { id: 'k-art', name: 'K-아트 서포터', description: '한국 작가전 10회', icon: '🇰🇷' }
];

export default function TitleBadges({ userId, showProgress = false }: TitleBadgesProps) {
  const [mainTitle, setMainTitle] = useState<string>('새내기 관람객');
  const [earnedTitles, setEarnedTitles] = useState<string[]>([]);
  const [titleProgress, setTitleProgress] = useState<Record<string, { current: number; required: number }>>({});

  useEffect(() => {
    fetchUserTitles();
  }, [userId]);

  const fetchUserTitles = async () => {
    // TODO: 실제 API 호출
    // 임시 데이터
    setMainTitle('느긋한 산책자');
    setEarnedTitles(['early-bird', 'slow-walker', 'k-art']);
    setTitleProgress({
      'night-owl': { current: 2, required: 3 },
      'modern-art': { current: 15, required: 20 },
      'photo-lover': { current: 8, required: 15 }
    });
  };

  const isEarned = (titleId: string) => earnedTitles.includes(titleId);
  
  const getProgress = (titleId: string) => {
    if (isEarned(titleId)) return 100;
    return titleProgress[titleId] 
      ? (titleProgress[titleId].current / titleProgress[titleId].required) * 100
      : 0;
  };

  return (
    <div className="space-y-4">
      {/* 메인 칭호 */}
      <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 
                    rounded-lg border border-purple-200">
        <div className="text-sm text-gray-600 mb-1">현재 칭호</div>
        <div className="text-xl font-bold text-purple-800">{mainTitle}</div>
      </div>

      {/* 획득한 칭호들 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          획득한 칭호 ({earnedTitles.length}/{ALL_TITLES.length})
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {ALL_TITLES.map((title) => {
            const earned = isEarned(title.id);
            const progress = getProgress(title.id);
            
            return (
              <motion.div
                key={title.id}
                whileHover={{ scale: earned ? 1.05 : 1 }}
                className={`
                  relative p-3 rounded-lg border-2 transition-all
                  ${earned 
                    ? 'border-purple-400 bg-purple-50' 
                    : 'border-gray-200 bg-gray-50 opacity-60'
                  }
                `}
              >
                <div className="flex items-start gap-2">
                  <span className="text-2xl">{title.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${earned ? 'text-purple-800' : 'text-gray-600'}`}>
                      {title.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {title.description}
                    </div>
                  </div>
                </div>

                {/* 진행도 표시 */}
                {showProgress && !earned && titleProgress[title.id] && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>진행도</span>
                      <span>
                        {titleProgress[title.id].current}/{titleProgress[title.id].required}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-400 
                                 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 획득 마크 */}
                {earned && (
                  <div className="absolute top-1 right-1">
                    <span className="text-purple-600">✓</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 다음 달성 가능 칭호 */}
      {showProgress && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-yellow-600">💡</span>
            <span className="text-yellow-800">
              <strong>야행성 올빼미</strong> 칭호까지 야간 관람 1회 더!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}