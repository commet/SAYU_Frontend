'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ContemplativeGallery from '@/components/gallery/ContemplativeGallery';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Footprints, Timer, Sparkles, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';

// 산책 모드 타입
type WalkMode = 'free' | 'themed' | 'deep' | 'memory';

const WALK_MODES = {
  free: {
    name: { ko: '자유 산책', en: 'Free Walk' },
    description: { 
      ko: '목적 없이 마음 가는 대로 둘러보기', 
      en: 'Wander freely without purpose' 
    },
    icon: '🚶',
    artworkCount: 20
  },
  themed: {
    name: { ko: '테마 산책', en: 'Themed Walk' },
    description: { 
      ko: '오늘의 감정과 어울리는 작품들', 
      en: 'Artworks matching today\'s mood' 
    },
    icon: '🎨',
    artworkCount: 10
  },
  deep: {
    name: { ko: '깊이 산책', en: 'Deep Walk' },
    description: { 
      ko: '소수의 작품을 깊이 있게 감상', 
      en: 'Deep contemplation of select works' 
    },
    icon: '🔍',
    artworkCount: 5
  },
  memory: {
    name: { ko: '회상 산책', en: 'Memory Walk' },
    description: { 
      ko: '과거에 감상했던 작품 다시 보기', 
      en: 'Revisit previously viewed artworks' 
    },
    icon: '💭',
    artworkCount: 8
  }
};

export default function ContemplativeWalkPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [selectedMode, setSelectedMode] = useState<WalkMode | null>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [walkStartTime, setWalkStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // 산책 시간 추적
  useEffect(() => {
    if (!walkStartTime) return;

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - walkStartTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [walkStartTime]);

  // 산책 모드 선택
  const selectWalkMode = async (mode: WalkMode) => {
    setSelectedMode(mode);
    setLoading(true);

    try {
      // TODO: 실제 API 호출로 모드별 작품 가져오기
      // const response = await fetch(`/api/contemplative/artworks?mode=${mode}`);
      
      // 임시 목업 데이터
      const mockArtworks = Array.from({ length: WALK_MODES[mode].artworkCount }, (_, i) => ({
        id: `${mode}-${i}`,
        title: `Contemplative Work ${i + 1}`,
        artist: 'Various Artists',
        year: '2020-2024',
        imageUrl: '/api/placeholder-image?type=backgrounds&name=gallery-space',
        description: 'A work that invites deep contemplation and personal reflection.',
        details: {
          medium: 'Mixed Media',
          dimensions: '100 x 80 cm',
          location: 'SAYU Collection'
        },
        emotionalTags: ['peaceful', 'introspective', 'mysterious']
      }));

      setArtworks(mockArtworks);
      setWalkStartTime(Date.now());
      
      toast.success(
        language === 'ko' 
          ? `${WALK_MODES[mode].name.ko} 시작합니다` 
          : `Starting ${WALK_MODES[mode].name.en}`
      );
    } catch (error) {
      console.error('Failed to load artworks:', error);
      toast.error(language === 'ko' ? '작품을 불러올 수 없습니다' : 'Failed to load artworks');
    } finally {
      setLoading(false);
    }
  };

  // 산책 종료
  const endWalk = () => {
    if (walkStartTime) {
      const duration = Math.floor((Date.now() - walkStartTime) / 1000);
      
      // 산책 기록 저장
      saveWalkSession(duration);
      
      toast.success(
        language === 'ko' 
          ? `${Math.floor(duration / 60)}분간의 산책을 마쳤습니다` 
          : `Completed ${Math.floor(duration / 60)} minutes of contemplation`
      );
    }
    
    setSelectedMode(null);
    setArtworks([]);
    setWalkStartTime(null);
    setElapsedTime(0);
  };

  // 산책 세션 저장
  const saveWalkSession = async (duration: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contemplative/walk-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mode: selectedMode,
          duration,
          artworkCount: artworks.length,
          timestamp: new Date()
        })
      });
    } catch (error) {
      console.error('Failed to save walk session:', error);
    }
  };

  // 시간 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* 헤더 */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => selectedMode ? endWalk() : router.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Footprints className="w-6 h-6 text-primary" />
                  {language === 'ko' ? '사유의 산책' : 'Contemplative Walk'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {selectedMode 
                    ? WALK_MODES[selectedMode].name[language]
                    : language === 'ko' 
                      ? '천천히 걸으며 예술과 대화하기'
                      : 'Walk slowly and converse with art'
                  }
                </p>
              </div>
            </div>
            
            {/* 산책 시간 표시 */}
            {walkStartTime && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Timer className="w-4 h-4" />
                <span className="font-mono">{formatTime(elapsedTime)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      {!selectedMode ? (
        // 모드 선택 화면
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* 안내 메시지 */}
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold">
                    {language === 'ko' 
                      ? '사유의 산책이란?' 
                      : 'What is Contemplative Walk?'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ko'
                      ? '급하게 스크롤하는 대신 한 작품씩 천천히 만나보세요. 각 작품 앞에서 충분한 시간을 가지고, 작품이 당신에게 말을 걸어올 때까지 기다려보세요.'
                      : 'Instead of scrolling quickly, meet each artwork slowly. Take enough time with each piece, and wait until the artwork speaks to you.'}
                  </p>
                </div>
              </div>
            </Card>

            {/* 산책 모드 선택 */}
            <div className="grid md:grid-cols-2 gap-4">
              {(Object.entries(WALK_MODES) as [WalkMode, typeof WALK_MODES[WalkMode]][]).map(([mode, info]) => (
                <motion.div
                  key={mode}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => selectWalkMode(mode)}
                  >
                    <div className="space-y-3">
                      <div className="text-3xl">{info.icon}</div>
                      <h3 className="text-lg font-semibold">
                        {info.name[language]}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {info.description[language]}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Sparkles className="w-3 h-3" />
                        <span>
                          {language === 'ko' 
                            ? `${info.artworkCount}개 작품` 
                            : `${info.artworkCount} artworks`}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* 팁 */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">
                {language === 'ko' ? '산책 팁' : 'Walking Tips'}
              </h4>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>
                    {language === 'ko'
                      ? '각 작품에 최소 30초 이상 머물러보세요'
                      : 'Stay with each artwork for at least 30 seconds'}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>
                    {language === 'ko'
                      ? '일시정지 버튼을 활용해 깊이 몰입하세요'
                      : 'Use the pause button to immerse deeply'}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>
                    {language === 'ko'
                      ? '떠오르는 생각이나 감정을 기록해보세요'
                      : 'Record any thoughts or emotions that arise'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        // 갤러리 뷰
        <ContemplativeGallery 
          artworks={artworks}
          onArtworkSelect={(artwork) => {
            console.log('Selected artwork:', artwork);
          }}
        />
      )}

      {/* 산책 종료 버튼 */}
      {selectedMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Button
            onClick={endWalk}
            size="lg"
            variant="outline"
            className="gap-2 shadow-lg"
          >
            <Footprints className="w-4 h-4" />
            {language === 'ko' ? '산책 마치기' : 'End Walk'}
          </Button>
        </motion.div>
      )}
    </div>
  );
}