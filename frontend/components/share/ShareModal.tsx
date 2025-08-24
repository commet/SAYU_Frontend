'use client';

import { useState, useRef } from 'react';
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
  const fullSizeShareCardRef = useRef<HTMLDivElement>(null);
  
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
    // Use full-size card for capture
    const elementToCapture = fullSizeShareCardRef.current || shareCardRef.current;
    if (!elementToCapture) return;

    try {
      // Dynamic import to reduce initial bundle size
      const { default: html2canvas } = await import('html2canvas');
      
      // html2canvas 설정 개선 - width/height 옵션 제거
      const canvas = await html2canvas(elementToCapture, {
        scale: 2, // 적절한 해상도를 위해 2로 설정
        backgroundColor: '#000000', // 투명 대신 검은색 배경
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      // 모바일 체크
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // 모바일에서 처리
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/png');
        });
        
        // Web Share API를 사용할 수 있는 경우
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], `sayu-${personalityType}-${shareFormat}.png`, { type: 'image/png' });
          
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: 'SAYU Art Persona',
                text: language === 'ko' ? '내 예술 페르소나' : 'My Art Persona'
              });
              
              // 성공 토스트
              const message = language === 'ko' 
                ? '이미지가 저장되었습니다! 📸'
                : 'Image saved successfully! 📸';
              
              const toast = document.createElement('div');
              toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[200] transition-opacity';
              toast.textContent = message;
              document.body.appendChild(toast);
              
              setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
              }, 3000);
              
              return;
            } catch (error) {
              if ((error as Error).name === 'AbortError') {
                // 사용자가 취소한 경우는 무시
                return;
              }
              console.error('Share failed:', error);
            }
          }
        }
        
        // Web Share API를 사용할 수 없는 경우 - data URL 사용 (모바일)
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `sayu-${personalityType}-${shareFormat}.png`;
        
        // iOS Safari 대응
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
          // iOS에서는 새 창으로 열기 (data URL 사용)
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
          
          // 안내 메시지
          const message = language === 'ko' 
            ? '이미지를 길게 눌러 저장하세요 📸'
            : 'Long press the image to save 📸';
          
          const toast = document.createElement('div');
          toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-[200] transition-opacity';
          toast.textContent = message;
          document.body.appendChild(toast);
          
          setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
          }, 5000);
        } else {
          // Android 등 다른 모바일 브라우저
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          // 성공 메시지
          const message = language === 'ko' 
            ? '다운로드 폴더를 확인하세요 📸'
            : 'Check your downloads folder 📸';
          
          const toast = document.createElement('div');
          toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[200] transition-opacity';
          toast.textContent = message;
          document.body.appendChild(toast);
          
          setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
          }, 3000);
        }
        
        // 정리 작업 없음 (data URL 사용)
        
      } else {
        // 데스크톱에서 처리 (기존 방식)
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `sayu-${personalityType}-${shareFormat}.png`;
        a.click();
        
        // 성공 메시지
        const message = language === 'ko' 
          ? '이미지가 저장되었습니다! 📸'
          : 'Image saved successfully! 📸';
        
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[200] transition-opacity';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => toast.remove(), 300);
        }, 3000);
      }
    } catch (error) {
      console.error('Error creating image:', error);
      
      // 에러 메시지 표시
      const message = language === 'ko' 
        ? '이미지 저장에 실패했습니다. 다시 시도해주세요.'
        : 'Failed to save image. Please try again.';
      
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[200] transition-opacity';
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  };

  const handleInstagramShare = async () => {
    // Use full-size card for capture
    const elementToCapture = fullSizeShareCardRef.current || shareCardRef.current;
    if (!elementToCapture) return;

    try {
      // 모바일 체크
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // Dynamic import to reduce initial bundle size
      const { default: html2canvas } = await import('html2canvas');
      
      // html2canvas 설정 개선 - width/height 옵션 제거
      const canvas = await html2canvas(elementToCapture, {
        scale: 2, // 적절한 해상도를 위해 2로 설정
        backgroundColor: '#000000', // 투명 대신 검은색 배경
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
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
        // Web Share API 시도
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], `sayu-${personalityType}-${shareFormat}.png`, { type: 'image/png' });
          
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: 'SAYU Art Persona',
                text: fullText
              });
              
              // 공유 성공 후 안내 메시지
              const message = language === 'ko' 
                ? '인스타그램을 선택해서 공유하세요! 텍스트가 복사되었습니다 📸'
                : 'Select Instagram to share! Text copied to clipboard 📸';
              
              const toast = document.createElement('div');
              toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg shadow-lg z-[200] transition-opacity';
              toast.textContent = message;
              document.body.appendChild(toast);
              
              setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
              }, 4000);
              
              return;
            } catch (error) {
              if ((error as Error).name === 'AbortError') {
                // 사용자가 취소한 경우
                return;
              }
              console.error('Share failed:', error);
            }
          }
        }
        
        // Web Share API를 사용할 수 없는 경우 - 이미지 저장 후 인스타그램 앱 열기 시도
        const dataUrl = canvas.toDataURL('image/png');
        
        // iOS Safari 대응
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
          // iOS에서는 새 창으로 이미지 열기 (data URL 사용)
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
          }
          
          // 인스타그램 앱 열기 시도 (딥링크)
          setTimeout(() => {
            window.location.href = 'instagram://';
          }, 1500);
          
          // 안내 메시지
          const message = language === 'ko' 
            ? `이미지를 길게 눌러 저장한 후 인스타그램에서 공유하세요!${textCopied ? '\n텍스트가 복사되었습니다 📸' : ''}`
            : `Long press to save image, then share on Instagram!${textCopied ? '\nText copied 📸' : ''}`;
          
          const toast = document.createElement('div');
          toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-lg shadow-lg z-[200] transition-opacity max-w-[90%] text-center';
          toast.innerHTML = message.replace('\n', '<br>');
          document.body.appendChild(toast);
          
          setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
          }, 6000);
        } else {
          // Android 등 다른 모바일 브라우저
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `sayu-${personalityType}-instagram-${shareFormat}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          // 인스타그램 앱 열기 시도 (딥링크)
          setTimeout(() => {
            window.location.href = 'instagram://';
          }, 1000);
          
          // 성공 메시지
          const message = language === 'ko' 
            ? `이미지가 다운로드되었습니다!${textCopied ? '\n텍스트가 복사되었습니다.' : ''}\n인스타그램에서 공유하세요 📸`
            : `Image downloaded!${textCopied ? '\nText copied.' : ''}\nShare on Instagram 📸`;
          
          const toast = document.createElement('div');
          toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-lg shadow-lg z-[200] transition-opacity max-w-[90%] text-center';
          toast.innerHTML = message.replace(/\n/g, '<br>');
          document.body.appendChild(toast);
          
          setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
          }, 5000);
        }
        
        // 정리 작업 없음 (data URL 사용)
        
      } else {
        // 데스크톱에서 처리
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `sayu-${personalityType}-instagram-${shareFormat}.png`;
        a.click();
        
        // 메시지 표시
        let message: string;
        if (textCopied) {
          message = language === 'ko' 
            ? '이미지가 다운로드되었습니다! 다음 텍스트를 복사해서 사용하세요:\n' + fullText
            : 'Image downloaded! Copy this text:\n' + fullText;
        } else {
          message = language === 'ko' 
            ? '이미지가 저장되고 텍스트가 복사되었습니다!\n인스타그램에 공유해주세요 📸'
            : 'Image saved and text copied!\nShare on Instagram 📸';
        }
        
        // 모달 대신 더 나은 UI로 표시
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
        
        // 클릭하면 모달 닫기
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.remove();
          }
        });
      }
      
    } catch (error) {
      console.error('Error creating image:', error);
      
      // 에러 메시지
      const message = language === 'ko' 
        ? '공유 준비 중 오류가 발생했습니다. 다시 시도해주세요.'
        : 'Error preparing share. Please try again.';
      
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[200] transition-opacity';
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
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
                          <div className="mb-1 -mt-1 flex justify-center items-center">
                            <PersonalityIconFixed
                              type={personalityType}
                              size="small"
                              animated={false}
                            />
                          </div>
                          
                          <div className="font-black tracking-wider text-2xl mb-0" style={{ 
                            textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                            letterSpacing: '2px'
                          }}>
                            {personalityType}
                          </div>
                          
                          <div className="font-bold text-base" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                            {language === 'ko' && personality?.title_ko ? personality.title_ko : personality?.title}
                          </div>
                          
                          <div className="italic opacity-90 px-3 text-[7px] mt-0.5 whitespace-nowrap" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                            "{language === 'ko' ? (personality?.subtitle_ko || personality?.subtitle || '') : (personality?.subtitle || '')}"
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Feed & Card format - horizontal layout */}
                          <div className="flex items-start gap-1 mb-0">
                            {/* Animal on the far left */}
                            <div className="mt-1">
                              <PersonalityIconFixed
                                type={personalityType}
                                size="small"
                                animated={false}
                              />
                            </div>
                            
                            {/* Type and title next to animal */}
                            <div className="text-left mt-2">
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
                              
                              {/* Subtitle */}
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
                    <div className="text-center flex-1 flex flex-col justify-center mt-0">
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
                        <div className="flex gap-1">
                          {/* Recommended exhibition - left side */}
                          <div className="bg-white/10 backdrop-blur-sm rounded px-1.5 py-0.5 flex-1">
                            <div className={`text-[8px] font-semibold opacity-90`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                              {language === 'ko' ? '✨ 추천' : '✨ Rec'}
                            </div>
                            <div className="text-[6px] leading-tight opacity-80 truncate" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                              {exhibitionRec}
                            </div>
                          </div>
                          
                          {/* Good matches - right side */}
                          <div className="bg-white/10 backdrop-blur-sm rounded px-1.5 py-0.5 flex-1">
                            <div className="text-[8px] font-semibold opacity-90" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                              {language === 'ko' ? '🤝 함께' : '🤝 With'}
                            </div>
                            <div className="flex justify-center gap-1">
                              {goodMatches.slice(0, 2).map((match, idx) => (
                                <div key={idx} className="text-center">
                                  <div className="text-[10px]">{match.emoji}</div>
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
                      
                      <div className="pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        {/* Clean call-to-action */}
                        <div className={`font-semibold px-1 mb-0 ${
                          shareFormat === 'feed' ? 'text-[10px]' : shareFormat === 'story' ? 'text-[11px]' : 'text-[11px]'
                        }`} style={{ 
                          textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                          letterSpacing: '0.5px'
                        }}>
                          {language === 'ko' ? '나만의 예술 성격 발견하기' : 'Discover Your Art Personality'}
                        </div>
                        
                        {/* Brand mark */}
                        <div className={`${
                          shareFormat === 'feed' ? 'text-[10px]' : shareFormat === 'story' ? 'text-[11px]' : 'text-[10px]'
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
        
        {/* Hidden full-size share cards for actual download */}
        <div className="absolute -left-[9999px] -top-[9999px] pointer-events-none">
          <div
            ref={fullSizeShareCardRef}
            className={`overflow-hidden shadow-xl relative ${
              shareFormat === 'story' ? 'w-[1080px] h-[1920px]' :
              shareFormat === 'feed' ? 'w-[1080px] h-[1080px]' :
              'w-[1080px] h-[1350px]'
            }`}
            style={{
              backgroundImage: `url(${masterpiece.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
            
            <div className={`relative z-10 h-full text-white flex flex-col ${
              shareFormat === 'story' ? 'p-20 pt-32' : 
              shareFormat === 'feed' ? 'p-16' : 'p-16'
            }`}>
              {shareFormat === 'story' ? (
                <>
                  {/* Story format - 세로 레이아웃 */}
                  <div className="flex flex-col items-center text-center">
                    {/* 동물 캐릭터 - 크게 */}
                    <div className="mb-12 scale-[7]">
                      <PersonalityIconFixed
                        type={personalityType}
                        size="small"
                        animated={false}
                      />
                    </div>
                    
                    {/* LRMC - 크고 굵게 */}
                    <div className="font-black text-[140px] leading-none mb-8" style={{ 
                      textShadow: '4px 4px 10px rgba(0,0,0,0.9)',
                      letterSpacing: '12px'
                    }}>
                      {personalityType}
                    </div>
                    
                    {/* 체계적 연구자 */}
                    <div className="font-bold text-7xl mb-8" style={{ 
                      textShadow: '3px 3px 8px rgba(0,0,0,0.8)' 
                    }}>
                      {language === 'ko' && personality?.title_ko ? personality.title_ko : personality?.title}
                    </div>
                    
                    {/* 부제목 */}
                    <div className="italic text-4xl leading-relaxed px-16 mb-20 opacity-90" style={{ 
                      textShadow: '2px 2px 6px rgba(0,0,0,0.8)' 
                    }}>
                      "{language === 'ko' ? (personality?.subtitle_ko || personality?.subtitle || '') : (personality?.subtitle || '')}"
                    </div>
                  </div>
                  
                  {/* 중간 섹션 - 추천 전시와 함께 갈 유형 */}
                  <div className="flex-1 flex flex-col justify-center space-y-12">
                    {/* 추천 전시 */}
                    <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-10">
                      <div className="text-5xl mb-4">✨ {language === 'ko' ? '추천 전시' : 'Recommended'}</div>
                      <div className="text-4xl font-medium">{exhibitionRec}</div>
                      {exhibitionMuseum && (
                        <div className="text-3xl opacity-80 mt-2">{exhibitionMuseum}</div>
                      )}
                    </div>
                    
                    {/* 함께 가면 좋은 유형 */}
                    <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-10">
                      <div className="text-5xl mb-8">🤝 {language === 'ko' ? '함께 가면 좋은 유형' : 'Good Matches'}</div>
                      <div className="flex justify-center gap-12">
                        {goodMatches.map((match, idx) => (
                          <div key={idx} className="text-center">
                            <div className="text-7xl mb-3">{match.emoji}</div>
                            <div className="text-3xl">
                              {language === 'ko' ? match.name_ko : match.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* 하단 섹션 */}
                  <div className="text-center space-y-6">
                    <div className="text-3xl italic opacity-60">
                      {language === 'ko' 
                        ? `${masterpiece.title_ko} - ${masterpiece.artist_ko}`
                        : `${masterpiece.title} - ${masterpiece.artist}`
                      }
                    </div>
                    <div className="text-6xl font-bold" style={{ 
                      textShadow: '3px 3px 8px rgba(0,0,0,0.9)' 
                    }}>
                      {language === 'ko' ? '나만의 예술 성격 발견하기' : 'Discover Your Art Personality'}
                    </div>
                    <div className="text-5xl" style={{ 
                      fontFamily: 'var(--font-cormorant), Georgia, serif',
                      letterSpacing: '0.3em'
                    }}>
                      SAYU.MY
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Feed & Card format - 가로 레이아웃 */}
                  <div className="h-full flex flex-col">
                    {/* 상단 - 동물과 텍스트 */}
                    <div className="flex items-center gap-12 mb-16">
                      {/* 왼쪽 - 큰 동물 */}
                      <div className="scale-[6]" style={{ marginLeft: '60px' }}>
                        <PersonalityIconFixed
                          type={personalityType}
                          size="small"
                          animated={false}
                        />
                      </div>
                      
                      {/* 오른쪽 - 텍스트 */}
                      <div className="flex-1">
                        <div className="font-black text-8xl mb-4" style={{ 
                          textShadow: '4px 4px 10px rgba(0,0,0,0.9)',
                          letterSpacing: '6px'
                        }}>
                          {personalityType}
                        </div>
                        <div className="font-bold text-5xl mb-4" style={{ 
                          textShadow: '3px 3px 8px rgba(0,0,0,0.8)' 
                        }}>
                          {language === 'ko' && personality?.title_ko ? personality.title_ko : personality?.title}
                        </div>
                        <div className="italic text-3xl opacity-90" style={{ 
                          textShadow: '2px 2px 6px rgba(0,0,0,0.8)' 
                        }}>
                          "{language === 'ko' ? (personality?.subtitle_ko || personality?.subtitle || '') : (personality?.subtitle || '')}"
                        </div>
                      </div>
                    </div>
                    
                    {/* 중간 - 추천 정보 */}
                    <div className="flex-1 flex flex-col justify-center space-y-10">
                      {/* 추천 전시 */}
                      <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8">
                        <div className="text-4xl mb-3">✨ {language === 'ko' ? '추천 전시' : 'Recommended'}</div>
                        <div className="text-3xl font-medium">{exhibitionRec}</div>
                        {exhibitionMuseum && (
                          <div className="text-2xl opacity-80 mt-2">{exhibitionMuseum}</div>
                        )}
                      </div>
                      
                      {/* 함께 가면 좋은 유형 */}
                      <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8">
                        <div className="text-4xl mb-6">🤝 {language === 'ko' ? '함께 가면 좋은 유형' : 'Good Matches'}</div>
                        <div className="flex justify-center gap-10">
                          {goodMatches.map((match, idx) => (
                            <div key={idx} className="text-center">
                              <div className="text-6xl mb-2">{match.emoji}</div>
                              <div className="text-2xl">
                                {language === 'ko' ? match.name_ko : match.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* 하단 */}
                    <div className="text-center space-y-4 pt-8">
                      <div className="text-2xl italic opacity-60">
                        {language === 'ko' 
                          ? `${masterpiece.title_ko} - ${masterpiece.artist_ko}`
                          : `${masterpiece.title} - ${masterpiece.artist}`
                        }
                      </div>
                      <div className="text-5xl font-bold" style={{ 
                        textShadow: '3px 3px 8px rgba(0,0,0,0.9)' 
                      }}>
                        {language === 'ko' ? '나만의 예술 성격 발견하기' : 'Discover Your Art Personality'}
                      </div>
                      <div className="text-4xl" style={{ 
                        fontFamily: 'var(--font-cormorant), Georgia, serif',
                        letterSpacing: '0.3em'
                      }}>
                        SAYU.MY
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}