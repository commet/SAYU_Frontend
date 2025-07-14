'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { EmotionalCard, ArtworkCard, EmotionalButton } from '@/components/emotional/EmotionalCard';
import { Heart, Sparkles, Map, Share2, BookOpen, Palette, User, ChevronLeft, ChevronRight } from 'lucide-react';
import '@/styles/emotional-palette.css';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { getAnimalByType } from '@/data/personality-animals';
import { PersonalityAnimalImage } from '@/components/ui/PersonalityAnimalImage';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGamificationDashboard } from '@/hooks/useGamification';
import LanguageToggle from '@/components/ui/LanguageToggle';
import ShareModal from '@/components/share/ShareModal';
import ProfileIDCard from '@/components/profile/ProfileIDCard';
import PersonalityArtworkGallery from '@/components/artvee/PersonalityArtworkGallery';
import ArtworkImage from '@/components/artvee/ArtworkImage';
import { usePersonalityArtworks } from '@/hooks/useArtvee';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface QuizResults {
  personalityType: string;
  scores: Record<string, number>;
  responses: any[];
  completedAt: string;
}

// Artvee 작품 추천 섹션 컴포넌트
function ArtveeRecommendationSection({ 
  personalityType, 
  personality 
}: { 
  personalityType: string;
  personality: any;
}) {
  const { language } = useLanguage();
  const { data: artworks, isLoading } = usePersonalityArtworks(personalityType);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 작품 3개씩 보여주기
  const itemsPerPage = 3;
  const totalPages = Math.ceil((artworks?.length || 0) / itemsPerPage);
  const currentArtworks = artworks?.slice(
    currentIndex * itemsPerPage, 
    (currentIndex + 1) * itemsPerPage
  ) || [];

  const nextPage = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[hsl(var(--gallery-white))] to-[hsl(var(--gallery-pearl))]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Palette className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--personality-accent))]" />
          <h2 className="text-4xl font-serif mb-4 text-[hsl(var(--journey-midnight))]">
            {language === 'ko' ? '당신을 위한 맞춤 작품들' : 'Curated Artworks For You'}
          </h2>
          <p className="text-xl text-[hsl(var(--journey-twilight))] max-w-3xl mx-auto">
            {language === 'ko' 
              ? `${personality.title_ko || personality.title}의 감성에 어울리는 작품들을 만나보세요`
              : `Discover artworks that resonate with your ${personality.title} sensibility`
            }
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800" />
            ))}
          </div>
        ) : (
          <>
            {/* 작품 캐러셀 */}
            <div className="relative">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                {currentArtworks.map((artwork, index) => (
                  <motion.div
                    key={artwork.artveeId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer"
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="aspect-[4/3] relative">
                        <ArtworkImage
                          artveeId={artwork.artveeId}
                          size="medium"
                          artwork={artwork}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-900">
                        <h3 className="font-semibold text-lg mb-1 truncate">{artwork.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{artwork.artist}</p>
                        {artwork.year && (
                          <p className="text-gray-500 dark:text-gray-500 text-xs">{artwork.year}</p>
                        )}
                        
                        {/* 작품과 성격 유형의 연관성 설명 */}
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            {language === 'ko' 
                              ? getArtworkConnection(personalityType, artwork, 'ko')
                              : getArtworkConnection(personalityType, artwork, 'en')
                            }
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* 네비게이션 버튼 */}
              {totalPages > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-1/2 -left-12 transform -translate-y-1/2"
                    onClick={prevPage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-1/2 -right-12 transform -translate-y-1/2"
                    onClick={nextPage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            {/* 페이지 인디케이터 */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentIndex 
                        ? 'bg-[hsl(var(--personality-accent))]' 
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                    onClick={() => setCurrentIndex(i)}
                  />
                ))}
              </div>
            )}

            {/* 전체 갤러리 보기 버튼 */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <EmotionalButton
                variant="primary"
                size="lg"
                personality={personalityType}
                onClick={() => window.location.href = `/gallery/${personalityType}`}
              >
                <Palette className="w-5 h-5" />
                {language === 'ko' ? '나의 전체 아트 갤러리 보기' : 'View My Complete Art Gallery'}
              </EmotionalButton>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}

// 작품과 성격 유형의 연관성 설명을 생성하는 헬퍼 함수
function getArtworkConnection(personalityType: string, artwork: any, language: 'ko' | 'en'): string {
  // 성격 유형에 따른 연관성 설명 로직
  const connections = {
    LAEF: {
      ko: '감정의 깊이와 색채의 대담함이 당신의 내면과 공명합니다',
      en: 'The emotional depth and bold colors resonate with your inner world'
    },
    LAEC: {
      ko: '섬세한 구성과 조화로운 색감이 당신의 미적 감각과 어울립니다',
      en: 'The delicate composition and harmonious colors match your aesthetic sense'
    },
    // ... 다른 유형들 추가
  };

  return connections[personalityType]?.[language] || 
    (language === 'ko' ? '당신의 예술적 감성과 잘 어울리는 작품입니다' : 'This artwork aligns well with your artistic sensibility');
}

// 메인 결과 컴포넌트 (기존 코드에 ArtveeRecommendationSection 추가)
function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  const { dashboard: gamificationData, isLoading: gamificationLoading } = useGamificationDashboard();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [personality, setPersonality] = useState<any>(null);
  const [animalCharacter, setAnimalCharacter] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);

  useEffect(() => {
    const storedResults = localStorage.getItem('quizResults');
    if (storedResults) {
      const parsed = JSON.parse(storedResults);
      setResults(parsed);
      
      const type = searchParams.get('type') || parsed.personalityType;
      const personalityData = personalityDescriptions[type];
      const animalData = getAnimalByType(type);
      
      setPersonality(personalityData);
      setAnimalCharacter(animalData);
    } else {
      router.push('/quiz');
    }
  }, [searchParams, router]);

  if (!results || !personality) {
    return (
      <div className="min-h-screen gradient-revelation flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-white/50" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-revelation" data-personality={results.personalityType}>
      {/* 기존 Hero Section과 다른 섹션들 유지 */}
      {/* ... (기존 코드) ... */}

      {/* Artvee 작품 추천 섹션 추가 */}
      <ArtveeRecommendationSection 
        personalityType={results.personalityType} 
        personality={personality}
      />

      {/* 기존 나머지 섹션들 */}
      {/* ... (기존 코드) ... */}
    </div>
  );
}

export default function EnhancedResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-revelation flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-white/50" />
        </motion.div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}