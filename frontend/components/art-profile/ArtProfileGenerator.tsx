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
import APIKeyGuide from './APIKeyGuide';
import { generateAIArt, generateDemoArt, AI_ART_STYLES } from '@/lib/huggingface-api';
import { aiArtService } from '@/lib/ai-art-service';
import { openAIArtService } from '@/lib/openai-art-service';

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
  const [isUsingRealAI, setIsUsingRealAI] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showAPIGuide, setShowAPIGuide] = useState(false);

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
    setGenerationError(null);

    const startTime = Date.now();

    try {
      // API 키 확인
      const apiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
      const hasValidApiKey = apiKey && apiKey !== 'hf_temporary_demo_key_replace_with_real_key';
      
      setIsUsingRealAI(hasValidApiKey);
      
      let transformedImage: string;
      let modelUsed = 'Canvas Effect';
      
      // Try OpenAI DALL-E first (best quality)
      const openAIKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      if (openAIKey) {
        try {
          toast.success(language === 'ko' ? 'OpenAI DALL-E로 생성 중... (최고 품질)' : 'Generating with OpenAI DALL-E... (Best Quality)');
          transformedImage = await openAIArtService.generateArt(
            selectedImage,
            selectedStyle.id,
            (progress) => setGenerationProgress(progress)
          );
          setIsUsingRealAI(true);
          modelUsed = 'OpenAI DALL-E 3 (HD)';
        } catch (openAIError) {
          console.warn('OpenAI DALL-E failed:', openAIError);
          // Fall through to try other services
        }
      }
      
      // If DALL-E didn't work, try other AI services
      if (!transformedImage!) {
        toast.info(language === 'ko' ? 'AI 서비스로 생성 시도 중...' : 'Trying AI services...');
        
        try {
          // Try multiple AI services (Stability AI, Hugging Face, Replicate)
          transformedImage = await aiArtService.generateArt(
            selectedImage,
            selectedStyle.id,
            (progress) => setGenerationProgress(progress)
          );
          setIsUsingRealAI(true);
          modelUsed = 'Multi-Service AI';
        } catch (aiError) {
          console.warn('All AI services failed, falling back to canvas:', aiError);
          
          // Final fallback to Canvas effects
          toast.info(language === 'ko' ? '향상된 아트 효과로 생성 중...' : 'Generating with enhanced art effects...');
          
          transformedImage = await generateDemoArt(
            selectedImage,
            selectedStyle.id,
            (progress) => setGenerationProgress(progress)
          );
          setIsUsingRealAI(false);
          modelUsed = 'Enhanced Canvas Effect';
        }
      }

      const processingTime = Date.now() - startTime;
      
      // 결과 생성
      const result = {
        id: Date.now().toString(),
        originalImage: imagePreview,
        transformedImage,
        styleUsed: selectedStyle,
        style: selectedStyle.name,
        processingTime,
        createdAt: new Date(),
        isAIGenerated: isUsingRealAI,
        modelUsed: modelUsed
      };
      
      setGeneratedResult(result);
      setStep('result');
      setUserCredits(prev => Math.max(0, prev - 1));
      
      const successMessage = isUsingRealAI 
        ? (language === 'ko' ? '고급 AI 아트 프로필이 생성되었습니다!' : 'Advanced AI art profile created!')
        : (language === 'ko' ? '향상된 아트 프로필이 생성되었습니다!' : 'Enhanced art profile created!');
      
      toast.success(successMessage);

    } catch (error) {
      console.error('Generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setGenerationError(errorMessage);
      
      toast.error(language === 'ko' 
        ? `생성 중 오류가 발생했습니다: ${errorMessage}` 
        : `Failed to generate art profile: ${errorMessage}`
      );
      setStep('style');
    } finally {
      setIsGenerating(false);
    }
  };

  // Canvas 효과는 huggingface-api.ts로 이동됨

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
          
          {/* Credits Display and API Key Status */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full border border-white/20">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white">
                {language === 'ko' 
                  ? `이번 달 남은 횟수: ${userCredits}/3` 
                  : `Remaining this month: ${userCredits}/3`
                }
              </span>
            </div>
            
            {/* AI Model Status */}
            <button
              onClick={() => setShowAPIGuide(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 backdrop-blur-sm rounded-full border border-yellow-500/30 transition-colors"
            >
              {process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY === 'hf_temporary_demo_key_replace_with_real_key' || !process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY ? (
                <>
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  <span className="text-sm text-yellow-200">
                    {language === 'ko' ? '🔧 AI 모델 설정' : '🔧 Setup AI Models'}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-sm text-green-200">
                    {language === 'ko' ? '✨ AI 모델 활성화됨' : '✨ AI Models Enabled'}
                  </span>
                </>
              )}
            </button>
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
                {isUsingRealAI 
                  ? (language === 'ko' ? 'AI가 예술 작품을 만드는 중...' : 'AI is creating your artwork...')
                  : (language === 'ko' ? '데모 예술 작품 만드는 중...' : 'Creating demo artwork...')
                }
              </h3>
              
              <p className="text-gray-200 mb-2">
                {language === 'ko' 
                  ? `${selectedStyle?.nameKo} 스타일로 변환하고 있어요` 
                  : `Transforming with ${selectedStyle?.name} style`
                }
              </p>
              
              {isUsingRealAI && (
                <p className="text-sm text-purple-300 mb-6">
                  {language === 'ko' 
                    ? '🎨 Hugging Face AI 모델 사용 중' 
                    : '🎨 Using Hugging Face AI model'
                  }
                </p>
              )}
              
              {!isUsingRealAI && (
                <p className="text-sm text-yellow-300 mb-6">
                  {language === 'ko' 
                    ? '⚠️ 데모 모드 - API 키를 설정하면 실제 AI 모델을 사용할 수 있습니다' 
                    : '⚠️ Demo mode - Set API key to use real AI models'
                  }
                </p>
              )}
              
              {generationError && (
                <p className="text-sm text-red-300 mb-6">
                  {language === 'ko' ? '오류: ' : 'Error: '}{generationError}
                </p>
              )}
              
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
      
      {/* API Key Guide Modal */}
      <APIKeyGuide 
        isOpen={showAPIGuide} 
        onClose={() => setShowAPIGuide(false)} 
      />
    </div>
  );
}