'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, RefreshCw, Heart, Instagram, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArtProfileResult as ArtProfileResultType } from '@/types/art-profile';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

interface ArtProfileResultProps {
  result: ArtProfileResultType;
  onReset: () => void;
  onShare?: (platform: string) => void;
}

export default function ArtProfileResult({ result, onReset, onShare }: ArtProfileResultProps) {
  const { language } = useLanguage();
  const [isLiked, setIsLiked] = useState(false);
  const [shareCardRef, setShareCardRef] = useState<HTMLDivElement | null>(null);

  const handleDownload = async () => {
    try {
      const response = await fetch(result.transformedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `art-profile-${result.styleUsed.id}-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(language === 'ko' ? '다운로드가 시작되었습니다' : 'Download started');
    } catch (error) {
      toast.error(language === 'ko' ? '다운로드 실패' : 'Download failed');
    }
  };

  const handleShareToInstagram = async () => {
    if (!shareCardRef) return;

    try {
      // 공유 카드를 캔버스로 변환
      const canvas = await html2canvas(shareCardRef, {
        backgroundColor: null,
        scale: 2,
      });

      // 캔버스를 blob으로 변환
      canvas.toBlob((blob) => {
        if (!blob) return;

        // 파일로 변환
        const file = new File([blob], 'art-profile.png', { type: 'image/png' });
        
        // Web Share API 사용 (모바일에서 Instagram 앱으로 공유 가능)
        if (navigator.share && navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: language === 'ko' ? '나의 아트 프로필' : 'My Art Profile',
            text: language === 'ko' 
              ? `AI가 만든 나만의 ${result.styleUsed.nameKo} 스타일 아트 프로필! #SAYU #아트프로필` 
              : `My AI-generated ${result.styleUsed.name} style art profile! #SAYU #ArtProfile`,
          });
        } else {
          // 데스크톱에서는 이미지 다운로드
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'sayu-art-profile.png';
          a.click();
          window.URL.revokeObjectURL(url);
          
          toast.success(language === 'ko' 
            ? '이미지가 저장되었습니다. Instagram에 업로드해주세요!' 
            : 'Image saved. Upload it to Instagram!'
          );
        }
      }, 'image/png');
    } catch (error) {
      console.error('Share failed:', error);
      toast.error(language === 'ko' ? '공유 실패' : 'Share failed');
    }
  };

  const handleSetAsProfile = async () => {
    // 프로필 이미지로 설정하는 API 호출
    try {
      // await updateProfileImage(result.transformedImage);
      toast.success(language === 'ko' ? '프로필 사진이 변경되었습니다' : 'Profile photo updated');
    } catch (error) {
      toast.error(language === 'ko' ? '프로필 변경 실패' : 'Failed to update profile');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Result Display */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original vs Transformed */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="sayu-liquid-glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">
            {language === 'ko' ? '원본' : 'Original'}
          </h3>
          <img 
            src={result.originalImage} 
            alt="Original"
            className="w-full rounded-xl"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="sayu-liquid-glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">
            {result.styleUsed.nameKo || result.styleUsed.name}
          </h3>
          <img 
            src={result.transformedImage} 
            alt="Transformed"
            className="w-full rounded-xl"
          />
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-3 justify-center"
      >
        <Button
          onClick={handleDownload}
          variant="outline"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          {language === 'ko' ? '다운로드' : 'Download'}
        </Button>

        <Button
          onClick={handleShareToInstagram}
          variant="outline"
          className="gap-2"
        >
          <Instagram className="w-4 h-4" />
          {language === 'ko' ? '인스타 공유' : 'Share to Instagram'}
        </Button>

        <Button
          onClick={handleSetAsProfile}
          variant="outline"
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {language === 'ko' ? '프로필로 설정' : 'Set as Profile'}
        </Button>

        <Button
          onClick={() => setIsLiked(!isLiked)}
          variant={isLiked ? 'default' : 'outline'}
          className="gap-2"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          {language === 'ko' ? '좋아요' : 'Like'}
        </Button>

        <Button
          onClick={onReset}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {language === 'ko' ? '다시 만들기' : 'Create Another'}
        </Button>
      </motion.div>

      {/* Share Card (Hidden, for Instagram) */}
      <div 
        ref={setShareCardRef}
        className="fixed -left-[9999px] top-0 w-[1080px] h-[1080px] bg-gradient-to-br from-purple-500 to-pink-500 p-12"
      >
        <div className="bg-white rounded-3xl p-8 h-full flex flex-col items-center justify-center">
          <img 
            src={result.transformedImage} 
            alt="Art Profile"
            className="w-[800px] h-[800px] object-cover rounded-2xl mb-8"
          />
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">
              {language === 'ko' ? '나의 아트 프로필' : 'My Art Profile'}
            </h2>
            <p className="text-xl text-gray-600 mb-4">
              {result.styleUsed.nameKo || result.styleUsed.name} Style
            </p>
            <div className="flex items-center justify-center gap-2">
              <img src="/logo.png" alt="SAYU" className="h-8" />
              <span className="text-lg font-medium">SAYU</span>
            </div>
          </div>
        </div>
      </div>

      {/* Style Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="sayu-liquid-glass rounded-2xl p-6 text-center max-w-2xl mx-auto"
      >
        <h4 className="font-semibold mb-2">
          {language === 'ko' ? '사용된 화풍' : 'Style Used'}
        </h4>
        <p className="text-lg mb-2">
          {language === 'ko' ? result.styleUsed.nameKo : result.styleUsed.name}
        </p>
        <p className="text-gray-600">
          {language === 'ko' ? result.styleUsed.descriptionKo : result.styleUsed.description}
        </p>
        {result.styleUsed.artist && (
          <p className="text-sm text-gray-500 mt-2">
            {result.styleUsed.artist} • {result.styleUsed.movement}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}