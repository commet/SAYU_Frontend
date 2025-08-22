'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, Check, Instagram, Facebook } from 'lucide-react';
// html2canvas will be dynamically imported when download is triggered
import { useLanguage } from '@/contexts/LanguageContext';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { personalityAnimals } from '@/data/personality-animals';
import { personalityGradients, getGradientStyle } from '@/constants/personality-gradients';
import { PersonalityAnimalImageRobust } from '@/components/ui/PersonalityAnimalImageRobust';
import { getMasterpieceForAnyPersonality } from '@/data/personality-masterpieces';
import { completeChemistryMatrix } from '@/data/chemistry-matrix';
import { realExhibitionRecommendations } from '@/data/real-exhibition-recommendations';

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
  const masterpiece = getMasterpieceForAnyPersonality(personalityType);
  
  // 함께 전시 가면 좋은 유형들 찾기 (platinum, gold 레벨)
  const goodMatches = completeChemistryMatrix
    .filter(chem => 
      (chem.type1 === personalityType || chem.type2 === personalityType) &&
      (chem.compatibility === 'platinum' || chem.compatibility === 'gold')
    )
    .slice(0, 3)
    .map(chem => {
      const partnerType = chem.type1 === personalityType ? chem.type2 : chem.type1;
      const partnerAnimal = personalityAnimals[partnerType];
      const partnerPersonality = personalityDescriptions[partnerType];
      return {
        type: partnerType,
        emoji: partnerAnimal?.emoji || '🎨',
        name_ko: partnerPersonality?.title_ko || partnerType,
        name: partnerPersonality?.title || partnerType
      };
    });
  
  // 실제 전시 추천 가져오기
  const realExhibition = realExhibitionRecommendations[personalityType];
  const exhibitionRec = realExhibition ? 
    (language === 'ko' ? realExhibition.title_ko : realExhibition.title_en) : 
    (language === 'ko' ? '현대 미술전' : 'Contemporary Art');
  const exhibitionMuseum = realExhibition ?
    (language === 'ko' ? realExhibition.museum_ko : realExhibition.museum_en) :
    '';

  const shareUrl = `https://sayu.my/results?type=${personalityType}`;
  
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

  const handleSaveImage = async () => {
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
      
      // Download the image
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `sayu-${personalityType}-${shareFormat}.png`;
      a.click();
    } catch (error) {
      console.error('Error creating image:', error);
    }
  };

  const handleInstagramShare = async () => {
    if (!shareCardRef.current) return;

    try {
      // 모바일 체크
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
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

      // 모바일에서 Web Share API 사용
      if (isMobile && navigator.share && navigator.canShare) {
        const file = new File([blob], 'sayu-art-persona.png', { type: 'image/png' });
        
        // 이미지를 공유할 수 있는지 확인
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'SAYU Art Persona',
              text: shareText + '\n\n' + shareUrl,
              files: [file]
            });
            return; // 공유 성공
          } catch (error) {
            // 사용자가 취소한 경우는 무시
            if ((error as Error).name !== 'AbortError') {
              console.error('Share failed:', error);
            }
          }
        }
      }

      // 데스크톱 또는 Web Share API를 사용할 수 없는 경우
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `sayu-${personalityType}-instagram-${shareFormat}.png`;
      a.click();

      // 클립보드에 텍스트 복사
      try {
        await navigator.clipboard.writeText(shareText + '\n\n' + shareUrl);
        
        // 토스트 메시지 표시 (alert 대신)
        const message = language === 'ko' 
          ? '이미지가 저장되고 텍스트가 복사되었습니다! 인스타그램에 공유해주세요 📸'
          : 'Image saved and text copied! Share on Instagram 📸';
        
        // 임시 토스트 메시지
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[200] transition-opacity';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => toast.remove(), 300);
        }, 3000);
        
      } catch (clipboardError) {
        console.error('Clipboard write failed:', clipboardError);
        alert(
          language === 'ko' 
          ? '이미지가 다운로드되었습니다! 다음 텍스트를 복사해서 사용하세요:\n\n' + shareText + '\n\n' + shareUrl
          : 'Image downloaded! Copy this text:\n\n' + shareText + '\n\n' + shareUrl
        );
      }
      
    } catch (error) {
      console.error('Error creating image:', error);
    }
  };

  const handleFacebookShare = () => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    const shareUrlFormatted = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
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
              <X className="w-4 h-4 text-gray-700" />
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
                    <div className={`text-xs font-medium capitalize ${
                      shareFormat === format ? 'text-blue-700' : 'text-gray-700'
                    }`}>
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
                  className={`rounded-2xl overflow-hidden shadow-xl relative ${
                    shareFormat === 'story' ? 'w-[180px] h-[320px]' :
                    shareFormat === 'feed' ? 'w-[180px] h-[180px]' :
                    'w-[180px] h-[225px]'
                  }`}
                  style={{
                    backgroundImage: `url(${masterpiece.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Dark overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
                  
                  <div className={`relative z-10 h-full text-white flex flex-col justify-between ${
                    shareFormat === 'story' ? 'p-4' : 
                    shareFormat === 'feed' ? 'p-3' : 'p-3'
                  }`}>
                    {/* Top Section - Minimalist */}
                    <div className="text-center">
                      {shareFormat === 'story' ? (
                        <>
                          {/* Story format - vertical layout */}
                          <div className="mb-3 -mt-1 flex justify-center items-center">
                            {animal?.image ? (
                              <div className="-ml-5 w-12 h-12">
                                <PersonalityAnimalImageRobust
                                  animal={animal}
                                  variant="avatar"
                                  size="sm"
                                  className="w-full h-full object-contain"
                                  showFallback={true}
                                />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center -ml-5 w-12 h-12 text-3xl">
                                <span className="drop-shadow-xl">{animal?.emoji || '🎨'}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="font-black tracking-wider text-2xl mb-1" style={{ 
                            textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                            letterSpacing: '2px'
                          }}>
                            {personalityType}
                          </div>
                          
                          <div className="font-bold text-base" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                            {language === 'ko' && personality?.title_ko ? personality.title_ko : personality?.title}
                          </div>
                          
                          <div className="italic opacity-90 px-3 text-[7px] mt-1" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                            "{language === 'ko' ? (personality?.subtitle_ko || personality?.subtitle || '') : (personality?.subtitle || '')}"
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Feed & Card format - horizontal layout */}
                          <div className="flex items-start gap-2 mb-1">
                            {/* Animal on the far left and higher - further reduced size for feed */}
                            <div className="-ml-2 -mt-1">
                              {animal?.image ? (
                                <div className={shareFormat === 'feed' ? 'w-5 h-5' : 'w-9 h-9'}>
                                  <PersonalityAnimalImageRobust
                                    animal={animal}
                                    variant="avatar"
                                    size="sm"
                                    className="w-full h-full object-contain"
                                    showFallback={true}
                                  />
                                </div>
                              ) : (
                                <div className={`flex items-center justify-center ${
                                  shareFormat === 'feed' ? 'w-5 h-5 text-base' : 'w-9 h-9 text-2xl'
                                }`}>
                                  <span className="drop-shadow-xl">{animal?.emoji || '🎨'}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Type and title aligned to the right - moved more to the right */}
                            <div className={`text-left ${shareFormat === 'feed' ? 'md:ml-8 ml-12' : 'md:ml-6 ml-10'}`}>
                              <div className={`font-black tracking-wider ${
                                shareFormat === 'feed' ? 'text-sm' : 'text-base'
                              }`} style={{ 
                                textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                                letterSpacing: '1px'
                              }}>
                                {personalityType}
                              </div>
                              
                              <div className={`font-bold ${
                                shareFormat === 'feed' ? 'text-[10px]' : 'text-xs'
                              }`} style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                {language === 'ko' && personality?.title_ko ? personality.title_ko : personality?.title}
                              </div>
                              
                              {/* Subtitle moved inside to align with other text */}
                              <div className={`italic opacity-90 mt-0.5 ${
                                shareFormat === 'feed' ? 'text-[5px]' : 'text-[5px]'
                              }`} style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                "{language === 'ko' ? (personality?.subtitle_ko || personality?.subtitle || '') : (personality?.subtitle || '')}"
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Middle Section - Enhanced with compatibility info */}
                    <div className="text-center flex-1 flex flex-col justify-center mt-1">
                      {shareFormat === 'story' && (
                        <div>
                          {/* Recommended exhibition - moved to top */}
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
                            <div className={`text-[10px] font-semibold mb-0.5 opacity-90`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                              {language === 'ko' ? '✨ 추천 전시' : '✨ Recommended'}
                            </div>
                            <div className="text-[8px] leading-tight opacity-80" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                              <div className="font-medium truncate">{exhibitionRec}</div>
                              {exhibitionMuseum && (
                                <div className="text-[7px] opacity-70">{exhibitionMuseum}</div>
                              )}
                            </div>
                          </div>
                          
                          {/* Good match types - moved to bottom */}
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 mt-0.5">
                            <div className={`text-[10px] font-semibold mb-0.5 opacity-90`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                              {language === 'ko' ? '🤝 함께 가면 좋은 유형' : '🤝 Good Match Types'}
                            </div>
                            <div className="flex justify-center gap-2">
                              {goodMatches.map((match, idx) => (
                                <div key={idx} className="text-center">
                                  <div className="text-base">{match.emoji}</div>
                                  <div className="text-[7px] mt-0 opacity-80" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                                    {language === 'ko' ? match.name_ko : match.name}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                        </div>
                      )}
                      {shareFormat === 'feed' && (
                        <div>
                          {/* Recommended exhibition - compact */}
                          <div className="bg-white/10 backdrop-blur-sm rounded px-1.5 py-0.5">
                            <div className={`text-[8px] font-semibold opacity-90`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                              {language === 'ko' ? '✨ 추천' : '✨ Rec'}
                            </div>
                            <div className="text-[7px] leading-tight opacity-80 truncate" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                              {exhibitionRec}
                            </div>
                          </div>
                          
                          {/* Good matches - very compact with names */}
                          <div className="bg-white/10 backdrop-blur-sm rounded px-1.5 py-0.5 mt-0.5">
                            <div className="text-[8px] font-semibold opacity-90" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                              {language === 'ko' ? '🤝 함께' : '🤝 With'}
                            </div>
                            <div className="flex justify-center gap-1">
                              {goodMatches.slice(0, 3).map((match, idx) => (
                                <div key={idx} className="text-center">
                                  <div className="text-xs">{match.emoji}</div>
                                  <div className="text-[5px] opacity-70" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                                    {match.type}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {shareFormat === 'card' && (
                        <div>
                          {/* Recommended exhibition - medium size */}
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
                            <div className={`text-[9px] font-semibold mb-0.5 opacity-90`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                              {language === 'ko' ? '✨ 추천 전시' : '✨ Recommended'}
                            </div>
                            <div className="text-[7px] leading-tight opacity-80" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                              <div className="font-medium truncate">{exhibitionRec}</div>
                              {exhibitionMuseum && (
                                <div className="text-[6px] opacity-70">{exhibitionMuseum}</div>
                              )}
                            </div>
                          </div>
                          
                          {/* Good matches - medium compact */}
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 mt-0.5">
                            <div className="text-[9px] font-semibold mb-0.5 opacity-90" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                              {language === 'ko' ? '🤝 함께 가면 좋은 유형' : '🤝 Good Matches'}
                            </div>
                            <div className="flex justify-center gap-1.5">
                              {goodMatches.slice(0, 3).map((match, idx) => (
                                <div key={idx} className="text-center">
                                  <div className="text-sm">{match.emoji}</div>
                                  <div className="text-[6px] mt-0 opacity-80" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                                    {language === 'ko' ? match.name_ko : match.name}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Bottom Section - Minimal branding */}
                    <div className="text-center mt-2">
                      {/* Masterpiece title and artist - single line format */}
                      <div className={`opacity-50 mb-0.5 ${
                        shareFormat === 'feed' ? 'text-[5px]' : shareFormat === 'story' ? 'text-[6px]' : 'text-[5px]'
                      }`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)', lineHeight: '1.1' }}>
                        <div className="italic">
                          {language === 'ko' 
                            ? `${masterpiece.title_ko} - ${masterpiece.artist_ko}`
                            : `${masterpiece.title} - ${masterpiece.artist}`
                          }
                        </div>
                      </div>
                      
                      <div className="pt-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        {/* Clean call-to-action */}
                        <div className={`font-semibold px-1 mb-0.5 ${
                          shareFormat === 'feed' ? 'text-[10px]' : shareFormat === 'story' ? 'text-xs' : 'text-[11px]'
                        }`} style={{ 
                          textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                          letterSpacing: '0.5px'
                        }}>
                          {language === 'ko' ? '나만의 예술 성격 발견하기' : 'Discover Your Art Personality'}
                        </div>
                        
                        {/* Brand mark */}
                        <div className={`${
                          shareFormat === 'feed' ? 'text-[10px]' : shareFormat === 'story' ? 'text-xs' : 'text-[10px]'
                        }`} style={{ 
                          fontFamily: 'var(--font-cormorant), Georgia, serif',
                          fontWeight: 300,
                          textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                          letterSpacing: '0.1em',
                          opacity: 0.95
                        }}>
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
                  onClick={handleInstagramShare}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <Instagram className="w-5 h-5" />
                  <span>{language === 'ko' ? '인스타그램' : 'Instagram'}</span>
                </button>
                
                <button
                  onClick={handleFacebookShare}
                  className="flex items-center gap-3 p-4 rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition-all"
                >
                  <Facebook className="w-5 h-5" />
                  <span>{language === 'ko' ? '페이스북' : 'Facebook'}</span>
                </button>
                
                <button
                  onClick={handleSaveImage}
                  className="flex items-center gap-3 p-4 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all"
                >
                  <Download className="w-5 h-5" />
                  <span>{language === 'ko' ? '이미지 저장' : 'Save Image'}</span>
                </button>
                
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