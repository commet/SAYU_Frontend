'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Sparkles, Share2, Download, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { artProfileAPI } from '@/lib/art-profile-api';
import { ArtStyle } from '@/types/art-profile';
import { predefinedStyles } from '@/data/art-styles';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import StyleSelector from './StyleSelector';
import ArtProfileResultComponent from './ArtProfileResult';

export default function ArtProfileGenerator() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [step, setStep] = useState<'upload' | 'style' | 'generating' | 'result'>('upload');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [userCredits, setUserCredits] = useState(3); // 월 3회 무료

  // Cleanup interval on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(language === 'ko' ? '파일 크기는 10MB 이하여야 합니다' : 'File size must be under 10MB');
      return;
    }

    // 이미지 타입 체크
    if (!file.type.startsWith('image/')) {
      toast.error(language === 'ko' ? '이미지 파일만 업로드 가능합니다' : 'Only image files are allowed');
      return;
    }

    setSelectedImage(file);
    
    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setStep('style');
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!selectedImage || !selectedStyle) return;

    setStep('generating');
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // 즉시 Canvas 기반 효과 적용
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Canvas 설정
        canvas.width = 512;
        canvas.height = 512;
        
        // 이미지 그리기
        ctx.drawImage(img, 0, 0, 512, 512);
        
        // 스타일별 효과 적용
        applyArtEffect(ctx, selectedStyle.id);
        
        // 프로그레스 애니메이션
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 15;
          setGenerationProgress(progress);
          
          if (progress >= 100) {
            clearInterval(progressInterval);
            
            // 결과 생성
            const transformedImage = canvas.toDataURL('image/jpeg', 0.9);
            const result = {
              id: Date.now().toString(),
              originalImage: imagePreview,
              transformedImage,
              styleUsed: selectedStyle, // 전체 스타일 객체 전달
              style: selectedStyle.name,
              processingTime: 2000,
              createdAt: new Date()
            };
            
            setGeneratedResult(result);
            setStep('result');
            setUserCredits(prev => Math.max(0, prev - 1));
            toast.success(language === 'ko' ? '아트 프로필이 생성되었습니다!' : 'Art profile created!');
          }
        }, 300);
      };
      
      img.src = imagePreview;

    } catch (error) {
      console.error('Generation failed:', error);
      toast.error(language === 'ko' ? '생성 중 오류가 발생했습니다' : 'Failed to generate art profile');
      setStep('style');
    } finally {
      setIsGenerating(false);
    }
  };

  // Canvas 기반 아트 효과 함수 - 더욱 강렬한 효과
  const applyArtEffect = (ctx: CanvasRenderingContext2D, styleId: string) => {
    const imageData = ctx.getImageData(0, 0, 512, 512);
    const data = imageData.data;
    
    switch (styleId) {
      case 'monet-impressionism':
        // 모네 인상주의 - 부드럽고 몽환적인 효과
        for (let i = 0; i < data.length; i += 4) {
          const x = (i / 4) % 512;
          const y = Math.floor((i / 4) / 512);
          
          // 물결 효과와 색상 블렌딩
          const wave = Math.sin(x * 0.05) * Math.cos(y * 0.05);
          
          data[i] = Math.min(255, data[i] * 0.7 + 100 + wave * 30);     // Red - 따뜻하게
          data[i + 1] = Math.min(255, data[i + 1] * 0.8 + 80 + wave * 20); // Green
          data[i + 2] = Math.min(255, data[i + 2] * 1.2 + 50 + wave * 40); // Blue - 강조
          
          // 부드러운 번짐 효과
          if (i % 8 === 0) {
            data[i + 3] = Math.max(200, data[i + 3]); // 살짝 투명하게
          }
        }
        
        // 블러 효과 추가
        ctx.putImageData(imageData, 0, 0);
        ctx.filter = 'blur(2px)';
        ctx.drawImage(ctx.canvas, 0, 0);
        ctx.filter = 'none';
        break;
        
      case 'vangogh-postimpressionism':
        // 반 고흐 - 강렬한 붓터치와 소용돌이
        for (let i = 0; i < data.length; i += 4) {
          const x = (i / 4) % 512;
          const y = Math.floor((i / 4) / 512);
          
          // 소용돌이 패턴
          const swirl = Math.sin(Math.sqrt((x - 256) ** 2 + (y - 256) ** 2) * 0.05);
          
          // 강렬한 색상 대비
          data[i] = Math.min(255, data[i] * 1.5 + swirl * 50);     // Red - 매우 강렬
          data[i + 1] = Math.min(255, data[i + 1] * 1.3 + swirl * 30); // Green  
          data[i + 2] = Math.min(255, data[i + 2] * 0.6 + 100 + swirl * 40); // Blue - 깊은 파랑
          
          // 붓터치 효과
          if ((x + y) % 5 === 0) {
            const intensity = Math.random() * 0.3 + 0.7;
            data[i] *= intensity;
            data[i + 1] *= intensity;
            data[i + 2] *= intensity;
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        // 대비 강조
        ctx.filter = 'contrast(1.5) saturate(1.3)';
        ctx.drawImage(ctx.canvas, 0, 0);
        ctx.filter = 'none';
        break;
        
      case 'picasso-cubism':
        // 피카소 큐비즘 - 기하학적 분할과 재구성
        ctx.putImageData(imageData, 0, 0);
        
        // 이미지를 블록으로 분할하고 재배치
        const blockSize = 64;
        for (let y = 0; y < 512; y += blockSize) {
          for (let x = 0; x < 512; x += blockSize) {
            ctx.save();
            
            // 각 블록을 무작위로 변형
            const rotation = (Math.random() - 0.5) * 0.3;
            const scale = 0.8 + Math.random() * 0.4;
            
            ctx.translate(x + blockSize/2, y + blockSize/2);
            ctx.rotate(rotation);
            ctx.scale(scale, scale);
            
            // 색상 시프트
            const hueRotate = Math.random() * 60 - 30;
            ctx.filter = `hue-rotate(${hueRotate}deg) contrast(1.2)`;
            
            ctx.drawImage(
              ctx.canvas,
              x, y, blockSize, blockSize,
              -blockSize/2, -blockSize/2, blockSize, blockSize
            );
            
            ctx.restore();
          }
        }
        
        // 윤곽선 강조
        ctx.filter = 'contrast(1.5) brightness(1.1)';
        ctx.drawImage(ctx.canvas, 0, 0);
        ctx.filter = 'none';
        break;
        
      case 'warhol-popart':
        // 워홀 팝아트 - 강렬한 색상과 대비
        for (let i = 0; i < data.length; i += 4) {
          // 색상을 4단계로 포스터화
          const levels = 4;
          const factor = 255 / (levels - 1);
          
          // 극단적인 색상 변환
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          
          if (avg < 64) {
            // 어두운 부분 - 진한 보라
            data[i] = 75;
            data[i + 1] = 0;
            data[i + 2] = 130;
          } else if (avg < 128) {
            // 중간 어두운 부분 - 핫핑크
            data[i] = 255;
            data[i + 1] = 20;
            data[i + 2] = 147;
          } else if (avg < 192) {
            // 중간 밝은 부분 - 청록
            data[i] = 0;
            data[i + 1] = 255;
            data[i + 2] = 255;
          } else {
            // 밝은 부분 - 노랑
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 0;
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        // 추가 대비 효과
        ctx.filter = 'contrast(2) saturate(2)';
        ctx.drawImage(ctx.canvas, 0, 0);
        ctx.filter = 'none';
        break;
        
      case 'klimt-artnouveau':
        // 클림트 스타일 - 황금빛과 장식적 패턴
        for (let i = 0; i < data.length; i += 4) {
          const x = (i / 4) % 512;
          const y = Math.floor((i / 4) / 512);
          
          // 황금빛 오버레이
          const pattern = Math.sin(x * 0.1) * Math.cos(y * 0.1);
          
          data[i] = Math.min(255, data[i] * 0.8 + 180 * pattern);     // Red - 황금빛
          data[i + 1] = Math.min(255, data[i + 1] * 0.7 + 140 * pattern); // Green
          data[i + 2] = Math.min(255, data[i + 2] * 0.5 + 50);          // Blue - 억제
          
          // 장식적 패턴
          if ((x % 10 === 0 || y % 10 === 0) && Math.random() > 0.5) {
            data[i] = 255;
            data[i + 1] = 215;
            data[i + 2] = 0;
          }
        }
        break;
        
      case 'pixelart-digital':
        // 픽셀 아트 - 8비트 스타일
        const pixelSize = 8;
        
        // 픽셀화
        for (let y = 0; y < 512; y += pixelSize) {
          for (let x = 0; x < 512; x += pixelSize) {
            let r = 0, g = 0, b = 0;
            let count = 0;
            
            // 평균 색상 계산
            for (let py = 0; py < pixelSize; py++) {
              for (let px = 0; px < pixelSize; px++) {
                const idx = ((y + py) * 512 + (x + px)) * 4;
                if (idx < data.length) {
                  r += data[idx];
                  g += data[idx + 1];
                  b += data[idx + 2];
                  count++;
                }
              }
            }
            
            // 색상 단순화 (8비트 팔레트)
            r = Math.round(r / count / 32) * 32;
            g = Math.round(g / count / 32) * 32;
            b = Math.round(b / count / 32) * 32;
            
            // 픽셀 블록 채우기
            for (let py = 0; py < pixelSize; py++) {
              for (let px = 0; px < pixelSize; px++) {
                const idx = ((y + py) * 512 + (x + px)) * 4;
                if (idx < data.length) {
                  data[idx] = r;
                  data[idx + 1] = g;
                  data[idx + 2] = b;
                }
              }
            }
          }
        }
        break;
        
      default:
        // 기본 아트 효과 - 빈티지 필터
        for (let i = 0; i < data.length; i += 4) {
          // 세피아 톤 효과
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
    }
    
    // 최종 이미지 데이터 적용
    if (styleId !== 'picasso-cubism' && styleId !== 'vangogh-postimpressionism' && styleId !== 'monet-impressionism' && styleId !== 'warhol-popart') {
      ctx.putImageData(imageData, 0, 0);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setSelectedImage(null);
    setImagePreview('');
    setSelectedStyle(null);
    setGeneratedResult(null);
    setGenerationProgress(0);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/backgrounds/street-artist-painting-european-city-outdoor.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen p-4 pt-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
          <h1 className="text-3xl font-bold mb-2 text-white">
            {language === 'ko' ? '나만의 아트 프로필' : 'My Art Profile'}
          </h1>
          <p className="text-gray-200">
            {language === 'ko' 
              ? 'AI가 당신의 사진을 예술 작품으로 변환해드려요' 
              : 'AI transforms your photo into an artwork'
            }
          </p>
          
          {/* Credits Display */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full border border-white/20">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white">
              {language === 'ko' 
                ? `이번 달 남은 횟수: ${userCredits}/3` 
                : `Remaining this month: ${userCredits}/3`
              }
            </span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Upload Image */}
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              {/* Style Examples */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white text-center mb-3">
                  {language === 'ko' ? '다양한 예술 스타일로 변신!' : 'Transform into Various Art Styles!'}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {[
                    { src: '/samples/base-portrait.png', label: language === 'ko' ? '원본' : 'Original' },
                    { src: '/samples/preview-picasso.png', label: 'Picasso' },
                    { src: '/samples/preview-monet.png', label: 'Monet' },
                    { src: '/samples/preview-vangogh.png', label: 'Van Gogh' },
                    { src: '/samples/preview-warhol.png', label: 'Warhol' },
                    { src: '/samples/preview-pixel.png', label: 'Pixel Art' }
                  ].map((style, index) => (
                    <motion.div
                      key={style.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + 0.1 * index }}
                      className="relative group"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10">
                        <img 
                          src={style.src} 
                          alt={style.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-[10px] text-center mt-1 text-gray-300">{style.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer inline-flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-400 rounded-xl hover:border-purple-400 transition-colors"
              >
                <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Camera className="w-12 h-12 text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-lg mb-1 text-white">
                    {language === 'ko' ? '사진 선택하기' : 'Choose a photo'}
                  </p>
                  <p className="text-sm text-gray-300">
                    {language === 'ko' ? '클릭하거나 드래그하여 업로드' : 'Click or drag to upload'}
                  </p>
                </div>
              </motion.div>
              
              <div className="mt-4 text-sm text-gray-300">
                <p className="mb-2">{language === 'ko' ? '권장 사항:' : 'Recommendations:'}</p>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="text-purple-400">•</span>
                    {language === 'ko' ? '인물, 반려동물, 풍경 등 모두 가능' : 'People, pets, landscapes - all welcome'}
                  </span>
                  <span className="text-gray-500">|</span>
                  <span className="flex items-center gap-1">
                    <span className="text-purple-400">•</span>
                    {language === 'ko' ? '선명한 이미지 권장' : 'Clear images recommended'}
                  </span>
                  <span className="text-gray-500">|</span>
                  <span className="flex items-center gap-1">
                    <span className="text-purple-400">•</span>
                    {language === 'ko' ? '10MB 이하' : 'Under 10MB'}
                  </span>
                </div>
              </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Style */}
          {step === 'style' && (
            <motion.div
              key="style"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <StyleSelector
                imagePreview={imagePreview}
                onStyleSelect={setSelectedStyle}
                selectedStyle={selectedStyle}
                onBack={() => setStep('upload')}
                onGenerate={handleGenerate}
                userPreferences={[]}
              />
            </motion.div>
          )}

          {/* Step 3: Generating */}
          {step === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 mx-auto mb-6"
              >
                <Sparkles className="w-full h-full text-purple-400" />
              </motion.div>
              
              <h3 className="text-xl font-semibold mb-2 text-white">
                {language === 'ko' ? '예술 작품 만드는 중...' : 'Creating your artwork...'}
              </h3>
              
              <p className="text-gray-200 mb-6">
                {language === 'ko' 
                  ? `${selectedStyle?.nameKo} 스타일로 변환하고 있어요` 
                  : `Transforming with ${selectedStyle?.name} style`
                }
              </p>
              
              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${generationProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-300">{generationProgress}%</p>
              </div>
            </motion.div>
          )}

          {/* Step 4: Result */}
          {step === 'result' && generatedResult && (
            <ArtProfileResultComponent
              result={generatedResult}
              onReset={handleReset}
              onShare={() => {/* 공유 기능 구현 */}}
            />
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}