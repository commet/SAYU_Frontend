'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import QRCode from 'react-qr-code';
import { personalityGradients, getGradientStyle } from '@/constants/personality-gradients';

interface IDCardViralProps {
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
  recentExhibitions?: Array<{
    name: string;
    venue: string;
    image?: string;
  }>;
  favoriteArtist?: string;
  nextExhibition?: string;
  keywords?: string[];
  level?: number;
  badges?: string[];
  language?: 'ko' | 'en';
  onClose?: () => void;
  onShareClick?: () => void;
}

export default function IDCardViral({
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
  recentExhibitions = [],
  favoriteArtist,
  nextExhibition,
  keywords = [],
  level = 1,
  badges = [],
  language = 'ko',
  onClose,
  onShareClick
}: IDCardViralProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cardLayout, setCardLayout] = useState<'minimal' | 'detailed' | 'story'>('minimal');
  const cardRef = useRef<HTMLDivElement>(null);

  const gradient = personalityGradients[personalityType as keyof typeof personalityGradients] || personalityGradients.LAEF;
  const testUrl = `${process.env.NEXT_PUBLIC_URL || 'https://sayu.app'}/quiz`;

  const generateAndShare = async () => {
    setIsGenerating(true);
    try {
      if (!cardRef.current) return;

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3,
        logging: false,
        useCORS: true,
        width: 540,
        height: 960
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        if (onShareClick) {
          onShareClick();
        }

        if (navigator.share && navigator.canShare({ files: [new File([blob], 'sayu-id-card.png', { type: 'image/png' })] })) {
          try {
            await navigator.share({
              title: 'SAYU - 나의 예술 성격',
              text: `나는 ${gradient[language === 'ko' ? 'name' : 'nameEn']}! 당신의 예술 성격은? #SAYU #예술성격 #${personalityType}`,
              files: [new File([blob], 'sayu-id-card.png', { type: 'image/png' })]
            });
          } catch (error) {
            console.error('Error sharing:', error);
          }
        } else {
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
      month: 'short'
    }).format(date);
  };

  // 키워드 자동 생성
  const generateKeywords = () => {
    if (keywords.length > 0) return keywords;
    
    const defaultKeywords = {
      LAEF: ['몽상가', '감성적', '직관적'],
      SRMC: ['분석가', '체계적', '논리적'],
      SREF: ['네트워커', '열정적', '소통'],
      LAMC: ['사색가', '깊이있는', '학구적']
    };
    
    return defaultKeywords[personalityType as keyof typeof defaultKeywords] || ['예술애호가', '감성적', '탐험가'];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="relative max-w-[540px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <span className="text-white text-xl">✕</span>
        </button>

        {/* Layout Selector */}
        <div className="flex gap-2 mb-4 justify-center">
          {['minimal', 'detailed', 'story'].map((layout) => (
            <button
              key={layout}
              onClick={() => setCardLayout(layout as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                cardLayout === layout 
                  ? 'bg-white text-black' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {layout === 'minimal' && '✨ 미니멀'}
              {layout === 'detailed' && '📊 디테일'}
              {layout === 'story' && '📖 스토리'}
            </button>
          ))}
        </div>

        {/* Card Container */}
        <div 
          ref={cardRef}
          className="relative w-[540px] h-[960px] overflow-hidden rounded-3xl shadow-2xl"
          style={{ background: getGradientStyle(personalityType as keyof typeof personalityGradients, 135) }}
        >
          {/* Glass Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20" />

          {/* Animated Background Shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ 
                x: [0, 100, 0],
                y: [0, -100, 0],
                rotate: 360
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ 
                x: [0, -100, 0],
                y: [0, 100, 0],
                rotate: -360
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
            />
          </div>

          <AnimatePresence mode="wait">
            {/* Minimal Layout */}
            {cardLayout === 'minimal' && (
              <motion.div
                key="minimal"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="relative h-full p-10 flex flex-col text-white"
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl font-bold tracking-wider mb-2"
                  >
                    SAYU
                  </motion.div>
                  <div className="text-sm opacity-80 uppercase tracking-[0.3em]">Art Soul</div>
                </div>

                {/* Profile Section */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-12"
                >
                  {/* Avatar */}
                  <div className="mx-auto mb-6 w-32 h-32 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center ring-4 ring-white/30 shadow-2xl">
                    <span className="text-6xl">{getPersonalityEmoji(personalityType)}</span>
                  </div>

                  {/* Name */}
                  <h2 className="text-3xl font-bold mb-2">{userName}</h2>
                  <p className="text-lg opacity-80 mb-6">{userHandle}</p>

                  {/* Type Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="inline-block"
                  >
                    <div className="bg-white/20 backdrop-blur-md rounded-full px-10 py-5 shadow-xl">
                      <div className="text-5xl font-bold tracking-wider mb-2">{personalityType}</div>
                      <div className="text-xl">{gradient[language === 'ko' ? 'name' : 'nameEn']}</div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Keywords */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center mb-12"
                >
                  <div className="flex flex-wrap gap-3 justify-center">
                    {generateKeywords().map((keyword, i) => (
                      <span 
                        key={i}
                        className="bg-white/15 backdrop-blur-sm rounded-full px-6 py-2 text-lg"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Quote */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mb-auto"
                >
                  <p className="text-xl italic opacity-90 leading-relaxed px-4">
                    "{gradient.description}"
                  </p>
                </motion.div>

                {/* Footer */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-auto"
                >
                  {/* QR Code */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-white p-3 rounded-2xl shadow-lg">
                      <QRCode value={testUrl} size={80} level="M" />
                    </div>
                  </div>

                  {/* Join Date */}
                  <div className="text-center text-sm opacity-70">
                    Since {formatDate(joinDate)}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Detailed Layout */}
            {cardLayout === 'detailed' && (
              <motion.div
                key="detailed"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="relative h-full p-8 flex flex-col text-white"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="text-3xl font-bold">SAYU</div>
                    <div className="text-xs opacity-80">Art Soul Report</div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{personalityType}</div>
                    <div className="text-sm opacity-80">{gradient[language === 'ko' ? 'name' : 'nameEn']}</div>
                  </div>
                </div>

                {/* User Info */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl">
                      {getPersonalityEmoji(personalityType)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold">{userName}</h3>
                      <p className="opacity-80">{userHandle}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>Level {level}</span>
                        <span>•</span>
                        <span>{formatDate(joinDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold mb-1">{stats.exhibitionsVisited}</div>
                    <div className="text-xs opacity-80">전시</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold mb-1">{stats.artworksViewed}</div>
                    <div className="text-xs opacity-80">작품</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold mb-1">{stats.hoursSpent}h</div>
                    <div className="text-xs opacity-80">시간</div>
                  </div>
                </div>

                {/* Recent Exhibitions */}
                {recentExhibitions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 opacity-80">최근 관람</h4>
                    <div className="space-y-2">
                      {recentExhibitions.slice(0, 3).map((exhibition, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm">
                          <div className="font-medium">{exhibition.name}</div>
                          <div className="opacity-70 text-xs">{exhibition.venue}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Exhibition */}
                {nextExhibition && (
                  <div className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                    <div className="text-sm opacity-80 mb-1">다음 계획</div>
                    <div className="font-semibold">{nextExhibition}</div>
                  </div>
                )}

                {/* Favorite Artist */}
                {favoriteArtist && (
                  <div className="mt-auto text-center">
                    <div className="text-sm opacity-80 mb-2">최애 작가</div>
                    <div className="text-2xl font-bold">{favoriteArtist}</div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Story Layout */}
            {cardLayout === 'story' && (
              <motion.div
                key="story"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="relative h-full p-10 flex flex-col text-white"
              >
                {/* Magazine Style Header */}
                <div className="text-center mb-8">
                  <div className="text-sm uppercase tracking-[0.3em] opacity-70 mb-2">SAYU Magazine</div>
                  <div className="text-5xl font-serif mb-2">Art Life</div>
                  <div className="text-sm opacity-70">Vol. {stats.exhibitionsVisited || 1}</div>
                </div>

                {/* Story Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                  >
                    <h2 className="text-6xl font-bold mb-4">{personalityType}</h2>
                    <h3 className="text-3xl font-serif mb-6 opacity-90">
                      {gradient[language === 'ko' ? 'name' : 'nameEn']}
                    </h3>
                  </motion.div>

                  {/* Story Text */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-md mx-auto text-center"
                  >
                    <p className="text-lg leading-relaxed mb-6 opacity-90">
                      {language === 'ko' 
                        ? `${userName}님은 지난 ${stats.exhibitionsVisited}번의 전시를 통해 ${stats.artworksViewed}개의 작품을 만났습니다.`
                        : `${userName} has discovered ${stats.artworksViewed} artworks through ${stats.exhibitionsVisited} exhibitions.`
                      }
                    </p>
                    
                    {favoriteArtist && (
                      <p className="text-lg leading-relaxed mb-6 opacity-90">
                        {language === 'ko'
                          ? `특히 ${favoriteArtist}의 작품에서 깊은 영감을 받았습니다.`
                          : `Deeply inspired by the works of ${favoriteArtist}.`
                        }
                      </p>
                    )}

                    {nextExhibition && (
                      <p className="text-lg leading-relaxed opacity-90">
                        {language === 'ko'
                          ? `다음 여정은 "${nextExhibition}"입니다.`
                          : `Next journey: "${nextExhibition}".`
                        }
                      </p>
                    )}
                  </motion.div>
                </div>

                {/* Footer Quote */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-auto text-center"
                >
                  <p className="text-2xl font-serif italic opacity-80">
                    "Every artwork is a new discovery"
                  </p>
                  <div className="mt-4 text-sm opacity-60">
                    {formatDate(joinDate)} - Present
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Elements */}
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
            <div className="text-xs opacity-60">
              @{personalityType.toLowerCase()}_life
            </div>
            <div className="text-xs opacity-60">
              sayu.app
            </div>
          </div>
        </div>

        {/* Share Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateAndShare}
          disabled={isGenerating}
          className="mt-6 w-full bg-white text-black rounded-full py-4 px-6 font-bold flex items-center justify-center gap-3 hover:shadow-xl transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
              />
              {language === 'ko' ? '이미지 생성 중...' : 'Generating...'}
            </>
          ) : (
            <>
              <span className="text-xl">📸</span>
              <span>{language === 'ko' ? 'SNS에 공유하기' : 'Share to SNS'}</span>
              <span className="text-xl">✨</span>
            </>
          )}
        </motion.button>

        {/* Quick Share Options */}
        <div className="mt-4 flex gap-2 justify-center">
          <button className="text-white/60 hover:text-white text-sm transition-colors">
            인스타그램 스토리
          </button>
          <span className="text-white/40">•</span>
          <button className="text-white/60 hover:text-white text-sm transition-colors">
            피드 공유
          </button>
          <span className="text-white/40">•</span>
          <button className="text-white/60 hover:text-white text-sm transition-colors">
            다운로드
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Helper function
function getPersonalityEmoji(type: string): string {
  const emojiMap: Record<string, string> = {
    'LAEF': '🎨', 'LAES': '🏛️', 'LAMF': '🌙', 'LAMC': '📚',
    'LREF': '🌸', 'LRES': '🎭', 'LRMF': '💝', 'LRMC': '🤝',
    'SAEF': '⚡', 'SAES': '🔍', 'SAMF': '🚀', 'SAMC': '📊',
    'SREF': '🔥', 'SRES': '✨', 'SRMF': '🎪', 'SRMC': '🎯'
  };
  
  return emojiMap[type] || '✨';
}