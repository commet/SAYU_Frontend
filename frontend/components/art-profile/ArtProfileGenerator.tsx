'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Sparkles, Share2, Download, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { artProfileAPI } from '@/lib/art-profile-api';
import { ArtProfileResult } from '../../../shared';
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
  const [generatedResult, setGeneratedResult] = useState<ArtProfileResult | null>(null);
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
    if (!selectedImage || !selectedStyle || !user) return;

    if (userCredits <= 0) {
      toast.error(language === 'ko' 
        ? '이번 달 무료 생성 횟수를 모두 사용했습니다' 
        : 'You have used all free generations this month'
      );
      return;
    }

    setStep('generating');
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // 이미지 리사이징
      const resizedImage = await artProfileAPI.resizeImage(selectedImage);
      const base64Image = await artProfileAPI.imageToBase64(new File([resizedImage], selectedImage.name));

      // 프로그레스 시뮬레이션
      progressIntervalRef.current = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // AI 생성 요청
      const result = await artProfileAPI.generateArtProfile({
        userId: user.auth.id,
        imageUrl: base64Image,
        styleId: selectedStyle.id,
      });

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setGenerationProgress(100);
      
      setTimeout(() => {
        setGeneratedResult(result);
        setStep('result');
        setUserCredits(prev => prev - 1);
        toast.success(language === 'ko' ? '아트 프로필이 생성되었습니다!' : 'Art profile created!');
      }, 500);

    } catch (error) {
      console.error('Generation failed:', error);
      toast.error(language === 'ko' ? '생성 중 오류가 발생했습니다' : 'Failed to generate art profile');
      setStep('style');
    } finally {
      setIsGenerating(false);
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
    <div className="min-h-screen sayu-gradient-bg p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            {language === 'ko' ? '나만의 아트 프로필' : 'My Art Profile'}
          </h1>
          <p className="text-gray-600">
            {language === 'ko' 
              ? 'AI가 당신의 사진을 예술 작품으로 변환해드려요' 
              : 'AI transforms your photo into an artwork'
            }
          </p>
          
          {/* Credits Display */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm">
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
              className="sayu-liquid-glass rounded-2xl p-8 text-center"
            >
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
                className="cursor-pointer inline-flex flex-col items-center gap-4 p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 transition-colors"
              >
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
                  <Camera className="w-12 h-12 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-lg mb-1">
                    {language === 'ko' ? '사진 선택하기' : 'Choose a photo'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {language === 'ko' ? '클릭하거나 드래그하여 업로드' : 'Click or drag to upload'}
                  </p>
                </div>
              </motion.div>
              
              <div className="mt-6 text-sm text-gray-500">
                <p>{language === 'ko' ? '권장 사항:' : 'Recommendations:'}</p>
                <ul className="mt-2 space-y-1">
                  <li>{language === 'ko' ? '• 정면 얼굴 사진' : '• Front-facing photo'}</li>
                  <li>{language === 'ko' ? '• 밝은 조명' : '• Good lighting'}</li>
                  <li>{language === 'ko' ? '• 10MB 이하' : '• Under 10MB'}</li>
                </ul>
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
              className="sayu-liquid-glass rounded-2xl p-12 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 mx-auto mb-6"
              >
                <Sparkles className="w-full h-full text-purple-500" />
              </motion.div>
              
              <h3 className="text-xl font-semibold mb-2">
                {language === 'ko' ? '예술 작품 만드는 중...' : 'Creating your artwork...'}
              </h3>
              
              <p className="text-gray-600 mb-6">
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
                <p className="mt-2 text-sm text-gray-500">{generationProgress}%</p>
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
  );
}