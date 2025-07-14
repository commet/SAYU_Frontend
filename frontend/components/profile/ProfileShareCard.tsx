'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, Copy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
// html2canvas will be dynamically imported when download is triggered
import toast from 'react-hot-toast';
import { personalityGradients, getGradientStyle } from '@/constants/personality-gradients';

interface ProfileShareCardProps {
  userInfo: {
    nickname?: string;
    email?: string;
    personalityType?: string | null;
    level: number;
    totalPoints: number;
    totalArtworks: number;
    visitStreak: number;
  };
}

export default function ProfileShareCard({ userInfo }: ProfileShareCardProps) {
  const { language } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      // Dynamic import to reduce initial bundle size
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `sayu-profile-${userInfo.nickname || 'user'}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success(language === 'ko' ? '이미지가 다운로드되었습니다' : 'Image downloaded');
    } catch (error) {
      toast.error(language === 'ko' ? '다운로드 실패' : 'Download failed');
    }
  };

  const handleShare = async () => {
    const shareText = language === 'ko' 
      ? `SAYU에서 나의 예술 여정을 확인해보세요! 🎨\n레벨 ${userInfo.level} | ${userInfo.totalArtworks}개 작품 감상`
      : `Check out my art journey on SAYU! 🎨\nLevel ${userInfo.level} | ${userInfo.totalArtworks} artworks viewed`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SAYU Profile',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText + '\n' + window.location.href);
      toast.success(language === 'ko' ? '링크가 복사되었습니다' : 'Link copied to clipboard');
    }
  };

  return (
    <div className="space-y-4">
      {/* Share Card */}
      <div 
        ref={cardRef}
        className="sayu-liquid-glass rounded-2xl p-8 relative overflow-hidden"
        style={{ minHeight: '400px' }}
      >
        {/* Background Pattern */}
        {userInfo.personalityType && (
          <div 
            className="absolute inset-0 opacity-20"
            style={{ 
              background: getGradientStyle(userInfo.personalityType as keyof typeof personalityGradients),
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 text-center space-y-6">
          {/* Logo */}
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            SAYU
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold mx-auto">
              {userInfo.nickname?.[0] || userInfo.email?.[0] || 'U'}
            </div>
            
            <h3 className="text-2xl font-bold">{userInfo.nickname || userInfo.email}</h3>
            
            {userInfo.personalityType && (
              <div className="inline-block">
                <div 
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ 
                    background: getGradientStyle(userInfo.personalityType as keyof typeof personalityGradients),
                    color: 'white',
                  }}
                >
                  {userInfo.personalityType} • {personalityGradients[userInfo.personalityType as keyof typeof personalityGradients]?.nameEn}
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold">{userInfo.level}</p>
              <p className="text-sm opacity-70">{language === 'ko' ? '레벨' : 'Level'}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{userInfo.totalArtworks}</p>
              <p className="text-sm opacity-70">{language === 'ko' ? '작품' : 'Artworks'}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{userInfo.visitStreak}</p>
              <p className="text-sm opacity-70">{language === 'ko' ? '연속 방문' : 'Day Streak'}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{userInfo.totalPoints.toLocaleString()}</p>
              <p className="text-sm opacity-70">{language === 'ko' ? '포인트' : 'Points'}</p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm opacity-60">
            {language === 'ko' ? '나만의 예술 여정' : 'My Personal Art Journey'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          onClick={handleDownload}
          className="sayu-button flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className="w-5 h-5" />
          {language === 'ko' ? '이미지 저장' : 'Save Image'}
        </motion.button>

        <motion.button
          onClick={handleShare}
          className="sayu-button flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Share2 className="w-5 h-5" />
          {language === 'ko' ? '공유하기' : 'Share'}
        </motion.button>
      </div>
    </div>
  );
}