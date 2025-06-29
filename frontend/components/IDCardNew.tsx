'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import QRCode from 'react-qr-code';

interface IDCardProps {
  personalityType: string;
  userName?: string;
  userHandle?: string;
  profileImage?: string;
  joinDate?: Date;
  stats?: {
    exhibitionsVisited: number;
    artworksViewed: number;
    hoursSpent: number;
  };
  level?: number;
  badges?: string[];
  language?: 'ko' | 'en';
  onClose?: () => void;
  onShareClick?: () => void;
}

// 성격 유형별 정보
const personalityInfo: Record<string, { name: { ko: string; en: string }, catchphrase: { ko: string; en: string }, pattern: string }> = {
  'SRMC': {
    name: { ko: '시각적 분석가', en: 'Visual Analyst' },
    catchphrase: { ko: '패턴 속에서 의미를 찾는 예술 탐험가', en: 'Finding meaning in patterns' },
    pattern: 'geometric'
  },
  'LAEF': {
    name: { ko: '몽상가', en: 'Dreamer' },
    catchphrase: { ko: '감정의 색채로 세상을 그리는 예술가', en: 'Painting the world with emotions' },
    pattern: 'organic'
  },
  'SREF': {
    name: { ko: '소통하는 관찰자', en: 'Communicative Observer' },
    catchphrase: { ko: '사람과 예술을 연결하는 큐레이터', en: 'Connecting people through art' },
    pattern: 'mixed'
  },
  'LAMC': {
    name: { ko: '사색하는 학자', en: 'Contemplative Scholar' },
    catchphrase: { ko: '깊이 있는 통찰로 예술을 해석하는 철학자', en: 'Deep insights into art' },
    pattern: 'minimal'
  }
};

export default function IDCardNew({
  personalityType,
  userName = 'SAYU Explorer',
  userHandle = '@sayu_user',
  profileImage,
  joinDate = new Date(),
  stats = {
    exhibitionsVisited: 0,
    artworksViewed: 0,
    hoursSpent: 0
  },
  level = 1,
  badges = [],
  language = 'ko',
  onClose,
  onShareClick
}: IDCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardFrontRef = useRef<HTMLDivElement>(null);
  const cardBackRef = useRef<HTMLDivElement>(null);

  const info = personalityInfo[personalityType] || personalityInfo['SRMC'];
  const testUrl = `${process.env.NEXT_PUBLIC_URL || 'https://sayu.app'}/quiz`;

  const generateAndShare = async () => {
    setIsGenerating(true);
    try {
      // 현재 보이는 면을 캡처
      const targetRef = isFlipped ? cardBackRef : cardFrontRef;
      if (!targetRef.current) return;

      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: null,
        scale: 3,
        logging: false,
        useCORS: true,
        width: 400,
        height: 600
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        // 로그인 체크 및 공유 처리는 부모 컴포넌트에서
        if (onShareClick) {
          onShareClick();
        }

        // Web Share API 또는 다운로드
        if (navigator.share && navigator.canShare({ files: [new File([blob], 'sayu-id-card.png', { type: 'image/png' })] })) {
          try {
            await navigator.share({
              title: 'SAYU - 나의 예술 취향',
              text: `나는 ${personalityType} 유형! 당신의 예술 취향은? #SAYU #나의예술취향 #${personalityType}`,
              files: [new File([blob], 'sayu-id-card.png', { type: 'image/png' })]
            });
          } catch (error) {
            console.error('Error sharing:', error);
          }
        } else {
          // Fallback: 다운로드
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `SAYU_${personalityType}_card.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // 배경 패턴 생성
  const getBackgroundPattern = (pattern: string) => {
    switch (pattern) {
      case 'geometric':
        return 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700';
      case 'organic':
        return 'bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600';
      case 'mixed':
        return 'bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600';
      case 'minimal':
        return 'bg-gradient-to-br from-gray-700 via-purple-600 to-blue-600';
      default:
        return 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <span className="text-white text-xl">✕</span>
        </button>

        {/* Card Container */}
        <div className="relative w-[400px] h-[600px]" style={{ perspective: '1000px' }}>
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front Side - Instagram Style */}
            <div 
              ref={cardFrontRef}
              className="absolute inset-0 w-full h-full backface-hidden cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className={`relative w-full h-full rounded-3xl overflow-hidden shadow-2xl ${getBackgroundPattern(info.pattern)}`}>
                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" viewBox="0 0 400 600">
                    {info.pattern === 'geometric' && (
                      <>
                        <rect x="50" y="50" width="100" height="100" fill="white" opacity="0.1" transform="rotate(45 100 100)" />
                        <rect x="250" y="150" width="80" height="80" fill="white" opacity="0.1" transform="rotate(45 290 190)" />
                        <rect x="150" y="350" width="120" height="120" fill="white" opacity="0.1" transform="rotate(45 210 410)" />
                      </>
                    )}
                    {info.pattern === 'organic' && (
                      <>
                        <circle cx="100" cy="100" r="60" fill="white" opacity="0.1" />
                        <ellipse cx="300" cy="200" rx="80" ry="50" fill="white" opacity="0.1" />
                        <circle cx="200" cy="400" r="90" fill="white" opacity="0.1" />
                      </>
                    )}
                  </svg>
                </div>

                <div className="relative h-full p-8 flex flex-col text-white">
                  {/* Logo */}
                  <div className="text-center mb-8">
                    <div className="text-3xl font-bold tracking-wider mb-1">SAYU</div>
                    <div className="text-xs opacity-80 uppercase tracking-widest">Art Identity</div>
                  </div>

                  {/* Visual Icon */}
                  <div className="mx-auto mb-6 w-40 h-40 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border-4 border-white/20">
                    <div className="text-7xl">{getPersonalityEmoji(personalityType)}</div>
                  </div>

                  {/* Type Badge */}
                  <div className="text-center mb-6">
                    <div className="inline-block bg-white/20 backdrop-blur-md rounded-full px-8 py-3">
                      <div className="text-4xl font-bold tracking-wider">{personalityType}</div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="text-center mb-4">
                    <div className="text-2xl font-semibold mb-1">{userName}</div>
                    <div className="text-sm opacity-80">{userHandle}</div>
                  </div>

                  {/* Catchphrase */}
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold mb-2">{info.name[language]}</h3>
                    <p className="text-sm opacity-90 italic px-4">"{info.catchphrase[language]}"</p>
                  </div>

                  {/* Hashtags */}
                  <div className="text-center mb-6">
                    <p className="text-sm opacity-80">
                      #SAYU #나의예술취향 #{personalityType} #예술성향테스트
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="mt-auto flex justify-center">
                    <div className="bg-white p-3 rounded-xl">
                      <QRCode value={testUrl} size={80} level="M" />
                    </div>
                  </div>

                  {/* Flip Indicator */}
                  <div className="absolute bottom-4 right-4 text-xs opacity-60 flex items-center gap-1">
                    <span>{language === 'ko' ? '자세히 보기' : 'View Details'}</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Side - Detailed Stats */}
            <div 
              ref={cardBackRef}
              className="absolute inset-0 w-full h-full backface-hidden cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
                <div className="absolute inset-0 bg-black/20" />
                
                <div className="relative h-full p-8 flex flex-col text-white">
                  <h3 className="text-2xl font-bold mb-6 text-center">
                    {language === 'ko' ? '나의 예술 여정' : 'My Art Journey'}
                  </h3>

                  {/* User Profile */}
                  <div className="flex items-center gap-4 mb-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-2xl">{getPersonalityEmoji(personalityType)}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{userName}</div>
                      <div className="text-sm opacity-80">Level {level} • {formatDate(joinDate)}</div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold mb-1">{stats.exhibitionsVisited}</div>
                      <div className="text-xs opacity-80">{language === 'ko' ? '전시 관람' : 'Exhibitions'}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold mb-1">{stats.artworksViewed}</div>
                      <div className="text-xs opacity-80">{language === 'ko' ? '작품 감상' : 'Artworks'}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold mb-1">{stats.hoursSpent}h</div>
                      <div className="text-xs opacity-80">{language === 'ko' ? '감상 시간' : 'Hours'}</div>
                    </div>
                  </div>

                  {/* Achievement Badges */}
                  {badges.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-3">
                        {language === 'ko' ? '획득한 배지' : 'Achievements'}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {badges.map((badge, index) => (
                          <span 
                            key={index}
                            className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Personality Description */}
                  <div className="mt-auto bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-sm leading-relaxed">
                      {language === 'ko' 
                        ? `${personalityType} 유형은 ${info.name.ko}입니다. ${info.catchphrase.ko}`
                        : `As a ${personalityType}, you are the ${info.name.en}. ${info.catchphrase.en}`
                      }
                    </p>
                  </div>

                  {/* Flip Indicator */}
                  <div className="absolute bottom-4 left-4 text-xs opacity-60 flex items-center gap-1">
                    <span>←</span>
                    <span>{language === 'ko' ? '앞면 보기' : 'View Front'}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Share Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateAndShare}
          disabled={isGenerating}
          className="mt-6 w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full py-4 px-6 font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              {language === 'ko' ? '이미지 생성 중...' : 'Generating...'}
            </>
          ) : (
            <>
              <span>📸</span>
              {language === 'ko' ? '공유하기' : 'Share'}
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// Helper function to get emoji for personality type
function getPersonalityEmoji(type: string): string {
  const emojiMap: Record<string, string> = {
    'LAEF': '🎨', 'LAEC': '🏛️', 'LAMF': '🌙', 'LAMC': '📚',
    'LREF': '🔍', 'LREC': '🧩', 'LRMF': '🎭', 'LRMC': '📐',
    'SAEF': '🌟', 'SAEC': '🎪', 'SAMF': '🎯', 'SAMC': '📊',
    'SREF': '💡', 'SREC': '🔬', 'SRMF': '🎨', 'SRMC': '📈'
  };
  
  return emojiMap[type] || '✨';
}