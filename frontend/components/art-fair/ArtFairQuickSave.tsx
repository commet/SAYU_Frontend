'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Camera, X, Check, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';

interface ArtFairQuickSaveProps {
  onSave: () => void;
  onBack: () => void;
  savedCount: number;
}

interface QuickSaveItem {
  id: string;
  imageUrl?: string;
  booth?: string;
  artist?: string;
  notes?: string;
  timestamp: Date;
}

export default function ArtFairQuickSave({ onSave, onBack, savedCount }: ArtFairQuickSaveProps) {
  const { language } = useLanguage();
  const [currentItem, setCurrentItem] = useState<QuickSaveItem | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const controls = useAnimation();

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentItem({
          id: Date.now().toString(),
          imageUrl: reader.result as string,
          timestamp: new Date()
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!currentItem) return;

    await controls.start({
      x: direction === 'left' ? -400 : 400,
      opacity: 0,
      transition: { duration: 0.3 }
    });

    if (direction === 'right') {
      onSave();
      // Here you would normally save to database
      console.log('Saving artwork:', currentItem);
    }

    // Reset for next item
    setCurrentItem(null);
    controls.set({ x: 0, opacity: 1 });
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleSwipe('right');
    } else if (info.offset.x < -threshold) {
      handleSwipe('left');
    } else {
      controls.start({ x: 0, transition: { type: 'spring' } });
    }
  };

  return (
    <div className="quick-save-container">
      <header className="quick-save-header">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="back-button"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="header-info">
          <h2>{language === 'ko' ? '빠른 저장 모드' : 'Speed Capture Mode'}</h2>
          <span className="saved-indicator">
            {savedCount} {language === 'ko' ? '저장됨' : 'saved'}
          </span>
        </div>
      </header>

      <div className="swipe-area">
        {currentItem ? (
          <motion.div
            className="capture-card"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            animate={controls}
          >
            <div className="image-preview">
              {currentItem.imageUrl ? (
                <img src={currentItem.imageUrl} alt="Captured artwork" />
              ) : (
                <div className="empty-preview">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="swipe-indicators">
              <div className="indicator reject">
                <X className="w-6 h-6" />
                <span>{language === 'ko' ? '건너뛰기' : 'Skip'}</span>
              </div>
              <div className="indicator save">
                <Check className="w-6 h-6" />
                <span>{language === 'ko' ? '저장' : 'Save'}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="capture-prompt">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageCapture}
              className="hidden"
            />
            
            <Button
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              className="capture-button"
            >
              <Camera className="w-6 h-6 mr-2" />
              {language === 'ko' ? '작품 촬영' : 'Capture Artwork'}
            </Button>
            
            <p className="capture-hint">
              {language === 'ko' 
                ? '좌우로 스와이프하여 빠르게 정리하세요'
                : 'Swipe left to skip, right to save'}
            </p>
          </div>
        )}
      </div>

      <div className="quick-tips">
        <h3>{language === 'ko' ? '빠른 팁' : 'Quick Tips'}</h3>
        <ul>
          <li>
            {language === 'ko'
              ? '오른쪽으로 스와이프하면 저장됩니다'
              : 'Swipe right to save'}
          </li>
          <li>
            {language === 'ko'
              ? '왼쪽으로 스와이프하면 건너뜁니다'
              : 'Swipe left to skip'}
          </li>
          <li>
            {language === 'ko'
              ? '나중에 부스 정보를 추가할 수 있습니다'
              : 'Add booth info later'}
          </li>
        </ul>
      </div>
    </div>
  );
}