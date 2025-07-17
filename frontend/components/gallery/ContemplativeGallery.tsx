'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useContemplativeTracking } from '@/hooks/useContemplativeTracking';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Eye, 
  Pause, 
  Play, 
  ZoomIn, 
  Info, 
  Heart, 
  MessageCircle,
  Clock,
  Sparkles,
  ChevronDown,
  X
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  description?: string;
  details?: {
    medium: string;
    dimensions: string;
    location: string;
  };
  emotionalTags?: string[];
}

interface ContemplativeGalleryProps {
  artworks: Artwork[];
  onArtworkSelect?: (artwork: Artwork) => void;
  className?: string;
}

// 프롬프트 메시지
const PROMPT_MESSAGES = {
  pause: {
    ko: '잠시 멈추셨네요',
    en: 'You paused here',
    sub: {
      ko: '이 작품이 당신을 끌어당기나요?',
      en: 'Does this artwork draw you in?'
    }
  },
  discover: {
    ko: '자세히 들여다보세요',
    en: 'Look closer',
    sub: {
      ko: '숨겨진 디테일을 발견할 수 있을 거예요',
      en: 'You might discover hidden details'
    }
  },
  connect: {
    ko: '연결점을 찾으셨나요?',
    en: 'Finding connections?',
    sub: {
      ko: '이 작품이 떠올리게 하는 것은 무엇인가요?',
      en: 'What does this artwork remind you of?'
    }
  },
  reflect: {
    ko: '깊은 감상 중이시네요',
    en: 'Deep in contemplation',
    sub: {
      ko: '이 순간을 기록하시겠어요?',
      en: 'Would you like to record this moment?'
    }
  }
};

export default function ContemplativeGallery({ 
  artworks, 
  onArtworkSelect,
  className 
}: ContemplativeGalleryProps) {
  const { language } = useLanguage();
  const tracking = useContemplativeTracking();
  const [focusedArtwork, setFocusedArtwork] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [scrollingSpeed, setScrollingSpeed] = useState<'fast' | 'normal' | 'slow'>('normal');
  const [isPaused, setIsPaused] = useState(false);
  
  const galleryRef = useRef<HTMLDivElement>(null);
  const artworkRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const { scrollY } = useScroll();
  
  // 스크롤 속도 감지
  useMotionValueEvent(scrollY, "change", (latest) => {
    tracking.trackScrollSpeed();
    
    // 스크롤 속도에 따른 UI 변화
    const speed = scrollY.getVelocity();
    if (Math.abs(speed) > 1000) {
      setScrollingSpeed('fast');
    } else if (Math.abs(speed) < 100) {
      setScrollingSpeed('slow');
    } else {
      setScrollingSpeed('normal');
    }
  });
  
  // Intersection Observer로 작품 감상 추적 (최적화됨)
  useEffect(() => {
    
    // Observer 생성 (한 번만)
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const artworkId = entry.target.getAttribute('data-artwork-id');
            if (!artworkId) return;
            
            if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
              // 70% 이상 보이면 감상 시작
              setFocusedArtwork(artworkId);
              tracking.startViewing(artworkId);
            } else if (!entry.isIntersecting && tracking.currentArtwork === artworkId) {
              // 화면에서 벗어나면 감상 종료
              tracking.endViewing(artworkId);
              setFocusedArtwork(null);
            }
          });
        },
        {
          threshold: [0, 0.3, 0.7, 1],
          rootMargin: '-10% 0px'
        }
      );
    }
    
    const observer = observerRef.current;
    
    // 현재 작품들 관찰
    const currentRefs = new Map(artworkRefs.current);
    currentRefs.forEach((element) => {
      observer.observe(element);
    });
    
    // 클린업: 이전 요소들 관찰 해제
    return () => {
      currentRefs.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, [artworks.length, tracking]); // artworks 배열 대신 길이만 의존성으로
  
  // 작품 상세 정보 토글
  const toggleDetails = (artworkId: string) => {
    setShowDetails(prev => prev === artworkId ? null : artworkId);
    tracking.recordInteraction('info');
  };
  
  // 확대 보기
  const handleZoom = (artworkId: string) => {
    tracking.recordInteraction('zoom');
    // TODO: 확대 모달 구현
  };
  
  // 일시정지 모드
  const togglePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      tracking.recordInteraction('pause');
      // 스크롤 비활성화
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };
  
  return (
    <div 
      ref={galleryRef}
      className={cn(
        "relative min-h-screen",
        isPaused && "pointer-events-none",
        className
      )}
    >
      {/* 스크롤 속도 인디케이터 */}
      <AnimatePresence>
        {scrollingSpeed === 'fast' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card className="px-4 py-2 bg-yellow-50 border-yellow-200">
              <p className="text-sm text-yellow-800">
                {language === 'ko' ? '천천히 감상해보세요 🎨' : 'Take your time 🎨'}
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 일시정지 컨트롤 */}
      <motion.button
        className="fixed bottom-8 right-8 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePause}
      >
        <Card className="p-3 shadow-lg cursor-pointer">
          {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
        </Card>
      </motion.button>
      
      {/* 작품 목록 */}
      <div className="space-y-[50vh]"> {/* 큰 간격으로 한 번에 한 작품만 */}
        {artworks.map((artwork, index) => (
          <motion.div
            key={artwork.id}
            ref={(el) => {
              if (el) artworkRefs.current.set(artwork.id, el);
            }}
            data-artwork-id={artwork.id}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: focusedArtwork === artwork.id ? 1 : 0.3,
              scale: focusedArtwork === artwork.id ? 1 : 0.95
            }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex items-center justify-center px-4"
          >
            <div className="max-w-4xl w-full">
              {/* 작품 이미지 */}
              <div className="relative aspect-[4/3] mb-8 group">
                <Image
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  fill
                  className="object-contain"
                  priority={index < 2}
                />
                
                {/* 호버 시 나타나는 컨트롤 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: focusedArtwork === artwork.id ? 1 : 0 
                  }}
                  className="absolute inset-0 flex items-end justify-center pb-4"
                >
                  <div className="flex gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleZoom(artwork.id)}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleDetails(artwork.id)}
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              </div>
              
              {/* 작품 정보 */}
              <motion.div
                animate={{ 
                  opacity: focusedArtwork === artwork.id ? 1 : 0.5 
                }}
                className="text-center space-y-2"
              >
                <h2 className="text-2xl font-semibold">{artwork.title}</h2>
                <p className="text-lg text-muted-foreground">
                  {artwork.artist} • {artwork.year}
                </p>
                
                {/* 감상 시간 표시 */}
                {focusedArtwork === artwork.id && tracking.contemplationTime > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                  >
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(tracking.contemplationTime)}초</span>
                    <span className="text-xs">
                      ({tracking.viewingDepth === 'glance' && (language === 'ko' ? '흘깃' : 'Glance')}
                      {tracking.viewingDepth === 'observe' && (language === 'ko' ? '관찰' : 'Observe')}
                      {tracking.viewingDepth === 'contemplate' && (language === 'ko' ? '사색' : 'Contemplate')}
                      {tracking.viewingDepth === 'immerse' && (language === 'ko' ? '몰입' : 'Immerse')})
                    </span>
                  </motion.div>
                )}
              </motion.div>
              
              {/* 상세 정보 */}
              <AnimatePresence>
                {showDetails === artwork.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-4"
                  >
                    {artwork.description && (
                      <p className="text-muted-foreground">{artwork.description}</p>
                    )}
                    {artwork.details && (
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium">{language === 'ko' ? '매체' : 'Medium'}</p>
                          <p className="text-muted-foreground">{artwork.details.medium}</p>
                        </div>
                        <div>
                          <p className="font-medium">{language === 'ko' ? '크기' : 'Dimensions'}</p>
                          <p className="text-muted-foreground">{artwork.details.dimensions}</p>
                        </div>
                        <div>
                          <p className="font-medium">{language === 'ko' ? '소장처' : 'Location'}</p>
                          <p className="text-muted-foreground">{artwork.details.location}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* 감상 프롬프트 */}
      <AnimatePresence>
        {tracking.shouldPrompt && tracking.promptType && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card className="p-6 max-w-sm shadow-xl">
              <button
                onClick={tracking.dismissPrompt}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="text-center space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-primary" />
                <h3 className="font-semibold">
                  {PROMPT_MESSAGES[tracking.promptType][language]}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {PROMPT_MESSAGES[tracking.promptType].sub[language]}
                </p>
                
                {tracking.promptType === 'reflect' && (
                  <Button 
                    className="mt-4"
                    onClick={() => {
                      // TODO: 성찰 기록 모달 열기
                      tracking.dismissPrompt();
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {language === 'ko' ? '생각 기록하기' : 'Record Thoughts'}
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 일시정지 오버레이 */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 pointer-events-auto"
            onClick={togglePause}
          >
            <div className="h-full flex items-center justify-center">
              <Card className="p-8 text-center">
                <Pause className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">
                  {language === 'ko' ? '잠시 멈춤' : 'Paused'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ko' 
                    ? '이 순간을 음미해보세요' 
                    : 'Savor this moment'}
                </p>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}