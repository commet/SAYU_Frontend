'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';

interface IDCardProps {
  personalityType: string;
  userName?: string;
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
}

export default function IDCard({
  personalityType,
  userName = 'SAYU User',
  joinDate = new Date(),
  stats = {
    exhibitionsVisited: 0,
    artworksViewed: 0,
    hoursSpent: 0
  },
  level = 1,
  badges = [],
  language = 'ko',
  onClose
}: IDCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!cardRef.current) return;
    
    setIsSharing(true);
    try {
      // Capture the card as an image
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        // Check if Web Share API is available
        if (navigator.share && navigator.canShare({ files: [new File([blob], 'sayu-id-card.png', { type: 'image/png' })] })) {
          try {
            await navigator.share({
              title: 'My SAYU ID Card',
              text: `나의 SAYU 미술 성향: ${personalityType}`,
              files: [new File([blob], 'sayu-id-card.png', { type: 'image/png' })]
            });
          } catch (error) {
            console.error('Error sharing:', error);
          }
        } else {
          // Fallback: Download the image
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'sayu-id-card.png';
          a.click();
          URL.revokeObjectURL(url);
          
          alert(language === 'ko' 
            ? 'ID 카드가 다운로드되었습니다. Instagram에 공유해보세요!' 
            : 'ID card downloaded. Share it on Instagram!'
          );
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error capturing card:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
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
        <div className="relative w-[400px] h-[600px] preserve-3d" style={{ perspective: '1000px' }}>
          <motion.div
            ref={cardRef}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 preserve-3d cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front Side */}
            <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" />
              <div className="absolute inset-0 bg-black/20" />
              
              <div className="relative h-full p-8 flex flex-col text-white">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="text-sm font-medium mb-2 opacity-90">SAYU ART IDENTITY</div>
                  <div className="text-4xl font-bold tracking-wider">{personalityType}</div>
                </div>

                {/* Profile Image Placeholder */}
                <div className="mx-auto mb-6 w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-6xl">{getPersonalityEmoji(personalityType)}</div>
                </div>

                {/* User Info */}
                <div className="text-center mb-6">
                  <div className="text-2xl font-semibold mb-2">{userName}</div>
                  <div className="text-sm opacity-80">
                    {language === 'ko' ? '가입일' : 'Member Since'}: {formatDate(joinDate)}
                  </div>
                </div>

                {/* Level Badge */}
                <div className="mx-auto mb-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                    <div className="text-sm opacity-80">{language === 'ko' ? '레벨' : 'Level'}</div>
                    <div className="text-2xl font-bold">{level}</div>
                  </div>
                </div>

                {/* Stats Preview */}
                <div className="mt-auto">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-xl font-bold">{stats.exhibitionsVisited}</div>
                      <div className="text-xs opacity-80">{language === 'ko' ? '전시' : 'Shows'}</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-xl font-bold">{stats.artworksViewed}</div>
                      <div className="text-xs opacity-80">{language === 'ko' ? '작품' : 'Works'}</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-xl font-bold">{stats.hoursSpent}</div>
                      <div className="text-xs opacity-80">{language === 'ko' ? '시간' : 'Hours'}</div>
                    </div>
                  </div>
                </div>

                {/* Flip Indicator */}
                <div className="absolute bottom-4 right-4 text-xs opacity-60">
                  {language === 'ko' ? '뒤집기 ▶' : 'Flip ▶'}
                </div>
              </div>
            </div>

            {/* Back Side */}
            <div 
              className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-2xl"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-400" />
              <div className="absolute inset-0 bg-black/20" />
              
              <div className="relative h-full p-8 flex flex-col text-white">
                <h3 className="text-2xl font-bold mb-6 text-center">
                  {language === 'ko' ? '나의 예술 여정' : 'My Art Journey'}
                </h3>

                {/* Detailed Stats */}
                <div className="space-y-4 mb-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="opacity-80">{language === 'ko' ? '방문한 전시' : 'Exhibitions Visited'}</span>
                      <span className="text-xl font-bold">{stats.exhibitionsVisited}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="opacity-80">{language === 'ko' ? '감상한 작품' : 'Artworks Viewed'}</span>
                      <span className="text-xl font-bold">{stats.artworksViewed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="opacity-80">{language === 'ko' ? '미술관 체류 시간' : 'Time in Museums'}</span>
                      <span className="text-xl font-bold">{stats.hoursSpent}h</span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                {badges.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3">
                      {language === 'ko' ? '획득한 배지' : 'Earned Badges'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {badges.map((badge, index) => (
                        <span 
                          key={index}
                          className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quote */}
                <div className="mt-auto text-center">
                  <p className="text-sm italic opacity-80">
                    {language === 'ko' 
                      ? '"예술은 당신과 함께 성장합니다"' 
                      : '"Art grows with you"'
                    }
                  </p>
                  <p className="text-xs mt-2 opacity-60">- SAYU</p>
                </div>

                {/* Flip Indicator */}
                <div className="absolute bottom-4 left-4 text-xs opacity-60">
                  {language === 'ko' ? '◀ 뒤집기' : '◀ Flip'}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Share Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          disabled={isSharing}
          className="mt-6 w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full py-3 px-6 font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow disabled:opacity-50"
        >
          {isSharing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              {language === 'ko' ? '저장 중...' : 'Saving...'}
            </>
          ) : (
            <>
              <span>📸</span>
              {language === 'ko' ? 'Instagram에 공유하기' : 'Share on Instagram'}
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
    'LAEF': '🎨',
    'LAEC': '🏛️',
    'LSEF': '🌟',
    'LSEC': '📚',
    'LREF': '🔍',
    'LREC': '🧩',
    'LMEF': '💭',
    'LMEC': '🎭',
    'SAEF': '🎪',
    'SAEC': '🎨',
    'SSEF': '👥',
    'SSEC': '🤝',
    'SREF': '💡',
    'SREC': '📊',
    'SMEF': '🌈',
    'SMEC': '🎯'
  };
  
  return emojiMap[type] || '✨';
}