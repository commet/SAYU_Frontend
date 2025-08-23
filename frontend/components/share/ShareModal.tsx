'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, Check, Instagram, Facebook } from 'lucide-react';
// html2canvas will be dynamically imported when download is triggered
import { useLanguage } from '@/contexts/LanguageContext';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { personalityAnimals } from '@/data/personality-animals';
import { personalityGradients, getGradientStyle } from '@/constants/personality-gradients';
import PersonalityIconFixed from '@/components/PersonalityIconFixed';
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
  const hiddenCardRef = useRef<HTMLDivElement>(null);
  
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
    // hiddenCardRef를 사용해서 실제 크기로 렌더링된 카드를 캡처
    const targetRef = hiddenCardRef.current || shareCardRef.current;
    if (!targetRef) return;

    try {
      // Dynamic import to reduce initial bundle size
      const { default: html2canvas } = await import('html2canvas');
      
      // 실제 크기 엘리먼트를 캡처
      const canvas = await html2canvas(targetRef, {
        scale: 1, // 1:1 스케일로 캡처
        backgroundColor: null,
        useCORS: true,
        logging: false,
        allowTaint: true,
        foreignObjectRendering: true
      });
      
      // 모바일 체크
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // 모바일에서는 data URL 사용
        const dataUrl = canvas.toDataURL('image/png');
        
        // iOS Safari 대응
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
          // iOS에서는 새 창으로 열기
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(`
              <html>
                <head>
                  <title>SAYU Art Persona</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body { margin: 0; padding: 20px; background: #f3f4f6; display: flex; flex-direction: column; align-items: center; }
                    img { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
                    p { font-family: system-ui; color: #374151; margin: 20px 0; text-align: center; }
                  </style>
                </head>
                <body>
                  <p>${language === 'ko' ? '이미지를 길게 눌러 저장하세요 📸' : 'Long press the image to save 📸'}</p>
                  <img src="${dataUrl}" alt="SAYU Art Persona">
                </body>
              </html>
            `);
            newWindow.document.close();
          }
        } else {
          // Android 등 다른 모바일 브라우저
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `sayu-${personalityType}-${shareFormat}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          // 성공 메시지
          const message = language === 'ko' 
            ? '다운로드 폴더를 확인하세요 📸'
            : 'Check your downloads folder 📸';
          
          showToast(message, 'success');
        }
      } else {
        // 데스크톱에서 처리
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `sayu-${personalityType}-${shareFormat}.png`;
        a.click();
        
        // 성공 메시지
        const message = language === 'ko' 
          ? '이미지가 저장되었습니다! 📸'
          : 'Image saved successfully! 📸';
        
        showToast(message, 'success');
      }
    } catch (error) {
      console.error('Error creating image:', error);
      
      // 에러 메시지 표시
      const message = language === 'ko' 
        ? '이미지 저장에 실패했습니다. 다시 시도해주세요.'
        : 'Failed to save image. Please try again.';
      
      showToast(message, 'error');
    }
  };

  const handleInstagramShare = async () => {
    const targetRef = hiddenCardRef.current || shareCardRef.current;
    if (!targetRef) return;

    try {
      // 모바일 체크
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // Dynamic import to reduce initial bundle size
      const { default: html2canvas } = await import('html2canvas');
      
      // 실제 크기 엘리먼트를 캡처
      const canvas = await html2canvas(targetRef, {
        scale: 1,
        backgroundColor: null,
        useCORS: true,
        logging: false,
        allowTaint: true,
        foreignObjectRendering: true
      });

      // 먼저 텍스트를 클립보드에 복사
      const fullText = shareText + '\n\n' + shareUrl;
      let textCopied = false;
      
      try {
        await navigator.clipboard.writeText(fullText);
        textCopied = true;
      } catch (clipboardError) {
        console.error('Clipboard write failed:', clipboardError);
      }

      // 모바일에서 처리
      if (isMobile) {
        const dataUrl = canvas.toDataURL('image/png');
        
        // iOS Safari 대응
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
          // iOS에서는 새 창으로 이미지 열기
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(`
              <html>
                <head>
                  <title>SAYU Art Persona - Instagram Share</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body { margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; flex-direction: column; align-items: center; }
                    img { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
                    .message { font-family: system-ui; color: white; margin: 20px; text-align: center; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; }
                  </style>
                </head>
                <body>
                  <div class="message">
                    ${language === 'ko' 
                      ? `📸 이미지를 길게 눌러 저장한 후<br>인스타그램에서 공유하세요!${textCopied ? '<br>✅ 텍스트가 복사되었습니다' : ''}`
                      : `📸 Long press to save image<br>then share on Instagram!${textCopied ? '<br>✅ Text copied' : ''}`
                    }
                  </div>
                  <img src="${dataUrl}" alt="SAYU Art Persona">
                </body>
              </html>
            `);
            newWindow.document.close();
            
            // 인스타그램 앱 열기 시도 (딥링크)
            setTimeout(() => {
              window.location.href = 'instagram://';
            }, 2000);
          }
        } else {
          // Android 등 다른 모바일 브라우저
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `sayu-${personalityType}-instagram-${shareFormat}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          // 인스타그램 앱 열기 시도
          setTimeout(() => {
            window.location.href = 'instagram://';
          }, 1000);
          
          // 성공 메시지
          const message = language === 'ko' 
            ? `이미지가 다운로드되었습니다!${textCopied ? '\n텍스트가 복사되었습니다.' : ''}\n인스타그램에서 공유하세요 📸`
            : `Image downloaded!${textCopied ? '\nText copied.' : ''}\nShare on Instagram 📸`;
          
          showToast(message, 'instagram');
        }
      } else {
        // 데스크톱에서 처리
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `sayu-${personalityType}-instagram-${shareFormat}.png`;
        a.click();
        
        // 모달 표시
        showInstagramModal(fullText, textCopied);
      }
    } catch (error) {
      console.error('Error creating image:', error);
      showToast(
        language === 'ko' ? '공유 준비 중 오류가 발생했습니다.' : 'Error preparing share.',
        'error'
      );
    }
  };

  const handleFacebookShare = () => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    const shareUrlFormatted = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
    window.open(shareUrlFormatted, '_blank', 'width=600,height=400');
  };

  // 토스트 메시지 표시 함수
  const showToast = (message: string, type: 'success' | 'error' | 'instagram' = 'success') => {
    const toast = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-500' : 
                    type === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 
                    'bg-green-500';
    
    toast.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-[200] transition-opacity max-w-[90%] text-center`;
    toast.innerHTML = message.replace(/\n/g, '<br>');
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, type === 'instagram' ? 5000 : 3000);
  };

  // 인스타그램 모달 표시 함수
  const showInstagramModal = (fullText: string, textCopied: boolean) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900">${language === 'ko' ? '인스타그램 공유 준비 완료!' : 'Ready to Share on Instagram!'}</h3>
        </div>
        <div class="space-y-3">
          <p class="text-gray-600">${language === 'ko' ? '✅ 이미지가 다운로드되었습니다' : '✅ Image downloaded'}</p>
          ${textCopied ? `<p class="text-gray-600">${language === 'ko' ? '✅ 텍스트가 클립보드에 복사되었습니다' : '✅ Text copied to clipboard'}</p>` : ''}
          <div class="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
            <p class="text-sm text-gray-700 whitespace-pre-wrap">${fullText}</p>
          </div>
        </div>
        <button onclick="this.closest('.fixed').remove()" class="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all">
          ${language === 'ko' ? '확인' : 'Got it'}
        </button>
      </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  };

  // 실제 크기의 공유 카드 컴포넌트
  const ShareCard = ({ isHidden = false }: { isHidden?: boolean }) => {
    const actualWidth = shareFormat === 'story' ? 1080 : 1080;
    const actualHeight = shareFormat === 'story' ? 1920 : shareFormat === 'feed' ? 1080 : 1350;
    
    // 텍스트 크기 스케일 팩터
    const scaleFactor = isHidden ? 6 : 1;
    
    return (
      <div
        ref={isHidden ? hiddenCardRef : shareCardRef}
        className={`rounded-2xl overflow-hidden shadow-xl relative ${isHidden ? 'absolute -left-[9999px]' : ''}`}
        style={{
          width: isHidden ? `${actualWidth}px` : shareFormat === 'story' ? '180px' : '180px',
          height: isHidden ? `${actualHeight}px` : shareFormat === 'story' ? '320px' : shareFormat === 'feed' ? '180px' : '225px',
          backgroundImage: `url(${masterpiece.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: isHidden ? 'none' : 'scale(1)',
          transformOrigin: 'center'
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        
        <div className={`relative z-10 h-full text-white flex flex-col justify-between`}
          style={{
            padding: isHidden ? 
              (shareFormat === 'story' ? '24px' : '18px') : 
              (shareFormat === 'story' ? '16px' : '12px')
          }}
        >
          {/* Top Section */}
          <div className="text-center">
            {shareFormat === 'story' ? (
              <>
                <div className="mb-2 flex justify-center items-center">
                  <PersonalityIconFixed
                    type={personalityType}
                    size={isHidden ? "large" : "small"}
                    animated={false}
                  />
                </div>
                
                <div className="font-black tracking-wider" style={{ 
                  fontSize: isHidden ? '120px' : '20px',
                  textShadow: isHidden ? '8px 8px 16px rgba(0,0,0,0.9)' : '2px 2px 4px rgba(0,0,0,0.9)',
                  letterSpacing: isHidden ? '12px' : '2px',
                  marginBottom: isHidden ? '24px' : '4px'
                }}>
                  {personalityType}
                </div>
                
                <div className="font-bold" style={{ 
                  fontSize: isHidden ? '72px' : '12px',
                  textShadow: isHidden ? '6px 6px 12px rgba(0,0,0,0.8)' : '1px 1px 3px rgba(0,0,0,0.8)' 
                }}>
                  {language === 'ko' && personality?.title_ko ? personality.title_ko : personality?.title}
                </div>
                
                <div className="italic opacity-90" style={{ 
                  fontSize: isHidden ? '36px' : '6px',
                  textShadow: isHidden ? '4px 4px 8px rgba(0,0,0,0.8)' : '1px 1px 2px rgba(0,0,0,0.8)',
                  marginTop: isHidden ? '12px' : '2px',
                  padding: isHidden ? '0 48px' : '0 8px'
                }}>
                  "{language === 'ko' ? (personality?.subtitle_ko || personality?.subtitle || '') : (personality?.subtitle || '')}"
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2">
                  <PersonalityIconFixed
                    type={personalityType}
                    size={isHidden ? "medium" : "small"}
                    animated={false}
                  />
                  
                  <div className="text-left">
                    <div className="font-black tracking-wider" style={{ 
                      fontSize: isHidden ? (shareFormat === 'feed' ? '60px' : '80px') : (shareFormat === 'feed' ? '10px' : '13px'),
                      textShadow: isHidden ? '6px 6px 12px rgba(0,0,0,0.9)' : '2px 2px 4px rgba(0,0,0,0.9)',
                      letterSpacing: isHidden ? '6px' : '1px'
                    }}>
                      {personalityType}
                    </div>
                    
                    <div className="font-bold" style={{ 
                      fontSize: isHidden ? (shareFormat === 'feed' ? '48px' : '60px') : (shareFormat === 'feed' ? '8px' : '10px'),
                      textShadow: isHidden ? '4px 4px 8px rgba(0,0,0,0.8)' : '1px 1px 3px rgba(0,0,0,0.8)' 
                    }}>
                      {language === 'ko' && personality?.title_ko ? personality.title_ko : personality?.title}
                    </div>
                    
                    <div className="italic opacity-90" style={{ 
                      fontSize: isHidden ? '24px' : '4px',
                      textShadow: isHidden ? '3px 3px 6px rgba(0,0,0,0.8)' : '1px 1px 2px rgba(0,0,0,0.8)',
                      marginTop: isHidden ? '8px' : '1px'
                    }}>
                      "{language === 'ko' ? (personality?.subtitle_ko || personality?.subtitle || '') : (personality?.subtitle || '')}"
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Bottom Section */}
          <div className="text-center">
            <div style={{ 
              fontSize: isHidden ? (shareFormat === 'feed' ? '48px' : '60px') : (shareFormat === 'feed' ? '8px' : '10px'),
              fontWeight: 600,
              textShadow: isHidden ? '4px 4px 8px rgba(0,0,0,0.9)' : '2px 2px 4px rgba(0,0,0,0.9)',
              letterSpacing: isHidden ? '3px' : '0.5px',
              marginBottom: isHidden ? '12px' : '2px'
            }}>
              {language === 'ko' ? '나만의 예술 성격 발견하기' : 'Discover Your Art Personality'}
            </div>
            
            <div style={{ 
              fontSize: isHidden ? (shareFormat === 'feed' ? '48px' : '60px') : (shareFormat === 'feed' ? '8px' : '10px'),
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontWeight: 300,
              textShadow: isHidden ? '4px 4px 8px rgba(0,0,0,0.9)' : '2px 2px 4px rgba(0,0,0,0.9)',
              letterSpacing: '0.1em',
              opacity: 0.95
            }}>
              SAYU.MY
            </div>
          </div>
        </div>
      </div>
    );
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
                <ShareCard isHidden={false} />
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
        
        {/* Hidden full-size card for capture */}
        <ShareCard isHidden={true} />
      </div>
    </AnimatePresence>
  );
}