'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArtworkCard } from '@/components/emotional/EmotionalCard';
import { Heart, Sparkles, Map, Share2, Palette, User, Zap, Target, Sprout, ArrowRight } from 'lucide-react';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { getAnimalByType } from '@/data/personality-animals';
import { PersonalityAnimalImage } from '@/components/ui/PersonalityAnimalImage';
import { getSAYUType, isValidSAYUType, type SAYUType } from '@/types/sayu-shared';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAnimalCursor } from '@/contexts/AnimalCursorContext';
import { useAuth } from '@/hooks/useAuth';
import LanguageToggle from '@/components/ui/LanguageToggle';
import ShareModal from '@/components/share/ShareModal';
import ProfileIDCard from '@/components/profile/ProfileIDCard';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import { useArtworksByArtist } from '@/lib/artvee-api';
import { getRecommendedArtistsForPersonality } from '@/data/available-artists';

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
  const { setPersonalityType } = useAnimalCursor();
  const { user, loading: authLoading } = useAuth();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [personality, setPersonality] = useState<any>(null);
  const [animalCharacter, setAnimalCharacter] = useState<any>(null);
  const [sayuType, setSayuType] = useState<SAYUType | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [activeTab, setActiveTab] = useState<'strengths' | 'challenges' | 'growth'>('strengths');
  
  // 항상 동일한 수의 Hook을 호출 (조건부 X)
  const prioritizedArtists = results ? getRecommendedArtistsForPersonality(results.personalityType) : [];
  const artistsToShow = prioritizedArtists.slice(0, 3);
  
  // 항상 3개의 Hook 호출 (빈 문자열이라도)
  const { data: artworks1 } = useArtworksByArtist(artistsToShow[0] || '', 1);
  const { data: artworks2 } = useArtworksByArtist(artistsToShow[1] || '', 1);
  const { data: artworks3 } = useArtworksByArtist(artistsToShow[2] || '', 1);
  
  const artworksArray = [artworks1?.[0], artworks2?.[0], artworks3?.[0]];

  useEffect(() => {
    const urlType = searchParams?.get('type');
    const storedResults = localStorage.getItem('quizResults');
    
    // URL에 type이 있으면 URL을 우선, 없으면 localStorage 사용
    if (urlType) {
      // URL에서 직접 type을 가져온 경우
      const personalityData = personalityDescriptions[urlType];
      const animalData = getAnimalByType(urlType);
      
      if (personalityData) {
        // Mock results with URL type
        const mockResults = {
          personalityType: urlType,
          scores: {},
          responses: [],
          completedAt: new Date().toISOString()
        };
        setResults(mockResults);
        setPersonality(personalityData);
        setAnimalCharacter(animalData);
        
        if (isValidSAYUType(urlType)) {
          setSayuType(getSAYUType(urlType));
        }
        
        setPersonalityType(urlType);
      } else {
        router.push('/quiz');
      }
    } else if (storedResults) {
      // localStorage에서 가져온 경우
      const parsed = JSON.parse(storedResults);
      setResults(parsed);
      
      const type = parsed.personalityType;
      const personalityData = personalityDescriptions[type];
      const animalData = getAnimalByType(type);
      
      setPersonality(personalityData);
      setAnimalCharacter(animalData);
      
      if (isValidSAYUType(type)) {
        setSayuType(getSAYUType(type));
      }
      
      setPersonalityType(type);
    } else {
      router.push('/quiz');
    }
  }, [searchParams, router, setPersonalityType]);

  if (!results || !personality) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-gray-400" />
        </motion.div>
      </div>
    );
  }

  const scrollToSignup = () => {
    document.getElementById('signup-cta')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="font-serif text-lg font-medium text-gray-900">
            {language === 'ko' ? '나의 예술 성격' : 'My Art Personality'}
          </h1>
          <LanguageToggle />
        </div>
      </header>

      {/* 섹션 1: 검사 결과 압축 페이지 */}
      <section className="max-w-4xl mx-auto px-4 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* 동물 캐릭터 */}
          {animalCharacter && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6"
            >
              <PersonalityAnimalImage 
                animal={animalCharacter}
                variant="illustration"
                size="lg"
                className="mx-auto"
              />
            </motion.div>
          )}
          
          {/* 유형 이름 */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4"
          >
            {language === 'ko' && personality.title_ko ? personality.title_ko : personality.title}
          </motion.h1>
          
          {/* 간단한 설명 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            {language === 'ko' && personality.subtitle_ko ? personality.subtitle_ko : personality.subtitle}
          </motion.p>
        </motion.div>
      </section>

      {/* 섹션 2: APT 4축 설명 */}
      <section className="max-w-4xl mx-auto px-4 pt-2 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-100 rounded-2xl p-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-sm font-medium text-gray-500 mb-2">
              {language === 'ko' ? 'APT 코드' : 'APT Code'}
            </h2>
            <p className="text-3xl font-mono font-bold text-gray-900">
              {results.personalityType}
            </p>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {/* L/S */}
            <div className="text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <span className="font-mono font-bold text-xl text-purple-600">{results.personalityType[0]}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {results.personalityType[0] === 'L' ? 'Lone' : 'Social'}
              </p>
              <p className="text-xs text-gray-500">
                {results.personalityType[0] === 'L' 
                  ? (language === 'ko' ? '혼자 조용히' : 'Quiet & Solo') 
                  : (language === 'ko' ? '함께 나누며' : 'Share & Connect')}
              </p>
            </div>
            
            {/* A/R */}
            <div className="text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <span className="font-mono font-bold text-xl text-blue-600">{results.personalityType[1]}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {results.personalityType[1] === 'A' ? 'Abstract' : 'Representational'}
              </p>
              <p className="text-xs text-gray-500">
                {results.personalityType[1] === 'A' 
                  ? (language === 'ko' ? '추상과 감정' : 'Form & Feeling') 
                  : (language === 'ko' ? '현실과 기법' : 'Real & Technique')}
              </p>
            </div>
            
            {/* E/M */}
            <div className="text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <span className="font-mono font-bold text-xl text-pink-600">{results.personalityType[2]}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {results.personalityType[2] === 'E' ? 'Emotional' : 'Meaning-driven'}
              </p>
              <p className="text-xs text-gray-500">
                {results.personalityType[2] === 'E' 
                  ? (language === 'ko' ? '즉각적 감동' : 'Instant Impact') 
                  : (language === 'ko' ? '의미와 맥락' : 'Context & Meaning')}
              </p>
            </div>
            
            {/* F/C */}
            <div className="text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <span className="font-mono font-bold text-xl text-green-600">{results.personalityType[3]}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {results.personalityType[3] === 'F' ? 'Flow' : 'Constructive'}
              </p>
              <p className="text-xs text-gray-500">
                {results.personalityType[3] === 'F' 
                  ? (language === 'ko' ? '자유로운 탐험' : 'Free Explore') 
                  : (language === 'ko' ? '체계적 접근' : 'Systematic Way')}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 섹션 3: CTA 버튼 3개 */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4"
        >
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm sm:text-base"
          >
            <Share2 size={18} />
            {language === 'ko' ? 'APT 카드 공유하기' : 'Share your APT Card'}
          </button>
          
          <button
            onClick={() => router.push('/profile/art-profile')}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium text-sm sm:text-base"
          >
            <Sparkles size={18} />
            {language === 'ko' ? 'AI ID 프로필 생성' : 'Generate AI ID Profile'}
          </button>
          
          <button
            onClick={() => router.push('/personality-overview')}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-medium text-sm sm:text-base"
          >
            <Palette size={18} />
            {language === 'ko' ? '모든 유형 보기' : 'All Types'}
          </button>
        </motion.div>
      </section>

      {/* 섹션 4: 페르소나 세부 설명 (탭 구조) */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
        >
          {/* Nature 설명 */}
          <div className="p-8 border-b border-gray-200">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              {language === 'ko' ? '당신의 예술적 자아' : 'Your Artistic Nature'}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {language === 'ko' && personality.essence_ko ? personality.essence_ko : personality.essence}
            </p>
          </div>
          
          {/* 탭 */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('strengths')}
              className={`flex-1 py-4 px-6 font-medium transition-all duration-200 relative group ${
                activeTab === 'strengths' 
                  ? 'text-purple-600 bg-gradient-to-t from-purple-50 to-transparent' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Zap className={`w-4 h-4 transition-transform ${activeTab === 'strengths' ? 'scale-110' : ''}`} />
                <span>{language === 'ko' ? '강점' : 'Strengths'}</span>
              </div>
              {activeTab === 'strengths' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-600"
                  initial={false}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className={`flex-1 py-4 px-6 font-medium transition-all duration-200 relative group ${
                activeTab === 'challenges' 
                  ? 'text-purple-600 bg-gradient-to-t from-purple-50 to-transparent' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Target className={`w-4 h-4 transition-transform ${activeTab === 'challenges' ? 'scale-110' : ''}`} />
                <span>{language === 'ko' ? '도전과제' : 'Challenges'}</span>
              </div>
              {activeTab === 'challenges' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-600"
                  initial={false}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('growth')}
              className={`flex-1 py-4 px-6 font-medium transition-all duration-200 relative group ${
                activeTab === 'growth' 
                  ? 'text-purple-600 bg-gradient-to-t from-purple-50 to-transparent' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Sprout className={`w-4 h-4 transition-transform ${activeTab === 'growth' ? 'scale-110' : ''}`} />
                <span>{language === 'ko' ? '성장' : 'Growth'}</span>
              </div>
              {activeTab === 'growth' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-600"
                  initial={false}
                />
              )}
            </button>
          </div>
          
          {/* 탭 내용 */}
          <div className="p-8 relative overflow-hidden">
            {activeTab === 'strengths' && personality.strengths && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="grid gap-4"
              >
                {personality.strengths.map((strength: any, index: number) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-3 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <div className="text-2xl flex-shrink-0">{strength.icon}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {language === 'ko' && strength.title_ko ? strength.title_ko : strength.title}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {language === 'ko' && strength.description_ko ? strength.description_ko : strength.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            {activeTab === 'challenges' && sayuType && (
              <motion.ul
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {sayuType.challenges.map((challenge, index) => (
                  <motion.li 
                    key={index} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    <span className="text-orange-500 mt-0.5 text-lg">⚡</span>
                    <span className="text-gray-700 leading-relaxed">{challenge}</span>
                  </motion.li>
                ))}
              </motion.ul>
            )}
            
            {activeTab === 'growth' && personality.growth && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="grid gap-4"
              >
                {personality.growth.map((growthItem: any, index: number) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-5 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border border-green-200"
                  >
                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-xl">{growthItem.icon}</span>
                      {language === 'ko' && growthItem.title_ko ? growthItem.title_ko : growthItem.title}
                    </h5>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {language === 'ko' && growthItem.description_ko ? growthItem.description_ko : growthItem.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* 섹션 5: Daily Life 확장 (1줄) */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="text-center"
        >
          <p className="text-lg text-gray-700 italic">
            {language === 'ko' ? '💫 예술이 당신의 일상에 스며드는 방식: ' : '💫 How art flows into your daily life: '}
            <span className="font-medium">
              {language === 'ko' && personality.lifeExtension_ko 
                ? personality.lifeExtension_ko 
                : personality.lifeExtension}
            </span>
          </p>
        </motion.div>
      </section>

      {/* 섹션 6: Connection/추천 파트 */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
        >
          <h2 className="text-3xl font-serif font-bold text-center text-gray-900 mb-8">
            {language === 'ko' ? '당신과 연결된 아티스트' : 'Artists Connected to You'}
          </h2>
          
          {/* 아티스트 3명 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {artistsToShow.map((artistName: string, index: number) => {
              const artwork = artworksArray[index];
              
              // personality-descriptions에서 작가 정보 찾기
              const artistInfo = personality.recommendedArtists?.find(
                (a: any) => a.name.toLowerCase().includes(artistName.toLowerCase()) ||
                            artistName.toLowerCase().includes(a.name.toLowerCase())
              );
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.7 + index * 0.1 }}
                  className="overflow-hidden"
                >
                  <ArtworkCard
                    image={artwork?.cdn_url || artwork?.imageUrl || artwork?.thumbnailUrl || `https://via.placeholder.com/400x500.png?text=${encodeURIComponent(artistName)}`}
                    title={artwork?.title || artistName}
                    artist={artistName}
                    description={
                      artistInfo 
                        ? (language === 'ko' && artistInfo.whyYouConnect_ko ? artistInfo.whyYouConnect_ko : artistInfo.whyYouConnect)
                        : (language === 'ko' ? '당신의 예술적 성향과 잘 맞는 작가입니다' : 'An artist that matches your artistic personality')
                    }
                    emotionalTag={
                      artistInfo
                        ? (language === 'ko' && artistInfo.emotionalTag_ko ? artistInfo.emotionalTag_ko : artistInfo.emotionalTag)
                        : (language === 'ko' ? '특별한 연결' : 'Special connection')
                    }
                    personality={results.personalityType}
                    delay={index * 0.1}
                  />
                </motion.div>
              );
            })}
          </div>
          
          {/* 더보기 & 전시회 추천 버튼 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToSignup}
              className="flex items-center justify-center gap-2 px-6 py-3 text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              {language === 'ko' ? '더 많은 아티스트 보기' : 'See More Artists'}
              <ArrowRight size={18} />
            </button>
            
            <button
              onClick={() => router.push('/exhibitions')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Map size={18} />
              {language === 'ko' ? '맞춤 전시회 추천받기' : 'Get Exhibition Recommendations'}
            </button>
          </div>
        </motion.div>
      </section>

      {/* 섹션 7: Sign-up CTA */}
      {!authLoading && !user && (
        <section id="signup-cta" className="bg-gradient-to-br from-purple-50 to-pink-50 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto px-4 text-center"
          >
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              {language === 'ko' 
                ? '더 많은 예술 경험을 원하시나요?' 
                : 'Want More Art Experiences?'}
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              {language === 'ko' 
                ? '무료 회원가입으로 개인화된 추천, 전시회 정보, AI 아트 프로필 등 다양한 혜택을 누려보세요.'
                : 'Sign up for free to enjoy personalized recommendations, exhibition info, AI art profiles, and more benefits.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/register')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium text-lg"
              >
                {language === 'ko' ? '무료 회원가입' : 'Sign Up Free'}
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors font-medium text-lg"
              >
                {language === 'ko' ? '로그인' : 'Login'}
              </button>
            </div>
          </motion.div>
        </section>
      )}

      {/* Fixed Feedback Button */}
      <FeedbackButton
        position="fixed"
        variant="primary"
        contextData={{
          page: 'results',
          personalityType: results.personalityType,
          feature: 'personality-results'
        }}
      />

      {/* Modals */}
      <ShareModal
        personalityType={results.personalityType}
        userName="SAYU Explorer"
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {showProfileCard && (
        <ProfileIDCard
          personalityType={results.personalityType}
          userName="SAYU Explorer"
          userLevel={1}
          userPoints={0}
          stats={{
            exhibitionsVisited: 0,
            achievementsUnlocked: 0,
            companionsMetCount: 0
          }}
          recentExhibitions={[]}
          plannedExhibitions={[]}
          topAchievements={[]}
          onClose={() => setShowProfileCard(false)}
        />
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-gray-400" />
        </motion.div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}