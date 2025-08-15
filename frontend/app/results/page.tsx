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
import ShareModal from '@/components/share/ShareModal';
import ProfileIDCard from '@/components/profile/ProfileIDCard';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import { useArtworksByArtist } from '@/lib/artvee-api';
import { getBestAvailableArtists, PERSONALITY_ART_STYLES, type AvailableArtist } from '@/data/available-artists-2025';
import { FormattedEssence } from '@/components/ui/FormattedEssence';

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
  
  // 2025 매칭 시스템 - 실제 사용 가능한 작가들과 작품
  const [artistArtworks, setArtistArtworks] = useState<any[]>([]);
  const availableArtists = results ? getBestAvailableArtists(results.personalityType) : [];
  const personalityStyle = results ? PERSONALITY_ART_STYLES[results.personalityType as keyof typeof PERSONALITY_ART_STYLES] : null;
  
  // 작가의 최고 작품 찾기
  const findBestArtworkForArtist = (artworks: any[], artist: AvailableArtist) => {
    const artistWorks = artworks.filter((work: any) => {
      if (!work.artist) return false;
      const workArtist = work.artist.split('\n')[0].toLowerCase();
      const targetArtist = artist.name.toLowerCase();
      const artistLastName = artist.name.split(' ').pop()?.toLowerCase() || '';
      
      return workArtist.includes(targetArtist) || 
             targetArtist.includes(workArtist) ||
             (artistLastName && workArtist.includes(artistLastName));
    });
    
    if (artistWorks.length === 0) return null;
    
    // 유명 작품 중에서 먼저 찾기
    for (const notableWork of artist.notableWorks) {
      const found = artistWorks.find((work: any) => 
        work.title?.toLowerCase().includes(notableWork.toLowerCase()) ||
        notableWork.toLowerCase().includes(work.title?.toLowerCase() || '')
      );
      if (found) {
        return {
          title: found.title,
          imageUrl: found.cloudinaryUrl || found.primaryImage || found.primaryImageSmall,
          date: found.date,
          medium: found.medium
        };
      }
    }
    
    // 첫 번째 작품 사용
    const firstWork = artistWorks[0];
    return {
      title: firstWork.title,
      imageUrl: firstWork.cloudinaryUrl || firstWork.primaryImage || firstWork.primaryImageSmall,
      date: firstWork.date,
      medium: firstWork.medium
    };
  };
  
  // 실제 사용 가능한 작가들의 작품 로드
  useEffect(() => {
    const loadAvailableArtworks = async () => {
      if (availableArtists.length === 0) return;
      
      try {
        const response = await fetch('/api/artworks');
        let data = { artworks: [] };
        
        if (response.ok) {
          data = await response.json();
        } else {
          console.warn('Failed to fetch artworks, using fallback data');
        }
        
        const matchedArtworks = availableArtists.map((artist, index) => {
          const matchType = index === 0 ? 'primary' : index === 1 ? 'secondary' : 'tertiary';
          const bestWork = findBestArtworkForArtist(data.artworks, artist);
          
          return {
            ...artist,
            matchType,
            bestWork,
            imageUrl: bestWork?.imageUrl || '/api/placeholder-image?type=backgrounds&name=gallery-space',
            artworkTitle: bestWork?.title || artist.notableWorks[0] || 'Notable Work'
          };
        });
        
        setArtistArtworks(matchedArtworks);
      } catch (error) {
        console.error('Failed to load available artworks:', error);
        // 에러 시에도 작가 정보는 표시
        const fallbackArtworks = availableArtists.map((artist, index) => ({
          ...artist,
          matchType: index === 0 ? 'primary' : index === 1 ? 'secondary' : 'tertiary',
          imageUrl: '/api/placeholder-image?type=backgrounds&name=gallery-space',
          artworkTitle: artist.notableWorks[0] || 'Notable Work'
        }));
        setArtistArtworks(fallbackArtworks);
      }
    };
    
    loadAvailableArtworks();
  }, [availableArtists]);

  useEffect(() => {
    const urlType = searchParams?.get('type');
    const storedResults = localStorage.getItem('quizResults');
    
    // URL에 type이 있으면 URL을 우선, 없으면 localStorage 사용
    if (urlType) {
      // URL에서 직접 type을 가져온 경우
      const personalityData = personalityDescriptions[urlType];
      const animalData = getAnimalByType(urlType);
      
      console.log('URL Type:', urlType);
      console.log('Animal Data:', animalData);
      
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
      
      console.log('LocalStorage Type:', type);
      console.log('Animal Data from localStorage:', animalData);
      
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
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navigation Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-center items-center">
          <h1 className="font-serif text-lg font-medium text-gray-900 dark:text-white">
            {language === 'ko' ? '나의 예술 페르소나' : 'My Art Persona'}
          </h1>
        </div>
      </header>

      {/* 섹션 1: 검사 결과 압축 페이지 */}
      <section className="max-w-4xl mx-auto px-4 pt-2 pb-4">
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
              className="mb-4"
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
            className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-3"
          >
            {language === 'ko' && personality.title_ko ? personality.title_ko : personality.title}
          </motion.h1>
          
          {/* 간단한 설명 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto subtitle-text"
            style={{ 
              wordBreak: language === 'ko' ? 'keep-all' : 'normal'
            }}
          >
            {language === 'ko' && personality.subtitle_ko ? personality.subtitle_ko : personality.subtitle}
          </motion.p>
        </motion.div>
      </section>

      {/* 섹션 2: APT 4축 설명 (moved to top) */}
      <section className="max-w-4xl mx-auto px-4 pt-2 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-100 dark:bg-slate-800 rounded-2xl p-6"
        >
          <div className="text-center mb-3">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {language === 'ko' ? 'Art Persona Type 코드' : 'Art Persona Type Code'}
            </h2>
            <p className="text-3xl font-mono font-bold text-gray-900 dark:text-white">
              {results.personalityType}
            </p>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {/* L/S */}
            <div className="text-center">
              <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-1 shadow-sm">
                <span className="font-mono font-bold text-xl text-purple-600">{results.personalityType[0]}</span>
              </div>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {results.personalityType[0] === 'L' ? 'Lone' : 'Social'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line">
                {results.personalityType[0] === 'L' 
                  ? (language === 'ko' ? '혼자\n조용히' : 'Quiet & Solo') 
                  : (language === 'ko' ? '함께\n나누며' : 'Share & Connect')}
              </p>
            </div>
            
            {/* A/R */}
            <div className="text-center">
              <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-1 shadow-sm">
                <span className="font-mono font-bold text-xl text-blue-600">{results.personalityType[1]}</span>
              </div>
              <div className="px-1">
                {results.personalityType[1] === 'A' ? (
                  <p className="text-base font-medium text-gray-900 dark:text-white text-center">
                    Abstract
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white tracking-tighter" style={{ textAlign: 'left', marginLeft: '-12px', marginTop: '7px' }}>
                    Representational
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line text-center mt-1">
                  {results.personalityType[1] === 'A' 
                    ? (language === 'ko' ? '추상과\n감정' : 'Form & Feeling') 
                    : (language === 'ko' ? '현실과\n기법' : 'Real & Technique')}
                </p>
              </div>
            </div>
            
            {/* E/M */}
            <div className="text-center">
              <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-1 shadow-sm">
                <span className="font-mono font-bold text-xl text-pink-600">{results.personalityType[2]}</span>
              </div>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {results.personalityType[2] === 'E' ? 'Emotional' : 'Meaning-driven'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line">
                {results.personalityType[2] === 'E' 
                  ? (language === 'ko' ? '즉각적\n감동' : 'Instant Impact') 
                  : (language === 'ko' ? '의미와\n맥락' : 'Context & Meaning')}
              </p>
            </div>
            
            {/* F/C */}
            <div className="text-center">
              <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-1 shadow-sm">
                <span className="font-mono font-bold text-xl text-green-600">{results.personalityType[3]}</span>
              </div>
              {results.personalityType[3] === 'F' ? (
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  Flow
                </p>
              ) : (
                <p className="text-base font-medium text-gray-900 dark:text-white tracking-tighter">
                  Constructive
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line">
                {results.personalityType[3] === 'F' 
                  ? (language === 'ko' ? '자유로운\n탐험' : 'Free Explore') 
                  : (language === 'ko' ? '체계적\n접근' : 'Systematic Way')}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 섹션 3: CTA 버튼 3개 */}
      <section className="max-w-4xl mx-auto px-4 py-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-row justify-center gap-2 sm:gap-4"
        >
          <button
            onClick={() => setShowShareModal(true)}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex-1 sm:flex-none"
          >
            <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[10px] sm:text-base">
              {language === 'ko' ? '공유하기' : 'Share'}
            </span>
          </button>
          
          <button
            onClick={() => router.push('/profile/art-profile')}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium flex-1 sm:flex-none"
          >
            <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[10px] sm:text-base">
              {language === 'ko' ? 'AI 프로필' : 'AI Profile'}
            </span>
          </button>
          
          <button
            onClick={() => router.push(`/personality-overview?from=${results.personalityType}`)}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-blue-800 dark:bg-blue-900 border-2 border-blue-700 dark:border-blue-800 text-white hover:bg-blue-700 dark:hover:bg-blue-800 hover:border-blue-600 dark:hover:border-blue-700 transition-colors font-medium flex-1 sm:flex-none"
          >
            <Palette size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[10px] sm:text-base">
              {language === 'ko' ? '전체 유형' : 'All Types'}
            </span>
          </button>
        </motion.div>
      </section>

      {/* 섹션 4: 페르소나 세부 설명 (탭 구조) - 상세 설명이 여기로 이동됨 */}
      <section className="max-w-4xl mx-auto px-2 sm:px-4 py-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          {/* 상세 설명 (essence) - 탭 위에 항상 표시 */}
          <div className="p-4 sm:p-8 pb-0">
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'ko' ? '갤러리에서의 당신:' : 'You at the Gallery:'}
              </h3>
              <FormattedEssence 
                text={language === 'ko' && personality.essence_ko ? personality.essence_ko : personality.essence}
                className="text-sm"
              />
            </div>
          </div>

          {/* 탭 */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('strengths')}
              className={`flex-1 py-4 px-6 font-medium transition-all duration-200 relative group ${
                activeTab === 'strengths' 
                  ? 'text-purple-600 bg-gradient-to-t from-purple-50 dark:from-purple-900/30 to-transparent' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700'
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
                  ? 'text-purple-600 bg-gradient-to-t from-purple-50 dark:from-purple-900/30 to-transparent' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700'
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
                  ? 'text-purple-600 bg-gradient-to-t from-purple-50 dark:from-purple-900/30 to-transparent' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700'
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
          <div className="p-4 sm:p-8 relative overflow-hidden">
            {activeTab === 'strengths' && personality.strengths && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="grid gap-3 sm:gap-4"
              >
                {personality.strengths.map((strength: any, index: number) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <div className="text-xl sm:text-2xl flex-shrink-0 mt-0.5">{strength.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1 text-sm sm:text-base">
                        {language === 'ko' && strength.title_ko ? strength.title_ko : strength.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                        {language === 'ko' && strength.description_ko ? strength.description_ko : strength.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            {activeTab === 'challenges' && sayuType && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="grid gap-3 sm:gap-4"
              >
                {(language === 'ko' ? sayuType.challenges : sayuType.challengesEn).map((challenge, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                  >
                    <div className="text-xl sm:text-2xl flex-shrink-0 mt-0.5">💡</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">{challenge}</h4>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            {activeTab === 'growth' && personality.growth && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="grid gap-3 sm:gap-4"
              >
                {personality.growth.map((growthItem: any, index: number) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <div className="text-xl sm:text-2xl flex-shrink-0 mt-0.5">{growthItem.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1 text-sm sm:text-base">
                        {language === 'ko' && growthItem.title_ko ? growthItem.title_ko : growthItem.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                        {language === 'ko' && growthItem.description_ko ? growthItem.description_ko : growthItem.description}
                      </p>
                    </div>
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
          <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300 italic">
            {language === 'ko' ? '💫 일상 속 예술: ' : '💫 Art in daily life: '}
            <span className="font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base">
              {language === 'ko' && personality.lifeExtension_ko 
                ? personality.lifeExtension_ko 
                : personality.lifeExtension}
            </span>
          </p>
        </motion.div>
      </section>

      {/* 섹션 6: Connection/추천 파트 */}
      <section className="max-w-4xl mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
        >
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center text-gray-900 dark:text-white mb-6 sm:mb-8">
            {language === 'ko' ? '당신과 연결된 아티스트' : 'Artists Connected to You'}
          </h2>
          
          {/* 당신의 스타일과 맞는 작가들 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {artistArtworks.map((artistMatch: any, index: number) => {
              const isMainMatch = artistMatch.matchType === 'primary';
              const matchLabels = {
                primary: language === 'ko' ? '최고 매칭' : 'Perfect Match',
                secondary: language === 'ko' ? '조화로운 매칭' : 'Harmonious Match', 
                tertiary: language === 'ko' ? '흥미로운 발견' : 'Interesting Discovery'
              };
              
              const description = language === 'ko' 
                ? `${artistMatch.style} 작가로 ${artistMatch.workCount}점의 작품이 컬렉션에 있습니다. ${artistMatch.notableWorks.slice(0,2).join(', ')} 등으로 유명합니다.`
                : `${artistMatch.style} artist with ${artistMatch.workCount} works in our collection. Known for ${artistMatch.notableWorks.slice(0,2).join(', ')} and more.`;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.7 + index * 0.1 }}
                >
                  <ArtworkCard
                    image={artistMatch.imageUrl}
                    title={artistMatch.artworkTitle}
                    artist={`${artistMatch.name} (${artistMatch.period})`}
                    description={description}
                    emotionalTag={matchLabels[artistMatch.matchType as keyof typeof matchLabels]}
                    personality={results.personalityType}
                    delay={index * 0.1}
                  />
                </motion.div>
              );
            })}
          </div>
          
          {/* 당신의 예술 성향 설명 - 데스크톱에서만 표시 */}
          {personalityStyle && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0 }}
              className="hidden sm:block bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 mb-6 max-w-3xl mx-auto"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'ko' ? '당신의 예술 감상 스타일' : 'Your Art Appreciation Style'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <span className="font-medium">
                  {language === 'ko' ? personalityStyle.focus : personalityStyle.focusEn}
                </span>
                {language === 'ko' 
                  ? '에 중점을 두고 작품을 감상하시는 분입니다.' 
                  : ' is your primary focus when appreciating art.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {(language === 'ko' ? personalityStyle.keywords : personalityStyle.keywordsEn).map((keyword, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 bg-white dark:bg-slate-700 rounded-full text-sm text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-600"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* 더보기 & 전시회 추천 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
            <button
              onClick={() => router.push('/collections')}
              className="flex items-center justify-center gap-2 px-6 py-3 text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              {language === 'ko' ? '더 많은 작품 탐색하기' : 'Explore More Artworks'}
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


      {/* 섹션 7: Save Results CTA */}
      {true ? ( // Temporarily always show for debugging
        <section id="signup-cta" className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 py-8 sm:py-12 mt-6 sm:mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto px-4 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {language === 'ko' ? '게스트로 보는 중' : 'Viewing as Guest'}
            </div>
            
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
              {language === 'ko' 
                ? '결과를 저장하시겠어요?' 
                : 'Save Your Results?'}
            </h2>
            <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300 mb-4 sm:mb-8 max-w-2xl mx-auto">
              {language === 'ko' 
                ? (
                  <>
                    <span className="sm:hidden">나만의 예술 갤러리를 만들어 언제든지 결과를 확인하고,<br />맞춤 작품 추천을 받아보세요.</span>
                    <span className="hidden sm:inline">나만의 예술 갤러리를 만들어 언제든지 결과를 확인하고, 맞춤 작품 추천을 받아보세요.</span>
                  </>
                )
                : 'Create your personal art gallery to access your results anytime and receive personalized artwork recommendations.'}
            </p>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-6 max-w-3xl mx-auto mb-4 sm:mb-8">
              <div className="text-center p-2 sm:p-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-3">
                  <Heart className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="font-medium text-xs sm:text-base text-gray-900 dark:text-white mb-1 sm:mb-2">
                  {language === 'ko' ? '작품 저장' : 'Save'}
                </h3>
                <p className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                  {language === 'ko' ? '마음에 드는 작품을 모아보세요' : 'Collect your favorite pieces'}
                </p>
              </div>
              
              <div className="text-center p-2 sm:p-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-3">
                  <Map className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="font-medium text-xs sm:text-base text-gray-900 dark:text-white mb-1 sm:mb-2">
                  {language === 'ko' ? '전시 추천' : 'Guide'}
                </h3>
                <p className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                  {language === 'ko' ? '성향에 맞는 전시회 추천' : 'Get personalized exhibition recommendations'}
                </p>
              </div>
              
              <div className="text-center p-2 sm:p-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-3">
                  <Palette className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="font-medium text-xs sm:text-base text-gray-900 dark:text-white mb-1 sm:mb-2">
                  {language === 'ko' ? 'AI 프로필' : 'Profile'}
                </h3>
                <p className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                  {language === 'ko' ? '당신만의 예술 프로필 생성' : 'Generate your unique art profile'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pb-4">
              <button
                onClick={() => {
                  const params = new URLSearchParams({
                    from: 'results',
                    apt: results?.personalityType || ''
                  });
                  router.push(`/login?${params.toString()}`);
                }}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium text-base sm:text-lg flex items-center justify-center gap-2"
              >
                {language === 'ko' ? '결과 저장하고 시작하기' : 'Save Results & Start'}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/gallery')}
                className="hidden sm:inline-flex px-8 py-4 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-slate-600 rounded-lg hover:border-gray-400 dark:hover:border-slate-500 transition-colors font-medium text-lg items-center justify-center"
              >
                {language === 'ko' ? '일단 둘러보기' : 'Just Browse'}
              </button>
            </div>
          </motion.div>
        </section>
      ) : null}

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
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
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