'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Download, Copy, Check, Instagram, Facebook, Twitter } from 'lucide-react';
// html2canvas will be dynamically imported when download is triggered
import { useLanguage } from '@/contexts/LanguageContext';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { personalityAnimals } from '@/data/personality-animals';
import { personalityGradients, getGradientStyle } from '@/constants/personality-gradients';
import { PersonalityAnimalImage } from '@/components/ui/PersonalityAnimalImage';

interface ShareModalProps {
  personalityType: string;
  userName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({
  personalityType,
  userName = 'SAYU Explorer',
  isOpen,
  onClose
}: ShareModalProps) {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [shareFormat, setShareFormat] = useState<'story' | 'feed' | 'card'>('story');
  const shareCardRef = useRef<HTMLDivElement>(null);
  
  const personality = personalityDescriptions[personalityType];
  const animal = personalityAnimals[personalityType];
  const gradientStyle = getGradientStyle(personalityType);

  const shareUrl = `https://sayu.vercel.app/results?type=${personalityType}`;
  
  // Enhanced share text with personality description
  const getShareText = () => {
    if (language === 'ko') {
      const title = personality?.title_ko || personality?.title || '미술 애호가';
      const subtitle = personality?.subtitle_ko || personality?.subtitle || '';
      const animalName = animal?.animal_ko || animal?.animal || '';
      
      return `🎨 나의 예술 성격: ${title} (${personalityType})
${subtitle}
내 동물 캐릭터는 ${animalName} ${animal?.emoji || ''}
당신의 예술 성격도 발견해보세요!`;
    } else {
      const title = personality?.title || 'Art Lover';
      const subtitle = personality?.subtitle || '';
      const animalName = animal?.animal || '';
      
      return `🎨 My Art Personality: ${title} (${personalityType})
${subtitle}
My animal character is ${animalName} ${animal?.emoji || ''}
Discover your art personality too!`;
    }
  };
  
  const shareText = getShareText();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SAYU - 나의 예술 성격',
          text: shareText,
          url: shareUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleImageShare = async () => {
    if (!shareCardRef.current) return;

    try {
      // Dynamic import to reduce initial bundle size
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 4,
        backgroundColor: null,
        useCORS: true,
        width: shareFormat === 'story' ? 1080 : shareFormat === 'feed' ? 1080 : 1080,
        height: shareFormat === 'story' ? 1920 : shareFormat === 'feed' ? 1080 : 1350
      });
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      if (navigator.share && navigator.canShare({ files: [new File([blob], 'art-personality.png', { type: 'image/png' })] })) {
        await navigator.share({
          title: shareText,
          files: [new File([blob], 'art-personality.png', { type: 'image/png' })]
        });
      } else {
        // Fallback to download
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `sayu-${personalityType}-${shareFormat}.png`;
        a.click();
      }
    } catch (error) {
      console.error('Error creating image:', error);
    }
  };

  const handlePlatformShare = (platform: string) => {
    let shareUrlFormatted = '';
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    switch (platform) {
      case 'twitter':
        shareUrlFormatted = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=SAYU,예술성격,ArtPersonality`;
        break;
      case 'facebook':
        shareUrlFormatted = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we'll provide instructions
        handleImageShare();
        return;
      default:
        return;
    }

    window.open(shareUrlFormatted, '_blank', 'width=600,height=400');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-3xl max-w-lg w-full max-h-[70vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'ko' ? '내 예술 페르소나 공유하기' : 'Share Your Art Persona'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-[calc(70vh-80px)] overflow-y-auto">
            {/* Share Format Selection */}
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-900">
                {language === 'ko' ? '공유 형식 선택' : 'Choose Share Format'}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {(['story', 'feed', 'card'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => setShareFormat(format)}
                    className={`p-2 rounded-xl border-2 transition-all ${
                      shareFormat === format
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xs font-medium capitalize">
                      {format === 'story' ? (language === 'ko' ? '스토리' : 'Story') :
                       format === 'feed' ? (language === 'ko' ? '피드' : 'Feed') :
                       (language === 'ko' ? '카드' : 'Card')}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {format === 'story' ? '9:16' :
                       format === 'feed' ? '1:1' :
                       '4:5'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-900">
                {language === 'ko' ? '미리보기' : 'Preview'}
              </h3>
              <div className="flex justify-center">
                <div
                  ref={shareCardRef}
                  className={`rounded-2xl overflow-hidden shadow-xl ${
                    shareFormat === 'story' ? 'w-[180px] h-[320px]' :
                    shareFormat === 'feed' ? 'w-[180px] h-[180px]' :
                    'w-[180px] h-[225px]'
                  }`}
                  style={{ background: gradientStyle }}
                >
                  <div className={`h-full text-white flex flex-col justify-between ${
                    shareFormat === 'story' ? 'p-4' : 
                    shareFormat === 'feed' ? 'p-3' : 'p-3'
                  }`}>
                    {/* Top Section */}
                    <div className="text-center">
                      <div className="mb-1 flex justify-center">
                        {animal ? (
                          <PersonalityAnimalImage 
                            animal={animal} 
                            variant="illustration"
                            size="sm"
                            showFallback={true}
                            className={`object-contain drop-shadow-lg ${
                              shareFormat === 'feed' ? 'w-8 h-8' : 'w-12 h-12'
                            }`}
                          />
                        ) : (
                          <div className={`drop-shadow-lg ${
                            shareFormat === 'feed' ? 'text-xl' : 'text-2xl'
                          }`}>{animal?.emoji}</div>
                        )}
                      </div>
                      <div className="inline-block bg-white/15 backdrop-blur-sm px-3 py-2 border border-white/20">
                        <div className={`font-mono font-bold leading-tight ${
                          shareFormat === 'feed' ? 'text-sm' : shareFormat === 'story' ? 'text-lg' : 'text-base'
                        }`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>{personalityType}</div>
                        <div className={`font-medium leading-tight ${
                          shareFormat === 'feed' ? 'text-[10px]' : shareFormat === 'story' ? 'text-sm' : 'text-xs'
                        }`} style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                          {language === 'ko' && personality?.title_ko ? personality.title_ko : personality?.title}
                        </div>
                      </div>
                    </div>
                    
                    {/* Middle Section */}
                    <div className="text-center flex-1 flex flex-col justify-center mt-2">
                      {shareFormat === 'story' && (
                        <div className="text-xs leading-tight px-2" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                          {language === 'ko' 
                            ? `"예술 속 감정을 ${personality?.strengths?.[0]?.title_ko === '감정적 건축' ? '건축물처럼 설계하는' : 
                               personality?.strengths?.[0]?.title_ko === '미세한 감수성' ? '섬세하게 포착하는' :
                               personality?.strengths?.[0]?.title_ko === '직관적 연결' ? '직관으로 연결하는' :
                               personality?.strengths?.[0]?.title_ko === '기술적 숙달' ? '해부하듯 분석하는' :
                               personality?.strengths?.[0]?.title_ko === '패턴 인식' ? '패턴으로 읽어내는' :
                               '깊이 있게 탐구하는'} 예술 애호가"` 
                            : `"An art lover who ${personality?.strengths?.[0]?.title === 'Emotional Architecture' ? 'architects emotions' :
                               personality?.strengths?.[0]?.title === 'Micro Sensitivity' ? 'feels every detail' :
                               personality?.strengths?.[0]?.title === 'Intuitive Connection' ? 'connects intuitively' :
                               personality?.strengths?.[0]?.title === 'Technical Mastery' ? 'analyzes deeply' :
                               personality?.strengths?.[0]?.title === 'Pattern Recognition' ? 'reads patterns' :
                               'explores deeply'}"`
                          }
                        </div>
                      )}
                      {shareFormat === 'feed' && (
                        <div className="text-[10px] leading-tight px-1" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                          {language === 'ko' 
                            ? `"예술 속 감정을 ${personality?.strengths?.[0]?.title_ko === '감정적 건축' ? '건축물처럼 설계하는' : 
                               personality?.strengths?.[0]?.title_ko === '미세한 감수성' ? '섬세하게 포착하는' :
                               personality?.strengths?.[0]?.title_ko === '직관적 연결' ? '직관으로 연결하는' :
                               personality?.strengths?.[0]?.title_ko === '기술적 숙달' ? '해부하듯 분석하는' :
                               personality?.strengths?.[0]?.title_ko === '패턴 인식' ? '패턴으로 읽어내는' :
                               '깊이 있게 탐구하는'} 예술 애호가"` 
                            : `"An art lover who ${personality?.strengths?.[0]?.title === 'Emotional Architecture' ? 'architects emotions' :
                               personality?.strengths?.[0]?.title === 'Micro Sensitivity' ? 'feels every detail' :
                               personality?.strengths?.[0]?.title === 'Intuitive Connection' ? 'connects intuitively' :
                               personality?.strengths?.[0]?.title === 'Technical Mastery' ? 'analyzes deeply' :
                               personality?.strengths?.[0]?.title === 'Pattern Recognition' ? 'reads patterns' :
                               'explores deeply'}"`
                          }
                        </div>
                      )}
                    </div>
                    
                    {/* Bottom Section */}
                    <div className="text-center">
                      <div className="pt-3 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                        <div className={`font-medium px-1 ${
                          shareFormat === 'feed' ? 'text-[10px]' : 'text-xs'
                        }`} style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                          {language === 'ko' ? (
                            shareFormat === 'feed' ? '예술 페르소나 발견하기' : '예술 페르소나 발견하기'
                          ) : (
                            'Find your art persona'
                          )}
                        </div>
                        <div className={`font-medium mt-1 ${
                          shareFormat === 'feed' ? 'text-[10px]' : 'text-xs'
                        }`} style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                          SAYU.MY
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Options */}
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-900">
                {language === 'ko' ? '공유 방법' : 'Share Options'}
              </h3>
              
              {/* Platform Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => handlePlatformShare('instagram')}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <Instagram className="w-5 h-5" />
                  <span>{language === 'ko' ? '인스타그램' : 'Instagram'}</span>
                </button>
                
                <button
                  onClick={() => handlePlatformShare('twitter')}
                  className="flex items-center gap-3 p-4 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all"
                >
                  <Twitter className="w-5 h-5" />
                  <span>{language === 'ko' ? '트위터' : 'Twitter'}</span>
                </button>
                
                <button
                  onClick={() => handlePlatformShare('facebook')}
                  className="flex items-center gap-3 p-4 rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition-all"
                >
                  <Facebook className="w-5 h-5" />
                  <span>{language === 'ko' ? '페이스북' : 'Facebook'}</span>
                </button>
                
                <button
                  onClick={handleImageShare}
                  className="flex items-center gap-3 p-4 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all"
                >
                  <Download className="w-5 h-5" />
                  <span>{language === 'ko' ? '이미지 저장' : 'Save Image'}</span>
                </button>
              </div>

              {/* Native Share and Copy Link */}
              <div className="grid grid-cols-2 gap-3">
                {navigator.share && (
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center gap-3 p-4 rounded-xl bg-gray-100 text-gray-900 hover:bg-gray-200 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>{language === 'ko' ? '시스템 공유' : 'System Share'}</span>
                  </button>
                )}
                
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gray-100 text-gray-900 hover:bg-gray-200 transition-all"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  <span className={copied ? 'text-green-500' : ''}>
                    {copied 
                      ? (language === 'ko' ? '복사됨!' : 'Copied!') 
                      : (language === 'ko' ? '링크 복사' : 'Copy Link')
                    }
                  </span>
                </button>
              </div>
            </div>

            {/* Share Text Preview */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {language === 'ko' ? '공유될 텍스트' : 'Share Text'}
              </h4>
              <p className="text-sm text-gray-600">{shareText}</p>
              <p className="text-xs text-gray-400 mt-1">{shareUrl}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}