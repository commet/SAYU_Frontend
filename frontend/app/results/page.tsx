'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { EmotionalCard, ArtworkCard, EmotionalButton } from '@/components/emotional/EmotionalCard';
import { Heart, Sparkles, Map, Share2, BookOpen, Palette } from 'lucide-react';
import '@/styles/emotional-palette.css';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/ui/LanguageToggle';

interface QuizResults {
  personalityType: string;
  scores: Record<string, number>;
  responses: any[];
  completedAt: string;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [personality, setPersonality] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const storedResults = localStorage.getItem('quizResults');
    if (storedResults) {
      const parsed = JSON.parse(storedResults);
      setResults(parsed);
      
      const type = searchParams.get('type') || parsed.personalityType;
      const personalityData = personalityDescriptions[type];
      setPersonality(personalityData);
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

  const shareResult = () => {
    // Implementation for sharing
    setShowShareModal(true);
  };

  return (
    <div className="min-h-screen gradient-revelation" data-personality={results.personalityType}>
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle variant="glass" />
      </div>
      
      {/* Hero Section - About You */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.390, 0.575, 0.565, 1.000] }}
          className="max-w-4xl w-full text-center text-white"
        >
          {/* Personality Title */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-12"
          >
            <p className="text-xl mb-4 opacity-80">
              {language === 'ko' ? '당신은' : 'You are'}
            </p>
            <h1 className="text-5xl md:text-7xl font-serif mb-6">
              {language === 'ko' && personality.title_ko ? personality.title_ko : personality.title}
            </h1>
            <p className="text-2xl opacity-90 italic mb-6">
              {language === 'ko' && personality.subtitle_ko ? personality.subtitle_ko : personality.subtitle}
            </p>
            {/* Personality Type Code */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
              <span className="text-sm opacity-70">
                {language === 'ko' ? '유형 코드' : 'Type Code'}:
              </span>
              <span className="font-mono font-bold text-lg">
                {results.personalityType}
              </span>
            </div>
          </motion.div>

          {/* Personality Code Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-2xl mx-auto"
          >
            <h3 className="text-lg font-medium mb-4 opacity-90">
              {language === 'ko' ? '당신의 예술 감상 스타일' : 'Your Art Appreciation Style'}
            </h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-mono text-2xl font-bold mb-1">{results.personalityType[0]}</div>
                <div className="opacity-70">
                  {results.personalityType[0] === 'L' 
                    ? (language === 'ko' ? '고독한' : 'Lone') 
                    : (language === 'ko' ? '사교적' : 'Social')}
                </div>
              </div>
              <div className="text-center">
                <div className="font-mono text-2xl font-bold mb-1">{results.personalityType[1]}</div>
                <div className="opacity-70">
                  {results.personalityType[1] === 'A' 
                    ? (language === 'ko' ? '추상' : 'Abstract') 
                    : (language === 'ko' ? '구상' : 'Representational')}
                </div>
              </div>
              <div className="text-center">
                <div className="font-mono text-2xl font-bold mb-1">{results.personalityType[2]}</div>
                <div className="opacity-70">
                  {results.personalityType[2] === 'E' 
                    ? (language === 'ko' ? '감정적' : 'Emotional') 
                    : (language === 'ko' ? '의미추구' : 'Meaning')}
                </div>
              </div>
              <div className="text-center">
                <div className="font-mono text-2xl font-bold mb-1">{results.personalityType[3]}</div>
                <div className="opacity-70">
                  {results.personalityType[3] === 'F' 
                    ? (language === 'ko' ? '흐름따라' : 'Flow') 
                    : (language === 'ko' ? '체계적' : 'Constructive')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Core Essence */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-10 mb-12"
          >
            <Heart className="w-12 h-12 mx-auto mb-6 text-white/80" />
            <p className="text-xl leading-relaxed mb-8">
              {language === 'ko' && personality.essence_ko ? personality.essence_ko : personality.essence}
            </p>
            
            {/* Your Strengths */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {personality.strengths.map((strength: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-white/5 rounded-2xl p-6"
                >
                  <div className="text-3xl mb-3">{strength.icon}</div>
                  <h3 className="font-medium mb-2">
                    {language === 'ko' && strength.title_ko ? strength.title_ko : strength.title}
                  </h3>
                  <p className="text-sm opacity-80">
                    {language === 'ko' && strength.description_ko ? strength.description_ko : strength.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recognition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-serif mb-6">
              {language === 'ko' ? '당신은 이런 모습을 발견할 수 있습니다...' : 'You might recognize yourself in...'}
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {personality.recognition.map((item: string, index: number) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full"
                >
                  {language === 'ko' && personality.recognition_ko ? personality.recognition_ko[index] : item}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How This Extends to Life */}
      <section className="bg-[hsl(var(--gallery-white))] py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--personality-accent))]" />
            <h2 className="text-4xl font-serif mb-4 text-[hsl(var(--journey-midnight))]">
              {language === 'ko' ? '이것은 갤러리를 넘어석니다' : 'This extends beyond galleries'}
            </h2>
            <p className="text-xl text-[hsl(var(--journey-twilight))] max-w-3xl mx-auto">
              {language === 'ko' && personality.lifeExtension_ko ? personality.lifeExtension_ko : personality.lifeExtension}
            </p>
          </motion.div>

          {/* Life Areas */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {personality.lifeAreas.map((area: any, index: number) => (
              <EmotionalCard
                key={index}
                delay={index * 0.1}
                personality={results.personalityType}
                className="p-8"
              >
                <h3 className="text-xl font-medium mb-3">
                  {language === 'ko' && area.title_ko ? area.title_ko : area.title}
                </h3>
                <p className="opacity-80">
                  {language === 'ko' && area.description_ko ? area.description_ko : area.description}
                </p>
              </EmotionalCard>
            ))}
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
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
              {language === 'ko' ? '당신의 언어로 말하는 예술가들' : 'Artists who speak your language'}
            </h2>
            <p className="text-xl text-[hsl(var(--journey-twilight))]">
              {language === 'ko' ? '당신만의 독특한 예술 경험 방식에 기반하여' : 'Based on your unique way of experiencing art'}
            </p>
          </motion.div>

          {/* Artist Recommendations */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {personality.recommendedArtists.map((artist: any, index: number) => (
              <ArtworkCard
                key={index}
                image={artist.image}
                title={artist.name}
                artist={artist.period}
                description={artist.whyYouConnect}
                emotionalTag={artist.emotionalTag}
                personality={results.personalityType}
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Current Exhibitions */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-2xl font-serif mb-8 text-[hsl(var(--journey-midnight))]">
              {language === 'ko' ? '당신을 기다리는 전시회' : 'Exhibitions waiting for you'}
            </h3>
            <EmotionalButton
              variant="primary"
              size="lg"
              personality={results.personalityType}
              onClick={() => router.push('/exhibitions')}
            >
              <Map className="w-5 h-5" />
              {language === 'ko' ? '나의 예술 지도 탐험하기' : 'Explore Your Art Map'}
            </EmotionalButton>
          </motion.div>
        </div>
      </section>

      {/* Share Your Journey */}
      <section className="py-20 px-4 text-center bg-[hsl(var(--gallery-pearl))]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-serif mb-6 text-[hsl(var(--journey-midnight))]">
            {language === 'ko' ? '당신의 예술적 영혼을 공유하세요' : 'Share your artistic soul'}
          </h2>
          <p className="text-lg mb-8 text-[hsl(var(--journey-twilight))] max-w-2xl mx-auto">
            {language === 'ko' 
              ? '다른 사람들이 자신만의 여정을 발견하도록 돕거나, 당신처럼 세상을 보는 비슷한 영혼을 찾아보세요' 
              : 'Let others discover their own journey, or find kindred spirits who see the world as you do'
            }
          </p>
          <div className="flex justify-center gap-4">
            <EmotionalButton
              variant="primary"
              onClick={shareResult}
              personality={results.personalityType}
            >
              <Share2 className="w-5 h-5" />
              {language === 'ko' ? '내 유형 공유하기' : 'Share Your Type'}
            </EmotionalButton>
            <EmotionalButton
              variant="ghost"
              onClick={() => router.push('/community')}
              personality={results.personalityType}
            >
              <BookOpen className="w-5 h-5" />
              {language === 'ko' ? '나의 부족 찾기' : 'Find Your Tribe'}
            </EmotionalButton>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default function ResultsPage() {
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