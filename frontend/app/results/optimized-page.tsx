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
import { cn } from '@/lib/utils';

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

// 챗봇 플로팅 버튼
function ChatbotFloatingButton({ onClick }: { onClick: () => void }) {
  const { language } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
    >
      <motion.button
        className="relative bg-[#6B5B95] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onClick}
      >
        <MessageCircle className="w-6 h-6" />
        
        {/* 툴팁 */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
            >
              <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg">
                {language === 'ko' ? 'AI 큐레이터와 대화하기' : 'Chat with AI Curator'}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 알림 뱃지 */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      </motion.button>
    </motion.div>
  );
}

function OptimizedResultsContent() {
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
      
      const type = searchParams.get('type') || parsed.personalityType;
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
    <div className="min-h-screen bg-gray-50">
      {/* 심플한 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-lg font-medium text-gray-900">
            {results.personalityType} - {animalCharacter.emoji} {language === 'ko' ? animalCharacter.name_ko : animalCharacter.name}
          </h1>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setShowShareModal(true)}>
              <Share2 className="w-4 h-4" />
            </Button>
            {!user && (
              <Button variant="primary" size="sm" onClick={() => router.push('/login')}>
                {language === 'ko' ? '가입하기' : 'Sign Up'}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* 섹션 1: 핵심 정보 (압축됨) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 성격 요약 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#6B5B95]" />
              {language === 'ko' ? '당신의 예술 DNA' : 'Your Art DNA'}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {language === 'ko' ? personality.description_ko : personality.description}
            </p>
            <div className="space-y-3">
              <CompactTraitCard
                icon={Palette}
                title={language === 'ko' ? '선호 스타일' : 'Preferred Style'}
                content={language === 'ko' ? personality.artStyle_ko : personality.artStyle}
              />
              <CompactTraitCard
                icon={Star}
                title={language === 'ko' ? '핵심 특성' : 'Key Traits'}
                content={language === 'ko' ? personality.traits_ko?.join(', ') : personality.traits?.join(', ')}
                color="#E63946"
              />
            </div>
          </div>

          {/* 오른쪽: AI 프로필 & CTA */}
          <div className="space-y-4">
            {/* AI 아트 프로필 */}
            <div className="bg-gradient-to-br from-[#6B5B95]/10 to-transparent rounded-2xl p-6 border border-[#6B5B95]/20">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#6B5B95]" />
                {language === 'ko' ? 'AI 아트 프로필' : 'AI Art Profile'}
              </h3>
              <p className="text-gray-600 mb-4">
                {language === 'ko' 
                  ? 'AI가 당신의 예술적 정체성을 시각화합니다' 
                  : 'AI visualizes your artistic identity'}
              </p>
              <Button variant="primary" fullWidth onClick={() => router.push('/profile/art-profile')}>
                {language === 'ko' ? '프로필 생성하기' : 'Create Profile'}
              </Button>
            </div>

            {/* 회원가입 유도 (비로그인시) */}
            {!user && (
              <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
                <h3 className="font-semibold mb-2">
                  {language === 'ko' ? '더 많은 혜택을 받으세요!' : 'Get More Benefits!'}
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  {language === 'ko' 
                    ? '무료 가입하고 맞춤 큐레이션을 받아보세요' 
                    : 'Sign up for free and get personalized curation'}
                </p>
                <Button variant="primary" size="sm" fullWidth onClick={() => router.push('/signup')}>
                  {language === 'ko' ? '30초 무료 가입' : '30s Free Sign Up'}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* 섹션 2: 추천 컨텐츠 (통합) */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {language === 'ko' ? '당신을 위한 추천' : 'Recommendations for You'}
          </h2>
          <RecommendationSection personalityType={results.personalityType} language={language} />
        </section>

        {/* 섹션 3: 다음 단계 */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">
            {language === 'ko' ? '다음 단계' : 'Next Steps'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="gallery" onClick={() => router.push('/quiz')}>
              {language === 'ko' ? '다시 테스트하기' : 'Retake Test'}
            </Button>
            <Button variant="gallery" onClick={() => router.push('/profile')}>
              <User className="w-4 h-4" />
              {language === 'ko' ? '내 프로필 보기' : 'View Profile'}
            </Button>
            <Button variant="gallery" onClick={() => setShowChatbot(true)}>
              <MessageCircle className="w-4 h-4" />
              {language === 'ko' ? 'AI와 대화하기' : 'Chat with AI'}
            </Button>
          </div>
        </section>
      </main>

      {/* 챗봇 플로팅 버튼 */}
      <ChatbotFloatingButton onClick={() => setShowChatbot(true)} />

      {/* 공유 모달 */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        personalityType={results.personalityType}
        animalEmoji={animalCharacter.emoji}
        userName={user?.nickname || 'SAYU User'}
      />

      {/* 챗봇 모달 */}
      {showChatbot && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full h-[600px] flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold">AI 큐레이터</h3>
              <button 
                onClick={() => setShowChatbot(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-4">
              {/* 챗봇 내용 */}
              <p className="text-gray-500 text-center mt-20">챗봇 기능 준비중...</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function OptimizedResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Sparkles className="w-12 h-12 text-[#6B5B95] animate-spin" />
      </div>
    }>
      <OptimizedResultsContent />
    </Suspense>
  );
}