'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTranslatedText, getColorCodes, getArtEmoji } from '@/lib/artTranslations';
import { getArtworkRecommendations } from '@/lib/artworkRecommendations';
import { calculatePersonalityFromSimulation } from '@/lib/simulationDesign';
import { getExhibitionRecommendation } from '@/lib/exhibitionRecommendations';
import PersonalityIcon from '@/components/PersonalityIcon';
import IDCard from '@/components/IDCard';

interface PersonalityResult {
  personalityType: string;
  personality?: {
    name?: { en: string; ko: string };
    description?: { en: string; ko: string };
    strengths?: { en: string[]; ko: string[] };
    artPreferences?: {
      movements: string[];
      colors: string[];
      themes: string[];
    };
  };
  confidence?: number;
  isScenarioQuiz?: boolean;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'ko'>('ko');
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailedData, setDetailedData] = useState<any>(null);
  const [showIDCard, setShowIDCard] = useState(false);

  useEffect(() => {
    const loadResultData = async () => {
      try {
        const storedResult = localStorage.getItem('quizResult');
        const personalityType = searchParams.get('type');
        
        let currentResult = null;
        
        if (storedResult) {
          currentResult = JSON.parse(storedResult);
        } else if (personalityType) {
          currentResult = { personalityType };
        } else {
          router.push('/quiz');
          return;
        }
        
        // Check if this is from scenario quiz
        const quizType = searchParams.get('type') || searchParams.get('quizType') || localStorage.getItem('lastQuizType');
        if (quizType === 'scenario') {
          currentResult.isScenarioQuiz = true;
          
          // Calculate personality from scenario responses
          const scenarioResponses = localStorage.getItem('scenarioResponses');
          if (scenarioResponses) {
            const responses = JSON.parse(scenarioResponses);
            const { type } = calculatePersonalityFromSimulation(responses);
            currentResult.personalityType = type;
          }
        }
        
        setResult(currentResult);
        
        // Fetch detailed personality data from backend
        if (currentResult?.personalityType) {
          const response = await fetch(`/api/personality-types?type=${currentResult.personalityType}`);
          const data = await response.json();
          
          if (data.success) {
            let personalityData = null;
            
            if (data.data) {
              personalityData = data.data.personalityData || data.data.personality || data.data;
            } else if (data.personalityData) {
              personalityData = data.personalityData;
            } else if (data.personality) {
              personalityData = data.personality;
            }
            
            if (!personalityData && data.type) {
              personalityData = {
                code: data.type,
                name: data.name,
                description: data.description,
                strengths: data.strengths,
                artPreferences: data.artPreferences
              };
            }
            
            setDetailedData(personalityData);
          }
        }
      } catch (error) {
        console.error('Failed to load personality data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadResultData();
  }, [searchParams, router]);

  const shareResult = () => {
    const text = `나의 미적 성향을 발견했어요: ${result?.personality?.name?.[language] || result?.personalityType}! SAYU 퀴즈로 당신의 성향도 찾아보세요.`;
    const url = window.location.origin;
    
    if (navigator.share) {
      navigator.share({ title: 'My SAYU Art Personality', text, url });
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">결과를 찾을 수 없습니다</h2>
          <button 
            onClick={() => router.push('/quiz')}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg"
          >
            퀴즈 다시 하기
          </button>
        </div>
      </div>
    );
  }

  const displayData = detailedData || result.personality;
  const artworkRecommendations = getArtworkRecommendations(result.personalityType);
  const exhibitionRecommendation = getExhibitionRecommendation(result.personalityType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ko' : 'en')}
          className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all"
        >
          {language === 'en' ? '한국어' : 'English'}
        </button>
      </div>

      <div className="container mx-auto px-4 py-12 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Personality Type Badge */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <PersonalityIcon type={result.personalityType} size="large" animated={true} />
            </div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-block"
            >
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full px-8 py-4 mb-6">
                <h1 className="text-4xl md:text-5xl font-bold">
                  {result.personalityType}
                </h1>
              </div>
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {displayData?.name?.[language] || (result.isScenarioQuiz 
                ? (language === 'ko' ? '당신의 예술적 성향' : 'Your Artistic Personality')
                : `${result.personalityType} 성향`)
              }
            </h2>

            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {displayData?.description?.[language] || (result.isScenarioQuiz
                ? (language === 'ko' 
                  ? '시나리오를 통해 발견한 당신만의 예술적 취향과 성향입니다.' 
                  : 'Your unique artistic taste discovered through scenarios.')
                : '당신의 독특한 미적 성향을 발견했습니다!')
              }
            </p>

            {result.confidence && (
              <div className="mt-6">
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-6 py-3">
                  <span className="text-white/60">신뢰도:</span>
                  <span className="font-bold">{Math.round(result.confidence)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Representative Artwork */}
          {artworkRecommendations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 mb-12"
            >
              <h3 className="text-xl md:text-2xl font-bold mb-8 flex items-center gap-2">
                <span className="text-3xl">🖼️</span>
                {language === 'ko' ? '당신을 위한 대표 작품' : 'Representative Artwork for You'}
              </h3>
              
              <div className="grid lg:grid-cols-2 gap-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="relative group w-full"
                >
                  <div className="relative overflow-hidden rounded-xl shadow-2xl aspect-[4/5]">
                    <img
                      src={artworkRecommendations.representativeWork.image}
                      alt={artworkRecommendations.representativeWork.title}
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-col justify-center"
                >
                  <h4 className="text-2xl md:text-3xl font-bold mb-3">
                    {artworkRecommendations.representativeWork.title}
                  </h4>
                  <p className="text-lg md:text-xl text-white/80 mb-2">
                    {artworkRecommendations.representativeWork.artist}
                  </p>
                  <p className="text-base md:text-lg text-white/60 mb-6">
                    <span className="whitespace-nowrap">{artworkRecommendations.representativeWork.year}</span> • <span className="whitespace-nowrap">{artworkRecommendations.representativeWork.museum}</span>
                  </p>
                  <p className="text-base md:text-lg text-white/90 leading-relaxed mb-6">
                    {artworkRecommendations.representativeWork.description[language]}
                  </p>
                  
                  {/* Recommendation Reason */}
                  {artworkRecommendations.representativeWork.recommendationReason && (
                    <div className="bg-purple-500/20 rounded-xl p-6 mt-6">
                      <p className="font-semibold mb-2">
                        {language === 'ko' ? '이 작품을 추천하는 이유:' : 'Why this artwork is recommended:'}
                      </p>
                      <p className="text-white/90">
                        {artworkRecommendations.representativeWork.recommendationReason[language]}
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Recommended Exhibition */}
          {exhibitionRecommendation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 mb-12"
            >
              <h3 className="text-xl md:text-2xl font-bold mb-8 flex items-center gap-2">
                <span className="text-3xl">📅</span>
                {language === 'ko' ? '추천 전시' : 'Recommended Exhibition'}
              </h3>
              
              <div className="grid lg:grid-cols-2 gap-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                  className="relative group w-full"
                >
                  <div className="relative overflow-hidden rounded-xl shadow-2xl aspect-[4/5]">
                    <img
                      src={exhibitionRecommendation.image}
                      alt={exhibitionRecommendation.title[language]}
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 }}
                  className="flex flex-col justify-center"
                >
                  <h4 className="text-xl md:text-2xl font-bold mb-3">
                    {exhibitionRecommendation.title[language]}
                  </h4>
                  <p className="text-base md:text-lg text-white/80 mb-2">
                    {exhibitionRecommendation.museum[language]}
                  </p>
                  <p className="text-base md:text-lg text-white/60 mb-6">
                    <span className="whitespace-nowrap">{exhibitionRecommendation.period[language]}</span>
                  </p>
                  
                  {/* Exhibition Recommendation Reason */}
                  <div className="bg-pink-500/20 rounded-xl p-6 mt-6">
                    <p className="font-semibold mb-2">
                      {language === 'ko' ? '이 전시를 추천하는 이유:' : 'Why this exhibition is recommended:'}
                    </p>
                    <p className="text-white/90">
                      {exhibitionRecommendation.recommendationReason[language]}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col md:flex-row gap-4 justify-center mb-20"
          >
            <button
              onClick={shareResult}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl font-bold text-lg hover:scale-105 transition-all"
            >
              {language === 'ko' ? '결과 공유하기 📤' : 'Share Results 📤'}
            </button>
            
            {result.isScenarioQuiz && (
              <button
                onClick={() => setShowIDCard(true)}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl font-bold text-lg hover:scale-105 transition-all"
              >
                {language === 'ko' ? 'ID 카드 발급받기 🪪' : 'Get ID Card 🪪'}
              </button>
            )}
            
            <Link
              href="/agent"
              className="px-8 py-4 bg-white/20 backdrop-blur-sm rounded-2xl font-bold text-lg hover:bg-white/30 transition-all text-center"
            >
              {language === 'ko' ? 'AI 큐레이터 만나기 🧭' : 'Meet AI Curator 🧭'}
            </Link>
            
            <Link
              href="/quiz"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-2xl font-bold text-lg hover:bg-white/20 transition-all text-center"
            >
              {language === 'ko' ? '퀴즈 다시하기 🔄' : 'Retake Quiz 🔄'}
            </Link>
          </motion.div>

          {/* Philosophical Message for Scenario Quiz - Moved to Bottom */}
          {result.isScenarioQuiz && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-300/30"
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2">
                  <span className="text-3xl">✨</span>
                  {language === 'ko' ? '당신의 예술 여정' : 'Your Art Journey'}
                </h3>
                <div className="space-y-4 text-lg leading-relaxed text-white/90 text-center">
                  <p className="text-xl font-medium">
                    {language === 'ko' 
                      ? '예술은 고정된 취향이 아닌 살아있는 경험입니다.'
                      : 'Art is not a fixed taste but a living experience.'
                    }
                  </p>
                  <p className="text-purple-200">
                    {language === 'ko'
                      ? '오늘의 ' + result.personalityType + '는 내일 새로운 모습으로 진화할 거예요.'
                      : "Today's " + result.personalityType + " will evolve into something new tomorrow."
                    }
                  </p>
                  <p className="font-semibold text-pink-200 text-2xl mt-6">
                    {language === 'ko'
                      ? '매 순간이 새로운 발견입니다 🎨'
                      : 'Every moment is a new discovery 🎨'
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Future Features Teaser */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="text-center mt-16 text-white/60"
          >
            <p className="text-lg mb-2">🚀 Coming Soon</p>
            <p>{language === 'ko' 
              ? '상세 분석 • 빌리지 커뮤니티 • 토큰 이코노미 • 갤러리 투어'
              : 'Detailed Analysis • Village Community • Token Economy • Gallery Tours'
            }</p>
          </motion.div>
        </motion.div>
      </div>
      
      {/* ID Card Modal */}
      {showIDCard && (
        <IDCard
          personalityType={result.personalityType}
          userName="SAYU Explorer"
          joinDate={new Date()}
          stats={{
            exhibitionsVisited: 5,
            artworksViewed: 42,
            hoursSpent: 12
          }}
          level={1}
          badges={['초보 감상가', '시나리오 퀴즈 완료', '예술 탐험가']}
          language={language}
          onClose={() => setShowIDCard(false)}
        />
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-xl">결과를 불러오는 중...</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}