'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, RefreshCw, Instagram, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface ArtProfileResultProps {
  result: any;
  onReset: () => void;
  onShare?: (platform: string) => void;
}

export default function ArtProfileResult({ result, onReset, onShare }: ArtProfileResultProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleDownload = async () => {
    try {
      if (!result.transformedImage) {
        throw new Error('No transformed image available');
      }
      
      // Canvas에서 직접 다운로드
      const link = document.createElement('a');
      link.download = `sayu-art-profile-${Date.now()}.jpg`;
      link.href = result.transformedImage;
      link.click();
      
      toast.success(language === 'ko' ? '다운로드가 시작되었습니다' : 'Download started');
    } catch (error) {
      toast.error(language === 'ko' ? '다운로드 실패' : 'Download failed');
    }
  };

  const handleShareToInstagram = async () => {
    try {
      // 이미지를 Blob으로 변환
      const response = await fetch(result.transformedImage);
      const blob = await response.blob();
      const file = new File([blob], 'art-profile.jpg', { type: 'image/jpeg' });
      
      // Web Share API 사용 (모바일)
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: language === 'ko' ? '나의 아트 프로필' : 'My Art Profile',
          text: language === 'ko' 
            ? `AI가 만든 나만의 ${result.styleUsed?.nameKo || result.styleUsed?.name || '아트'} 스타일! #SAYU #아트프로필` 
            : `My AI-generated ${result.styleUsed?.name || 'art'} style! #SAYU #ArtProfile`,
        });
        toast.success(language === 'ko' ? '공유 준비 완료!' : 'Ready to share!');
      } else {
        // 데스크톱에서는 이미지 다운로드 후 안내
        handleDownload();
        setTimeout(() => {
          toast.success(
            language === 'ko' 
              ? '이미지가 저장되었습니다. Instagram에 업로드해주세요!' 
              : 'Image saved. Upload it to Instagram!',
            { duration: 5000 }
          );
        }, 1000);
      }
    } catch (error) {
      if ((error as any)?.name !== 'AbortError') {
        console.error('Share failed:', error);
        toast.error(language === 'ko' ? '공유 실패' : 'Share failed');
      }
    }
  };

  const handleSetAsProfile = async () => {
    if (!user) {
      toast.error(language === 'ko' ? '로그인이 필요합니다' : 'Please login first');
      router.push('/login');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      // Supabase에 프로필 이미지 업데이트
      const { error } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: result.transformedImage,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success(language === 'ko' ? '프로필 사진이 변경되었습니다' : 'Profile photo updated');
      
      // 프로필 페이지로 이동
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(language === 'ko' ? '프로필 변경 실패' : 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* 변환된 이미지만 표시 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          {/* 스타일 이름 표시 */}
          <h3 className="text-2xl font-bold text-center mb-2 text-white">
            {language === 'ko' 
              ? (result.styleUsed?.nameKo || result.styleUsed?.name || '아트 프로필')
              : (result.styleUsed?.name || 'Art Profile')}
          </h3>
          
          {/* AI 생성 정보 */}
          <div className="text-center mb-4">
            {result.isAIGenerated ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm text-green-200">
                  {language === 'ko' ? '🎨 AI 모델로 생성됨' : '🎨 Generated by AI Model'}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span className="text-sm text-yellow-200">
                  {language === 'ko' ? '⚡ 데모 모드 (Canvas 효과)' : '⚡ Demo Mode (Canvas Effect)'}
                </span>
              </div>
            )}
          </div>
          
          {/* 모델 정보 */}
          {result.modelUsed && (
            <p className="text-center text-xs text-gray-300 mb-4">
              {language === 'ko' ? '생성 방식: ' : 'Generated with: '}{result.modelUsed}
            </p>
          )}
          
          {/* 변환된 이미지 */}
          <div className="relative w-full aspect-square rounded-xl overflow-hidden">
            <img 
              src={result.transformedImage} 
              alt="Transformed Art Profile"
              className="w-full h-full object-cover"
            />
            
            {/* 처리 시간 오버레이 */}
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white">
              {language === 'ko' ? '처리 시간: ' : 'Processing: '}{(result.processingTime / 1000).toFixed(1)}s
            </div>
          </div>
        </div>
      </motion.div>

      {/* 액션 버튼들 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-3 justify-center"
      >
        <button
          onClick={handleDownload}
          className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2 border border-white/20"
        >
          <Download className="w-4 h-4" />
          {language === 'ko' ? '다운로드' : 'Download'}
        </button>

        <button
          onClick={handleShareToInstagram}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
        >
          <Instagram className="w-4 h-4" />
          {language === 'ko' ? '인스타 공유' : 'Share to Instagram'}
        </button>

        <button
          onClick={handleSetAsProfile}
          disabled={isUpdatingProfile}
          className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <User className="w-4 h-4" />
          {isUpdatingProfile 
            ? (language === 'ko' ? '설정 중...' : 'Setting...')
            : (language === 'ko' ? '프로필로 설정' : 'Set as Profile')
          }
        </button>

        <button
          onClick={onReset}
          className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2 border border-white/20"
        >
          <RefreshCw className="w-4 h-4" />
          {language === 'ko' ? '다시 만들기' : 'Create Another'}
        </button>
      </motion.div>
    </motion.div>
  );
}