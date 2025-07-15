'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Camera, Mic, MapPin, Clock, Save, Grid3x3, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';
import ArtFairQuickSave from '@/components/art-fair/ArtFairQuickSave';
import BoothOrganizer from '@/components/art-fair/BoothOrganizer';
import '@/styles/art-fair.css';

interface FairMode {
  id: string;
  name: string;
  name_ko: string;
  icon: React.ReactNode;
  description: string;
  description_ko: string;
}

export default function ArtFairPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const currentFair = 'Frieze Seoul 2024';

  const fairModes: FairMode[] = [
    {
      id: 'speed-capture',
      name: 'Speed Capture',
      name_ko: '빠른 저장',
      icon: <Camera className="w-6 h-6" />,
      description: 'Quickly save artworks with swipe gestures',
      description_ko: '스와이프로 빠르게 작품 저장'
    },
    {
      id: 'booth-mode',
      name: 'Booth Mode',
      name_ko: '부스 모드',
      icon: <Grid3x3 className="w-6 h-6" />,
      description: 'Organize by gallery booths',
      description_ko: '갤러리 부스별로 정리'
    },
    {
      id: 'voice-notes',
      name: 'Voice Notes',
      name_ko: '음성 메모',
      icon: <Mic className="w-6 h-6" />,
      description: 'Record thoughts on the go',
      description_ko: '이동 중 생각 녹음'
    }
  ];

  const handleModeSelect = (modeId: string) => {
    setActiveMode(modeId);
    toast.success(language === 'ko' ? '모드 활성화됨' : 'Mode activated', {
      icon: '🎨',
      duration: 2000
    });
  };

  const handleSaveArtwork = () => {
    setSavedCount(prev => prev + 1);
    toast.success(language === 'ko' ? '저장됨!' : 'Saved!', {
      icon: '✨',
      duration: 1500
    });
  };

  return (
    <div className="art-fair-container">
      <AnimatePresence mode="wait">
        {!activeMode ? (
          <motion.div
            key="selection"
            className="mode-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <header className="art-fair-header">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="back-button"
              >
                <ChevronLeft className="w-5 h-5" />
                {language === 'ko' ? '돌아가기' : 'Back'}
              </Button>
              
              <div className="fair-info">
                <h1 className="fair-title">{currentFair}</h1>
                <div className="fair-stats">
                  <span className="stat-item">
                    <Clock className="w-4 h-4" />
                    {language === 'ko' ? '9월 4-7일' : 'Sep 4-7'}
                  </span>
                  <span className="stat-item">
                    <MapPin className="w-4 h-4" />
                    COEX
                  </span>
                </div>
              </div>
            </header>

            <div className="mode-grid">
              {fairModes.map((mode) => (
                <motion.div
                  key={mode.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="mode-card"
                    onClick={() => handleModeSelect(mode.id)}
                  >
                    <div className="mode-icon">{mode.icon}</div>
                    <h3 className="mode-name">
                      {language === 'ko' ? mode.name_ko : mode.name}
                    </h3>
                    <p className="mode-description">
                      {language === 'ko' ? mode.description_ko : mode.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="saved-counter">
              <Save className="w-5 h-5" />
              <span>
                {savedCount} {language === 'ko' ? '작품 저장됨' : 'artworks saved'}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="active-mode"
            className="active-mode-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {activeMode === 'speed-capture' && (
              <ArtFairQuickSave
                onSave={handleSaveArtwork}
                onBack={() => setActiveMode(null)}
                savedCount={savedCount}
              />
            )}
            
            {activeMode === 'booth-mode' && (
              <BoothOrganizer
                fairName={currentFair}
                onBack={() => setActiveMode(null)}
                savedCount={savedCount}
              />
            )}
            
            {activeMode === 'voice-notes' && (
              <div className="voice-notes-placeholder">
                <h2>{language === 'ko' ? '음성 메모 준비 중' : 'Voice Notes Coming Soon'}</h2>
                <Button onClick={() => setActiveMode(null)}>
                  {language === 'ko' ? '돌아가기' : 'Back'}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}