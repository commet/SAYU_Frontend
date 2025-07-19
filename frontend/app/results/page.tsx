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
        animalName={language === 'ko' ? animalCharacter.animal_ko : animalCharacter.animal}
        animalEmoji={animalCharacter.emoji}
        description={language === 'ko' ? personality.description_ko : personality.description}
        artStyle={language === 'ko' ? personality.subtitle_ko : personality.subtitle}
        traits={personality.strengths?.map(s => language === 'ko' ? s.title_ko || s.title : s.title) || []}
        strengths={personality.recognition ? (language === 'ko' ? personality.recognition_ko || personality.recognition : personality.recognition) : []}
        color={animalCharacter.color || '#6B5B95'}
        imageUrl={animalCharacter.image}
        onComplete={() => setShowAPTReveal(false)}
        onShare={() => setShowShareModal(true)}
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
              {language === 'ko' ? '당신의 예술 페르소나' : 'Your Art Persona'}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {language === 'ko' ? personality.description_ko : personality.description}
            </p>
            <div className="space-y-3">
              <CompactTraitCard
                icon={Palette}
                title={language === 'ko' ? '선호 스타일' : 'Preferred Style'}
                content={language === 'ko' ? personality.subtitle_ko || personality.subtitle : personality.subtitle}
              />
              <CompactTraitCard
                icon={Star}
                title={language === 'ko' ? '핵심 특성' : 'Key Traits'}
                content={personality.strengths?.map(s => language === 'ko' ? s.title_ko || s.title : s.title).join(', ') || ''}
                color="#E63946"
              />
            </div>
          </div>

          {/* 오른쪽: AI 프로필 & CTA */}
          <div className="space-y-4">
            {/* AI 아트 프로필 */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative bg-gradient-to-br from-[#6B5B95]/5 via-[#8B7BAB]/5 to-transparent rounded-3xl p-8 border border-[#6B5B95]/10 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* 배경 패턴 */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#6B5B95] rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#8B7BAB] rounded-full blur-3xl" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B5B95] to-[#8B7BAB] flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    {language === 'ko' ? 'AI 아트 프로필' : 'AI Art Profile'}
                  </h3>
                  <span className="text-xs font-medium text-[#6B5B95] bg-[#6B5B95]/10 px-3 py-1 rounded-full">
                    NEW
                  </span>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {language === 'ko' 
                    ? 'AI가 당신의 APT를 분석해 독특한 예술적 아바타를 생성합니다' 
                    : 'AI analyzes your APT to create a unique artistic avatar'}
                </p>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex -space-x-2">
                    {['🦊', '🐱', '🦉'].map((emoji, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-sm">
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {language === 'ko' ? '2,000명이 생성했어요' : '2,000 created'}
                  </p>
                </div>
                <Button 
                  variant="primary" 
                  fullWidth 
                  size="lg"
                  className="bg-gradient-to-r from-[#6B5B95] to-[#8B7BAB] hover:from-[#5A4A84] hover:to-[#7A6A9A] transform hover:scale-[1.02] transition-all"
                  onClick={() => router.push('/profile/art-profile')}
                >
                  <span className="flex items-center justify-center gap-2">
                    {language === 'ko' ? '내 프로필 만들기' : 'Create My Profile'}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </div>
            </motion.div>

            {/* 회원가입 유도 (비로그인시) */}
            {!user && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-200/50 overflow-hidden"
              >
                {/* 장식 요소 */}
                <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8">
                  <div className="w-full h-full bg-gradient-to-br from-amber-300 to-orange-300 rounded-full opacity-20 blur-2xl" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {language === 'ko' ? 'SAYU 멤버가 되어보세요' : 'Become a SAYU Member'}
                    </h3>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-amber-600 mt-0.5">✓</span>
                      <span>{language === 'ko' ? 'APT 기반 맞춤 전시 추천' : 'APT-based exhibition recommendations'}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-amber-600 mt-0.5">✓</span>
                      <span>{language === 'ko' ? 'AI 큐레이터와 무제한 대화' : 'Unlimited chat with AI curator'}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-amber-600 mt-0.5">✓</span>
                      <span>{language === 'ko' ? '나만의 예술 컬렉션 저장' : 'Save your art collection'}</span>
                    </li>
                  </ul>
                  
                  <Button 
                    variant="primary" 
                    size="lg" 
                    fullWidth 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transform hover:scale-[1.02] transition-all"
                    onClick={() => router.push('/signup')}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {language === 'ko' ? '무료로 시작하기' : 'Start for Free'}
                      <span className="text-xs opacity-80">
                        {language === 'ko' ? '(30초)' : '(30s)'}
                      </span>
                    </span>
                  </Button>
                </div>
              </motion.div>
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