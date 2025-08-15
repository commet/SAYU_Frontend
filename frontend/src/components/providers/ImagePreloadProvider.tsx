'use client';

import React, { useEffect, useState } from 'react';
import { useImagePreloader } from '@/hooks/useImagePreloader';
import ImageOptimizationDebugger from '@/components/dev/ImageOptimizationDebugger';

interface ImagePreloadProviderProps {
  children: React.ReactNode;
  /** 퀴즈 페이지에서 사용 시 현재 단계 */
  currentQuizStep?: number;
  /** 퀴즈 총 단계 수 */
  totalQuizSteps?: number;
}

/**
 * SAYU 이미지 프리로딩 제공자
 * 
 * 전략:
 * 1. 앱 시작 시 중요한 이미지들부터 우선 로딩
 * 2. 사용자 인터랙션에 따라 예측적 프리로딩
 * 3. 네트워크 상태에 따른 적응적 로딩
 */
const ImagePreloadProvider: React.FC<ImagePreloadProviderProps> = ({ 
  children, 
  currentQuizStep,
  totalQuizSteps 
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { preloadAllPersonalityAnimals, isPreloading, preloadError } = useImagePreloader();

  useEffect(() => {
    const initializeImagePreloading = async () => {
      try {
        // 페이지 로딩이 완료된 후 약간의 지연 후 시작
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 네트워크 상태 확인
        const connection = (navigator as any).connection;
        const isSlowConnection = connection && 
          (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');

        if (!isSlowConnection) {
          // 빠른 네트워크에서만 전체 프리로딩
          await preloadAllPersonalityAnimals();
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Image preloading initialization failed:', error);
        setIsInitialized(true); // 에러가 있어도 앱은 정상 동작해야 함
      }
    };

    initializeImagePreloading();
  }, [preloadAllPersonalityAnimals]);

  // 퀴즈 진행도에 따른 예측적 프리로딩
  useEffect(() => {
    if (currentQuizStep && totalQuizSteps) {
      const progress = currentQuizStep / totalQuizSteps;
      
      // 퀴즈 50% 진행 시점에서 결과 이미지들 프리로딩 시작
      if (progress >= 0.5 && !isInitialized) {
        preloadAllPersonalityAnimals();
      }
    }
  }, [currentQuizStep, totalQuizSteps, isInitialized, preloadAllPersonalityAnimals]);

  return (
    <>
      {children}
      
      {/* 개발 환경에서만 디버거 표시 */}
      {process.env.NODE_ENV === 'development' && <ImageOptimizationDebugger />}
      
      {/* 프리로딩 상태 표시 (옵션) */}
      {isPreloading && (
        <div className="fixed top-4 right-4 z-40 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
          🖼️ Optimizing images...
        </div>
      )}
      
      {preloadError && process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-40 bg-red-500 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
          ⚠️ Image preload error: {preloadError}
        </div>
      )}
    </>
  );
};

export default ImagePreloadProvider;

/**
 * 퀴즈 전용 이미지 프리로딩 래퍼
 * 퀴즈 페이지에서 사용하여 진행도에 따른 최적화된 프리로딩 제공
 */
export const QuizImagePreloadWrapper: React.FC<{
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
}> = ({ children, currentStep, totalSteps }) => {
  return (
    <ImagePreloadProvider currentQuizStep={currentStep} totalQuizSteps={totalSteps}>
      {children}
    </ImagePreloadProvider>
  );
};