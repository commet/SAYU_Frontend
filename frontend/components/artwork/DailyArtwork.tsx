'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Artwork } from '@/lib/museums/api-client';
import ArtworkRecommendationCard from './ArtworkRecommendationCard';

interface DailyArtworkProps {
  personalityType: string;
}

export default function DailyArtwork({ personalityType }: DailyArtworkProps) {
  const { language } = useLanguage();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyArtwork = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/artworks?personality=${personalityType}&action=daily`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily artwork');
      }
      
      const data = await response.json();
      setArtwork(data.artwork);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyArtwork();
  }, [personalityType]);

  const getPersonalityDescription = (type: string) => {
    const descriptions: Record<string, { ko: string; en: string }> = {
      'LAEF': { 
        ko: '색채의 속삭임을 위한 오늘의 작품', 
        en: "Today's artwork for The Whisper of Colors" 
      },
      'LAEC': { 
        ko: '개념의 무용수를 위한 오늘의 작품', 
        en: "Today's artwork for The Dancer of Concepts" 
      },
      // Add more personality descriptions...
    };
    
    return descriptions[type] || { 
      ko: '당신을 위한 오늘의 작품', 
      en: "Today's artwork for you" 
    };
  };

  return (
    <div className="daily-artwork-section">
      <motion.header 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold">
            {language === 'ko' ? '오늘의 추천 작품' : 'Daily Recommendation'}
          </h2>
          <Sparkles className="w-6 h-6 text-purple-600" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {getPersonalityDescription(personalityType)[language]}
        </p>
      </motion.header>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            className="flex justify-center items-center h-96"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
              <p>{language === 'ko' ? '작품 불러오는 중...' : 'Loading artwork...'}</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            className="text-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchDailyArtwork}>
              {language === 'ko' ? '다시 시도' : 'Try Again'}
            </Button>
          </motion.div>
        ) : artwork ? (
          <motion.div
            key="artwork"
            className="max-w-md mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <ArtworkRecommendationCard
              artwork={artwork}
              matchReasons={[
                language === 'ko' 
                  ? '당신의 성향에 맞춤' 
                  : 'Matched to your personality'
              ]}
            />
            
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {language === 'ko' 
                  ? '매일 새로운 작품이 추천됩니다' 
                  : 'A new artwork is recommended daily'}
              </p>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}