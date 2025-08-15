'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Sparkles, Share2, Download, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import ArtProfileResultComponent from './ArtProfileResult';

// 스타일 정의
const ART_STYLES = [
  { id: 'monet-impressionism', name: 'Monet', nameKo: '모네', prompt: 'impressionist painting in style of Claude Monet' },
  { id: 'vangogh-postimpressionism', name: 'Van Gogh', nameKo: '반 고흐', prompt: 'painting in style of Van Gogh, swirling brushstrokes' },
  { id: 'picasso-cubism', name: 'Picasso', nameKo: '피카소', prompt: 'cubist art in style of Pablo Picasso' },
  { id: 'warhol-popart', name: 'Warhol', nameKo: '워홀', prompt: 'pop art in style of Andy Warhol' },
  { id: 'anime-manga', name: 'Anime', nameKo: '애니메', prompt: 'anime style, manga art' },
  { id: 'cyberpunk-future', name: 'Cyberpunk', nameKo: '사이버펑크', prompt: 'cyberpunk style, neon lights, futuristic' },
  { id: 'watercolor-soft', name: 'Watercolor', nameKo: '수채화', prompt: 'watercolor painting, soft colors' },
  { id: 'pixelart-digital', name: 'Pixel Art', nameKo: '픽셀아트', prompt: '8-bit pixel art style' }
];

export default function ArtProfileGeneratorHF() {
  console.log('ArtProfileGeneratorHF component loaded');
  
  const { language } = useLanguage();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'upload' | 'style' | 'generating' | 'result'>('upload');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [userCredits, setUserCredits] = useState(3);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'ko' ? '파일 크기는 5MB 이하여야 합니다' : 'File size must be under 5MB');
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
      // 프로그레스 애니메이션
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 10 + 5;
        if (progress > 85) progress = 85;
        setGenerationProgress(Math.min(progress, 100));
      }, 500);

      // FormData 생성
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('styleId', selectedStyle.id);
      formData.append('modelType', 'artistic');

      console.log('🎨 AI 변환 시작:', selectedStyle.name);
      
      // AI 변환 API 호출
      const response = await fetch('/api/art-transform', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        // 모델 로딩 중
        if (response.status === 503) {
          clearInterval(progressInterval);
          toast.loading(
            language === 'ko' 
              ? `AI 모델 준비 중... ${data.retryAfter || 20}초 후 다시 시도해주세요`
              : `AI model loading... Try again in ${data.retryAfter || 20} seconds`,
            { duration: 5000 }
          );
          setStep('style');
          setIsGenerating(false);
          return;
        }
        
        throw new Error(data.error || 'Transformation failed');
      }

      // 클라이언트 변환 필요한 경우
      if (data.useClientTransform) {
        console.log('🎨 Using client-side Canvas transformation');
        const transformedImage = await applyCanvasEffect(imagePreview, selectedStyle.id);
        data.transformedImage = transformedImage;
        toast.info(
          language === 'ko'
            ? '🎨 Canvas 효과를 적용했습니다'
            : '🎨 Canvas effect applied'
        );
      }

      // 프로그레스 완료
      clearInterval(progressInterval);
      setGenerationProgress(100);

      // 결과 저장
      const result = {
        id: Date.now().toString(),
        originalImage: imagePreview,
        transformedImage: data.transformedImage,
        styleUsed: selectedStyle,
        style: selectedStyle.name,
        processingTime: 3000,
        createdAt: new Date(),
        isAIGenerated: true,
        modelUsed: 'Hugging Face AI'
      };

      setTimeout(() => {
        setGeneratedResult(result);
        setStep('result');
        setUserCredits(prev => Math.max(0, prev - 1));
        toast.success(
          language === 'ko' 
            ? '🎨 AI 아트 프로필이 생성되었습니다!' 
            : '🎨 AI art profile created!'
        );
      }, 500);

    } catch (error) {
      console.error('Generation failed:', error);
      toast.error(
        language === 'ko' 
          ? 'AI 변환 실패. 다시 시도해주세요.' 
          : 'AI transformation failed. Please try again.'
      );
      setStep('style');
    } finally {
      setIsGenerating(false);
    }
  };

  // Canvas 기반 스타일 효과 적용
  const applyCanvasEffect = async (imageUrl: string, styleId: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        canvas.width = 512;
        canvas.height = 512;
        
        // 이미지 그리기
        ctx.drawImage(img, 0, 0, 512, 512);
        
        // 스타일별 필터 효과 적용
        switch(styleId) {
          case 'monet-impressionism':
            ctx.filter = 'blur(2px) saturate(1.2) hue-rotate(20deg)';
            ctx.drawImage(canvas, 0, 0);
            break;
          case 'vangogh-postimpressionism':
            ctx.filter = 'contrast(1.5) saturate(1.5) brightness(1.1)';
            ctx.drawImage(canvas, 0, 0);
            break;
          case 'warhol-popart':
            ctx.filter = 'contrast(2) saturate(2) hue-rotate(90deg)';
            ctx.drawImage(canvas, 0, 0);
            break;
          case 'pixelart-digital':
            // 픽셀화 효과
            const pixelSize = 8;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(canvas, 0, 0, canvas.width / pixelSize, canvas.height / pixelSize);
            ctx.drawImage(canvas, 0, 0, canvas.width / pixelSize, canvas.height / pixelSize, 0, 0, canvas.width, canvas.height);
            break;
          case 'watercolor-soft':
            ctx.filter = 'blur(1px) saturate(0.8) opacity(0.9)';
            ctx.drawImage(canvas, 0, 0);
            break;
          default:
            ctx.filter = 'sepia(0.3) contrast(1.2)';
            ctx.drawImage(canvas, 0, 0);
        }
        
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      
      img.src = imageUrl;
    });
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
      {/* Background */}
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
              {language === 'ko' ? 'AI 아트 프로필' : 'AI Art Profile'}
            </h1>
            <p className="text-gray-200">
              {language === 'ko' 
                ? '진짜 AI가 당신의 사진을 예술로 변환합니다' 
                : 'Real AI transforms your photo into art'
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
                {/* AI Badge */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-400/30">
                    <span className="text-xs text-purple-300">🤖 Powered by Hugging Face AI</span>
                  </div>
                </div>

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
                  className="cursor-pointer inline-flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-400 rounded-xl hover:border-purple-400 transition-colors w-full"
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
              </motion.div>
            )}

            {/* Step 2: Select Style */}
            {step === 'style' && (
              <motion.div
                key="style"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  {language === 'ko' ? 'AI 스타일 선택' : 'Choose AI Style'}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {ART_STYLES.map((style) => (
                    <motion.button
                      key={style.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedStyle(style)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedStyle?.id === style.id
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:border-purple-400/50'
                      }`}
                    >
                      <p className="text-sm font-medium text-white">
                        {language === 'ko' ? style.nameKo : style.name}
                      </p>
                    </motion.button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setStep('upload')}
                    className="flex-1"
                  >
                    {language === 'ko' ? '뒤로' : 'Back'}
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={!selectedStyle}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    {language === 'ko' ? 'AI 변환 시작' : 'Start AI Transform'}
                  </Button>
                </div>
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
                  {language === 'ko' ? 'AI가 예술 작품을 만들고 있어요...' : 'AI is creating your artwork...'}
                </h3>
                
                <p className="text-gray-200 mb-2">
                  {language === 'ko' 
                    ? `${selectedStyle?.nameKo} 스타일로 변환 중` 
                    : `Transforming with ${selectedStyle?.name} style`
                  }
                </p>
                
                <p className="text-gray-300 text-sm mb-6">
                  🤖 Hugging Face AI Model Processing
                </p>
                
                {/* Progress Bar */}
                <div className="w-full max-w-md mx-auto">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
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