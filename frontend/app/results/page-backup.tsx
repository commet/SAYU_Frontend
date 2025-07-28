'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Share2, 
  User, 
  MessageCircle,
  Palette,
  Calendar,
  Users,
  ArrowRight,
  Download,
  Star
} from 'lucide-react';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { getAnimalByType } from '@/data/personality-animals';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button-enhanced';
import APTResultReveal from '@/components/quiz/APTResultReveal';
import ShareModal from '@/components/share/ShareModal';
import { ArtCuratorChatbot } from '@/components/chatbot/ArtCuratorChatbot';
import { cn } from '@/lib/utils';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { PersonalityAnimalImage } from '@/components/ui/PersonalityAnimalImage';
import ProfileIDCard from '@/components/profile/ProfileIDCard';
import { useGamificationDashboard } from '@/hooks/useGamification';
import { EmotionalCard, ArtworkCard, EmotionalButton } from '@/components/emotional/EmotionalCard';
import ArtworkRecommendations from '@/components/results/ArtworkRecommendations';
import { ArtveeGallery } from '@/components/artvee/ArtveeGallery';
import '@/styles/emotional-palette.css';
import { Map, BookOpen } from 'lucide-react';

interface QuizResults {
  personalityType: string;
  scores: Record<string, number>;
  responses: any[];
  completedAt: string;
}

// 압축된 특성 카드
function CompactTraitCard({ 
  title, 
  content, 
  icon: Icon,
  color = "#6B5B95"
}: { 
  title: string; 
  content: string; 
  icon: any;
  color?: string;
}) {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

// 추천 섹션 (예술가/작품/전시회 통합)
function RecommendationSection({ personalityType, language }: { personalityType: string; language: 'ko' | 'en' }) {
  const [activeTab, setActiveTab] = useState<'artists' | 'artworks' | 'exhibitions'>('artworks');
  
  const tabs = [
    { id: 'artworks' as const, label: language === 'ko' ? '작품' : 'Artworks', icon: Palette },
    { id: 'artists' as const, label: language === 'ko' ? '작가' : 'Artists', icon: Users },
    { id: 'exhibitions' as const, label: language === 'ko' ? '전시' : 'Exhibitions', icon: Calendar }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* 탭 네비게이션 */}
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-all",
              activeTab === tab.id 
                ? "text-[#6B5B95] border-b-2 border-[#6B5B95] bg-[#6B5B95]/5" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 컨텐츠 영역 */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'artworks' && (
            <motion.div
              key="artworks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* 작품 미리보기 3개 */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-2">
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 group-hover:scale-105 transition-transform" />
                  </div>
                  <p className="text-sm font-medium">작품 제목 {i}</p>
                  <p className="text-xs text-gray-500">작가명</p>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'artists' && (
            <motion.div
              key="artists"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {/* 작가 리스트 3명 */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <p className="font-medium">작가 이름 {i}</p>
                    <p className="text-sm text-gray-500">대표 작품 스타일</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'exhibitions' && (
            <motion.div
              key="exhibitions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {/* 전시 목록 3개 */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg hover:border-[#6B5B95] transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">전시회 제목 {i}</h4>
                    <span className="text-xs bg-[#6B5B95]/10 text-[#6B5B95] px-2 py-1 rounded">추천</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">미술관 이름</p>
                  <p className="text-xs text-gray-500">2024.12.01 - 2025.02.28</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 더보기 버튼 */}
        <Button
          variant="ghost"
          fullWidth
          className="mt-4"
          onClick={() => {/* 해당 섹션으로 이동 */}}
        >
          {language === 'ko' ? '더 많은 추천 보기' : 'View More Recommendations'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [personality, setPersonality] = useState<any>(null);
  const [animalCharacter, setAnimalCharacter] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAPTReveal, setShowAPTReveal] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    const storedResults = localStorage.getItem('quizResults');
    if (storedResults) {
      const parsed = JSON.parse(storedResults);
      setResults(parsed);
      
      const type = searchParams?.get('type') || parsed.personalityType;
      const personalityData = personalityDescriptions[type];
      const animalData = getAnimalByType(type);
      
      setPersonality(personalityData);
      setAnimalCharacter(animalData);
    } else {
      router.push('/quiz');
    }
  }, [searchParams, router]);

  if (!results || !personality || !animalCharacter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Sparkles className="w-12 h-12 text-[#6B5B95]" />
        </motion.div>
      </div>
    );
  }

  // APT 결과 공개 애니메이션을 먼저 보여줌
  if (showAPTReveal) {
    return (
      <APTResultReveal
        aptCode={results.personalityType}
        animalName={language === 'ko' ? animalCharacter.name_ko : animalCharacter.name}
        animalEmoji={animalCharacter.emoji}
        description={language === 'ko' ? personality.description_ko : personality.description}
        artStyle={language === 'ko' ? personality.artStyle_ko : personality.artStyle}
        color={animalCharacter.color || '#6B5B95'}
        onComplete={() => setShowAPTReveal(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-off-white" data-personality={results.personalityType}>
      {/* Navigation Header */}
      <header className="bg-white border-b border-light-gray sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-lg py-md flex justify-between items-center">
          <h1 className="font-display text-xl font-medium text-black">
            {language === 'ko' ? '성격 결과' : 'Your Results'}
          </h1>
          <LanguageToggle />
        </div>
      </header>
      
      {/* Hero Section - Clean and Focused */}
      <section className="max-w-4xl mx-auto px-lg py-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          {/* Main Result */}
          <div className="bg-white rounded-xl p-lg border border-gray shadow-gentle mb-lg">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <p className="font-body text-dark-gray text-lg mb-sm">
                {language === 'ko' ? '당신은' : 'You are'}
              </p>
              
              <h1 className="font-display text-2xl md:text-3xl font-medium text-black mb-sm leading-tight">
                {language === 'ko' && personality.title_ko ? personality.title_ko : personality.title}
              </h1>
              
              <p className="font-body text-lg text-dark-gray mb-lg leading-normal">
                {language === 'ko' && personality.subtitle_ko ? personality.subtitle_ko : personality.subtitle}
              </p>

              {/* Animal Character - Simplified */}
              {animalCharacter && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="mb-lg"
                >
                  <PersonalityAnimalImage 
                    animal={animalCharacter}
                    variant="illustration"
                    size="sm"
                    className="mx-auto mb-sm"
                  />
                  <h3 className="font-display text-lg text-black mb-xs">
                    {language === 'ko' ? animalCharacter.animal_ko : animalCharacter.animal}
                  </h3>
                  <div className="flex flex-wrap justify-center gap-xs">
                    {(language === 'ko' ? animalCharacter.characteristics_ko : animalCharacter.characteristics)
                      .slice(0, 3) // 처음 3개만 표시
                      .map((trait: string, index: number) => (
                      <span key={index} className="font-body text-xs px-sm py-xs bg-off-white text-dark-gray rounded-full border border-light-gray">
                        {trait}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Type Code - Combined with Style Info */}
              <div className="mt-lg p-lg bg-off-white rounded-lg border border-light-gray">
                <div className="text-center mb-md">
                  <h3 className="font-display text-lg font-medium text-black mb-sm">
                    {language === 'ko' ? '당신의 예술 감상 스타일' : 'Your Art Appreciation Style'}
                  </h3>
                  <div className="flex items-center justify-center gap-sm mb-sm">
                    <span className="font-body text-sm text-dark-gray">
                      {language === 'ko' ? '유형 코드' : 'Type Code'}:
                    </span>
                    <span className="font-mono font-semibold text-xl text-black">
                      {results.personalityType}
                    </span>
                  </div>
                  <p className="text-sm text-dark-gray">
                    {language === 'ko' ? '4가지 차원으로 분석한 당신만의 예술 감상 방식' : 'Your unique art appreciation approach analyzed through 4 dimensions'}
                  </p>
                </div>
                
                {/* Quick Style Preview */}
                <div className="grid grid-cols-4 gap-xs text-center">
                  <div className="text-xs">
                    <span className="font-mono font-bold text-primary text-lg">{results.personalityType[0]}</span>
                    <p className="text-dark-gray mt-xs font-medium">
                      {results.personalityType[0] === 'L' 
                        ? (language === 'ko' ? '개인적 (Lone)' : 'Lone') 
                        : (language === 'ko' ? '사회적 (Social)' : 'Social')}
                    </p>
                  </div>
                  <div className="text-xs">
                    <span className="font-mono font-bold text-primary text-lg">{results.personalityType[1]}</span>
                    <p className="text-dark-gray mt-xs font-medium">
                      {results.personalityType[1] === 'A' 
                        ? (language === 'ko' ? '추상적 (Abstract)' : 'Abstract') 
                        : (language === 'ko' ? '현실적 (Realistic)' : 'Realistic')}
                    </p>
                  </div>
                  <div className="text-xs">
                    <span className="font-mono font-bold text-primary text-lg">{results.personalityType[2]}</span>
                    <p className="text-dark-gray mt-xs font-medium">
                      {results.personalityType[2] === 'E' 
                        ? (language === 'ko' ? '감정적 (Emotional)' : 'Emotional') 
                        : (language === 'ko' ? '의미적 (Meaningful)' : 'Meaningful')}
                    </p>
                  </div>
                  <div className="text-xs">
                    <span className="font-mono font-bold text-primary text-lg">{results.personalityType[3]}</span>
                    <p className="text-dark-gray mt-xs font-medium">
                      {results.personalityType[3] === 'F' 
                        ? (language === 'ko' ? '유동적인 (Flow)' : 'Flow') 
                        : (language === 'ko' ? '체계적 (Consistent)' : 'Consistent')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-sm mb-xl"
          >
            <button
              onClick={shareResult}
              className="flex items-center gap-xs px-md py-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-base font-medium text-sm"
            >
              <Share2 size={14} />
              {language === 'ko' ? '결과 공유' : 'Share'}
            </button>
            <button
              onClick={showProfile}
              className="flex items-center gap-xs px-md py-sm bg-off-white text-black border border-gray rounded-md hover:bg-light-gray transition-colors duration-base font-medium text-sm"
            >
              <User size={14} />
              {language === 'ko' ? 'ID 카드' : 'ID Card'}
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* AI Art Profile CTA Section */}
      <section className="max-w-4xl mx-auto px-lg mb-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-lg border border-purple-200 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -mr-24 -mt-24"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-md">
              <div className="flex items-center gap-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-black leading-snug">
                    {language === 'ko' ? 'AI 아트 프로필' : 'AI Art Profile'}
                  </h3>
                  <p className="text-sm text-dark-gray mt-1 leading-relaxed">
                    {language === 'ko' ? '당신의 성격을 AI 아트로 표현해보세요' : 'Express your personality through AI art'}
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-dark-gray mb-md leading-relaxed">
              {language === 'ko' 
                ? `${results.personalityType} 성격 유형에 맞는 독특한 AI 아트를 생성해드립니다. 당신만의 예술적 정체성을 시각적으로 표현해보세요.`
                : `Generate unique AI art tailored to your ${results.personalityType} personality type. Express your artistic identity visually.`}
            </p>
            
            <button
              onClick={() => router.push('/profile/art-profile')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-lg py-sm rounded-md hover:from-purple-700 hover:to-pink-700 transition-all duration-base font-medium text-sm flex items-center gap-xs"
            >
              <Sparkles size={16} />
              {language === 'ko' ? 'AI 아트 생성하기' : 'Generate AI Art'}
            </button>
          </div>
        </motion.div>
      </section>

      {/* Guest User Registration CTA */}
      {!authLoading && !user && (
        <section className="max-w-4xl mx-auto px-lg mb-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-lg border border-blue-200 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -ml-24 -mt-24"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-md">
                <div className="flex items-center gap-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-black leading-snug">
                      {language === 'ko' ? '결과를 저장하고 더 많은 혜택을 받으세요!' : 'Save Your Results & Get More Benefits!'}
                    </h3>
                    <p className="text-sm text-dark-gray mt-1 leading-relaxed">
                      {language === 'ko' ? '회원가입하면 무료로 더 많은 서비스를 이용하실 수 있습니다' : 'Sign up to access more free services'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-sm mb-md">
                <div className="text-center p-sm bg-white/50 rounded-lg">
                  <div className="text-2xl mb-xs">🎨</div>
                  <p className="text-xs text-dark-gray">
                    {language === 'ko' ? '개인화된 작품 추천' : 'Personalized Art Recommendations'}
                  </p>
                </div>
                <div className="text-center p-sm bg-white/50 rounded-lg">
                  <div className="text-2xl mb-xs">📱</div>
                  <p className="text-xs text-dark-gray">
                    {language === 'ko' ? '결과 영구 저장' : 'Save Results Forever'}
                  </p>
                </div>
                <div className="text-center p-sm bg-white/50 rounded-lg">
                  <div className="text-2xl mb-xs">🌟</div>
                  <p className="text-xs text-dark-gray">
                    {language === 'ko' ? '전시회 맞춤 추천' : 'Curated Exhibition Recommendations'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-sm">
                <button
                  onClick={() => router.push('/register')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-lg py-sm rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-base font-medium text-sm flex items-center justify-center gap-xs"
                >
                  <User size={16} />
                  {language === 'ko' ? '무료 회원가입' : 'Sign Up Free'}
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="px-lg py-sm bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-base font-medium text-sm"
                >
                  {language === 'ko' ? '로그인' : 'Login'}
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-lg pb-3xl space-y-3xl">
        
        {/* Art Style Breakdown - Enhanced */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-xl border border-gray shadow-gentle"
        >
          <h2 className="font-display text-2xl font-medium text-black mb-lg text-center">
            {language === 'ko' ? '당신의 예술 감상 스타일' : 'Your Art Appreciation Style'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg mb-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-off-white rounded-lg flex items-center justify-center mb-sm mx-auto">
                <span className="font-mono text-2xl font-bold text-primary">{results.personalityType[0]}</span>
              </div>
              <h3 className="font-medium text-sm text-black mb-xs">
                {results.personalityType[0] === 'L' 
                  ? (language === 'ko' ? '개인적 감상 (Lone)' : 'Personal (Lone)') 
                  : (language === 'ko' ? '사회적 감상 (Social)' : 'Social')}
              </h3>
              <p className="font-body text-xs text-dark-gray leading-relaxed">
                {results.personalityType[0] === 'L' 
                  ? (language === 'ko' ? '조용한 공간에서 작품과의 개인적 대화, 내적 성찰을 통한 깊은 감상' : 'Personal dialogue with artworks in quiet spaces, deep appreciation through inner reflection') 
                  : (language === 'ko' ? '타인과의 토론과 공유를 통한 예술 경험, 집단적 감상과 다양한 관점 교류' : 'Artistic experiences through discussion and sharing, collective appreciation and diverse perspective exchange')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-off-white rounded-lg flex items-center justify-center mb-sm mx-auto">
                <span className="font-mono text-2xl font-bold text-primary">{results.personalityType[1]}</span>
              </div>
              <h3 className="font-medium text-sm text-black mb-xs">
                {results.personalityType[1] === 'A' 
                  ? (language === 'ko' ? '추상적 (Abstract)' : 'Abstract') 
                  : (language === 'ko' ? '현실적 (Realistic)' : 'Realistic')}
              </h3>
              <p className="font-body text-xs text-dark-gray leading-relaxed">
                {results.personalityType[1] === 'A' 
                  ? (language === 'ko' ? '색채와 형태의 추상적 조화, 내면의 감정을 표현하는 작품에 끌림' : 'Drawn to abstract harmony of color and form, works expressing inner emotions') 
                  : (language === 'ko' ? '사실적 묘사와 정교한 기법, 구체적인 대상의 세밀한 표현에 주목' : 'Focus on realistic depiction and refined technique, detailed representation of concrete subjects')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-off-white rounded-lg flex items-center justify-center mb-sm mx-auto">
                <span className="font-mono text-2xl font-bold text-primary">{results.personalityType[2]}</span>
              </div>
              <h3 className="font-medium text-sm text-black mb-xs">
                {results.personalityType[2] === 'E' 
                  ? (language === 'ko' ? '감정적 (Emotional)' : 'Emotional') 
                  : (language === 'ko' ? '의미적 (Meaningful)' : 'Meaningful')}
              </h3>
              <p className="font-body text-xs text-dark-gray leading-relaxed">
                {results.personalityType[2] === 'E' 
                  ? (language === 'ko' ? '순간적 감동과 미적 체험, 작품이 주는 즉각적 감정에 반응' : 'Immediate aesthetic experience and emotional impact, responding to artwork\'s instant emotional appeal') 
                  : (language === 'ko' ? '작품의 역사적 맥락과 상징적 의미, 깊이 있는 해석과 분석 선호' : 'Historical context and symbolic meaning of artworks, preferring in-depth interpretation and analysis')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-off-white rounded-lg flex items-center justify-center mb-sm mx-auto">
                <span className="font-mono text-2xl font-bold text-primary">{results.personalityType[3]}</span>
              </div>
              <h3 className="font-medium text-sm text-black mb-xs">
                {results.personalityType[3] === 'F' 
                  ? (language === 'ko' ? '유동적인 (Flow)' : 'Flow') 
                  : (language === 'ko' ? '체계적 (Consistent)' : 'Consistent')}
              </h3>
              <p className="font-body text-xs text-dark-gray leading-relaxed">
                {results.personalityType[3] === 'F' 
                  ? (language === 'ko' ? '자유로운 관람 동선과 직관적 작품 선택, 다양한 장르의 실험적 탐구' : 'Free-flowing gallery movement and intuitive artwork selection, experimental exploration across genres') 
                  : (language === 'ko' ? '체계적인 관람 계획과 일관된 미적 기준, 선호하는 스타일의 깊이 있는 연구' : 'Systematic viewing plans and consistent aesthetic criteria, in-depth study of preferred styles')}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Core Essence */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-xl border border-gray shadow-gentle text-center"
        >
          <Palette className="w-10 h-10 mx-auto mb-md text-primary" />
          <h2 className="font-display text-xl font-medium text-black mb-md">
            {language === 'ko' ? '당신의 예술적 특성' : 'Your Artistic Nature'}
          </h2>
          <p className="font-body text-base text-dark-gray leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
            {language === 'ko' && personality.essence_ko ? personality.essence_ko : personality.essence}
          </p>
        </motion.section>
        
        {/* Your Strengths & Growth Areas */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl p-xl border border-gray shadow-gentle"
        >
          <h2 className="font-display text-2xl font-medium text-black mb-lg text-center">
            {language === 'ko' ? '당신의 예술적 강점' : 'Your Artistic Strengths'}
          </h2>
          <div className="grid md:grid-cols-3 gap-lg mb-xl">
            {personality.strengths.map((strength: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="text-center p-lg bg-off-white rounded-lg"
              >
                <div className="text-3xl mb-sm">{strength.icon}</div>
                <h3 className="font-display text-base font-medium text-black mb-xs">
                  {language === 'ko' && strength.title_ko ? strength.title_ko : strength.title}
                </h3>
                <p className="font-body text-sm text-dark-gray leading-normal">
                  {language === 'ko' && strength.description_ko ? strength.description_ko : strength.description}
                </p>
              </motion.div>
            ))}
          </div>
          
          {/* Growth Areas */}
          <div className="border-t border-light-gray pt-lg">
            <h3 className="font-display text-lg font-medium text-black mb-md text-center">
              {language === 'ko' ? '미술 감상 보완점' : 'Areas for Artistic Growth'}
            </h3>
            <div className="grid md:grid-cols-2 gap-md">
              <div className="text-center p-md bg-yellow-50 rounded-lg">
                <div className="text-xl mb-xs">🎭</div>
                <h4 className="font-medium text-sm text-black mb-xs">
                  {language === 'ko' ? '감정적 즉흥성 탐구' : 'Exploring Emotional Spontaneity'}
                </h4>
                <p className="text-xs text-dark-gray">
                  {language === 'ko' ? '작품을 분석하기 전에 첫인상과 감정적 반응을 경험해보세요' : 'Experience first impressions and emotional reactions before analyzing artworks'}
                </p>
              </div>
              <div className="text-center p-md bg-blue-50 rounded-lg">
                <div className="text-xl mb-xs">🌊</div>
                <h4 className="font-medium text-sm text-black mb-xs">
                  {language === 'ko' ? '다양한 장르 도전' : 'Exploring Diverse Genres'}
                </h4>
                <p className="text-xs text-dark-gray">
                  {language === 'ko' ? '체계적 접근과 함께 실험적이고 현대적인 작품도 탐험해보세요' : 'Along with systematic approaches, explore experimental and contemporary works'}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Recognition */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl p-xl border border-gray shadow-gentle"
        >
          <h2 className="font-display text-xl font-medium text-black mb-lg text-center">
            {language === 'ko' ? '미술관에서 이런 모습이 보이나요?' : 'Do you see yourself in the gallery?'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
            {personality.recognition.map((item: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 + index * 0.05 }}
                className="text-center p-sm bg-off-white rounded-lg border border-light-gray"
              >
                <div className="text-lg mb-xs">🎨</div>
                <p className="font-body text-xs text-dark-gray leading-tight">
                  {language === 'ko' && personality.recognition_ko ? personality.recognition_ko[index] : item}
                </p>
              </motion.div>
              ))}
          </div>
        </motion.section>
      </div>

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
            <h2 className="text-3xl font-serif mb-4 text-[hsl(var(--journey-midnight))]">
              {language === 'ko' ? '예술은 일상으로 흐릅니다' : 'Art flows into daily life'}
            </h2>
            <p className="text-lg text-[hsl(var(--journey-twilight))] max-w-3xl mx-auto">
              {language === 'ko' && personality.lifeExtension_ko ? personality.lifeExtension_ko : personality.lifeExtension}
            </p>
          </motion.div>

          {/* Life Areas */}
          <div className="grid md:grid-cols-3 gap-6">
            {personality.lifeAreas.map((area: any, index: number) => (
              <EmotionalCard
                key={index}
                delay={index * 0.1}
                personality={results.personalityType}
                className="p-6"
              >
                <h3 className="text-lg font-medium mb-2">
                  {language === 'ko' && area.title_ko ? area.title_ko : area.title}
                </h3>
                <p className="opacity-80 text-sm">
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

          {/* Artvee Gallery Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h3 className="text-2xl font-serif mb-8 text-center text-[hsl(var(--journey-midnight))]">
              {language === 'ko' ? '당신의 성격과 어울리는 작품들' : 'Artworks that match your personality'}
            </h3>
            <ArtveeGallery personalityType={results.personalityType} />
          </motion.div>

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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <EmotionalButton
                variant="primary"
                size="lg"
                personality={results.personalityType}
                onClick={() => router.push('/exhibitions')}
              >
                <Map className="w-5 h-5" />
                {language === 'ko' ? '나의 예술 지도 탐험하기' : 'Explore Your Art Map'}
              </EmotionalButton>
              <EmotionalButton
                variant="secondary"
                size="lg"
                personality={results.personalityType}
                onClick={() => router.push(`/compatibility?type1=${results.personalityType}`)}
              >
                <Heart className="w-5 h-5" />
                {language === 'ko' ? '궁합 확인하기' : 'Check Chemistry'}
              </EmotionalButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Artwork Recommendations */}
      <ArtworkRecommendations personalityType={results.personalityType} />

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
          <div className="flex justify-center gap-4 flex-wrap">
            <EmotionalButton
              variant="primary"
              onClick={shareResult}
              personality={results.personalityType}
            >
              <Share2 className="w-5 h-5" />
              {language === 'ko' ? '내 유형 공유하기' : 'Share Your Type'}
            </EmotionalButton>
            <EmotionalButton
              variant="secondary"
              onClick={showProfile}
              personality={results.personalityType}
            >
              <User className="w-5 h-5" />
              {language === 'ko' ? '프로필 카드' : 'Profile Card'}
            </EmotionalButton>
            <EmotionalButton
              variant="ghost"
              onClick={() => router.push('/community')}
              personality={results.personalityType}
            >
              <BookOpen className="w-5 h-5" />
              {language === 'ko' ? '커뮤니티 참여하기' : 'Join Community'}
            </EmotionalButton>
          </div>
        </motion.div>
      </section>

      {/* Share Modal */}
      <ShareModal
        personalityType={results.personalityType}
        userName="SAYU Explorer"
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Profile ID Card */}
      {showProfileCard && (
        <ProfileIDCard
          personalityType={results.personalityType}
          userName="SAYU Explorer"
          userLevel={gamificationData?.level || 1}
          userPoints={gamificationData?.totalPoints || 0}
          stats={{
            exhibitionsVisited: gamificationData?.exhibitionHistory?.length || 0,
            achievementsUnlocked: gamificationData?.achievements?.filter(a => a.earnedAt).length || 0,
            companionsMetCount: 0 // This would come from evaluation system
          }}
          recentExhibitions={
            gamificationData?.recentExhibitions?.slice(0, 3).map(visit => ({
              name: visit.exhibitionName,
              date: new Date(visit.visitDate).toLocaleDateString()
            })) || []
          }
          plannedExhibitions={[
            { name: '모네의 정원', venue: '국립현대미술관' },
            { name: 'Van Gogh Alive', venue: 'DDP' }
          ]}
          topAchievements={
            gamificationData?.achievements?.filter(a => a.earnedAt).slice(0, 3).map(achievement => ({
              name: language === 'ko' ? achievement.nameKo : achievement.name,
              icon: achievement.icon
            })) || []
          }
          onClose={() => setShowProfileCard(false)}
        />
      )}

    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Sparkles className="w-12 h-12 text-[#6B5B95]" />
        </motion.div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}