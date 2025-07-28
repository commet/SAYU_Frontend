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
  scores?: Record<string, number>;
  isScenarioQuiz?: boolean;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [language, setLanguage] = useState<'en' | 'ko'>('ko');
  const [loading, setLoading] = useState(true);
  const [detailedData, setDetailedData] = useState<any>(null);
  const [showIDCard, setShowIDCard] = useState(false);

  useEffect(() => {
    const loadResultData = async () => {
      try {
        const storedResult = localStorage.getItem('quizResult');
        const personalityType = searchParams?.get('type');
        
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
        const quizType = searchParams?.get('type') || searchParams?.get('quizType') || localStorage.getItem('lastQuizType');
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
          
          console.log('API Response:', data); // Debug log
          
          if (data.success) {
            // Handle different response structures from backend
            let personalityData = null;
            
            // Try different possible data structures
            if (data.data) {
              personalityData = data.data.personalityData || data.data.personality || data.data;
            } else if (data.personalityData) {
              personalityData = data.personalityData;
            } else if (data.personality) {
              personalityData = data.personality;
            }
            
            // If still no data, create from the result itself
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
            console.log('Detailed Data Set:', personalityData); // Debug log
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

  // Use detailed data if available, otherwise fallback to basic result
  const displayData = detailedData || result.personality;
  
  // Get artwork recommendations for this personality type
  const artworkRecommendations = getArtworkRecommendations(result.personalityType);

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
            {/* Personality Icon */}
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

            {/* Confidence Score */}
            {result.confidence && (
              <div className="mt-6">
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-6 py-3">
                  <span className="text-white/60">신뢰도:</span>
                  <span className="font-bold">{Math.round(result.confidence)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Philosophical Message for Scenario Quiz */}
          {result.isScenarioQuiz && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-purple-300/30"
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                  <span className="text-3xl">🌊</span>
                  {language === 'ko' ? '당신의 미술 취향은 여정입니다' : 'Your Art Taste is a Journey'}
                </h3>
                <div className="space-y-4 text-lg leading-relaxed text-white/90">
                  <p>
                    {language === 'ko' 
                      ? 'APT와 달리, 당신의 미술 취향은 고정되어 있지 않습니다. 그것은 당신과 함께 성장하고, 진화하며, 새로운 경험과 감정에 따라 변화합니다.'
                      : 'Unlike APT, your art taste is not fixed. It grows with you, evolves, and transforms with new experiences and emotions.'
                    }
                  </p>
                  <p className="text-purple-200">
                    {language === 'ko'
                      ? '오늘의 ' + result.personalityType + '는 내일의 다른 모습으로 변할 수 있습니다. 이것이 예술의 아름다움입니다 - 끊임없이 변화하는 당신을 반영합니다.'
                      : "Today's " + result.personalityType + " may transform into something different tomorrow. That's the beauty of art - it reflects your ever-changing self."
                    }
                  </p>
                  <p className="font-semibold text-pink-200">
                    {language === 'ko'
                      ? '🎨 예술과 함께하는 당신의 여정을 즐기세요. 각 순간이 새로운 발견입니다.'
                      : '🎨 Enjoy your journey with art. Every moment is a new discovery.'
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Strengths */}
          {displayData?.strengths?.[language] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8"
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-3xl">💪</span>
                당신의 강점
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayData.strengths[language].map((strength, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
                  >
                    <span className="text-2xl">✨</span>
                    <span className="text-lg font-medium">{strength}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Art DNA */}
          {displayData?.artPreferences && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8"
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-3xl">🎨</span>
                당신의 예술 성격
              </h3>
              
              <div className="space-y-6">
                {displayData.artPreferences.movements && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <h4 className="text-lg font-semibold mb-3 text-pink-300 flex items-center gap-2">
                      <span className="text-xl">🏛️</span>
                      선호 사조
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {displayData.artPreferences.movements.map((movement, index) => {
                        const translatedMovement = getTranslatedText('movements', movement, language);
                        const emoji = getArtEmoji('movements', movement);
                        return (
                          <motion.span 
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.9 + index * 0.1 }}
                            className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-300/30 rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2"
                          >
                            <span>{emoji}</span>
                            {translatedMovement}
                          </motion.span>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {displayData.artPreferences.colors && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <h4 className="text-lg font-semibold mb-3 text-blue-300 flex items-center gap-2">
                      <span className="text-xl">🎨</span>
                      색상 팔레트
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {displayData.artPreferences.colors.map((color, index) => {
                        const translatedColor = getTranslatedText('colors', color, language);
                        const colorCodes = getColorCodes(color);
                        return (
                          <motion.span 
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.1 + index * 0.1 }}
                            className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-300/30 rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2"
                          >
                            <div className="flex gap-1">
                              {colorCodes.slice(0, 3).map((colorCode, i) => (
                                <div
                                  key={i}
                                  className="w-3 h-3 rounded-full border border-white/30"
                                  style={{ backgroundColor: colorCode }}
                                />
                              ))}
                            </div>
                            {translatedColor}
                          </motion.span>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {displayData.artPreferences.themes && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    <h4 className="text-lg font-semibold mb-3 text-purple-300 flex items-center gap-2">
                      <span className="text-xl">💭</span>
                      관심 주제
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {displayData.artPreferences.themes.map((theme, index) => {
                        const translatedTheme = getTranslatedText('themes', theme, language);
                        const emoji = getArtEmoji('themes', theme);
                        return (
                          <motion.span 
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.3 + index * 0.1 }}
                            className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-300/30 rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2"
                          >
                            <span>{emoji}</span>
                            {translatedTheme}
                          </motion.span>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Representative Artwork */}
          {artworkRecommendations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8"
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-3xl">🖼️</span>
                당신을 위한 대표 작품
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Main Artwork */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0 }}
                  className="relative group"
                >
                  <div className="relative overflow-hidden rounded-xl shadow-2xl">
                    <img
                      src={artworkRecommendations.representativeWork.image}
                      alt={artworkRecommendations.representativeWork.title}
                      className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </motion.div>
                
                {/* Artwork Info */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 }}
                  className="flex flex-col justify-center"
                >
                  <h4 className="text-3xl font-bold mb-2">
                    {artworkRecommendations.representativeWork.title}
                  </h4>
                  <p className="text-xl text-white/80 mb-1">
                    {artworkRecommendations.representativeWork.artist}
                  </p>
                  <p className="text-lg text-white/60 mb-4">
                    {artworkRecommendations.representativeWork.year} • {artworkRecommendations.representativeWork.museum}
                  </p>
                  <p className="text-lg text-white/90 leading-relaxed">
                    {artworkRecommendations.representativeWork.description[language]}
                  </p>
                  
                  {/* Additional Works Preview */}
                  {artworkRecommendations.additionalWorks && artworkRecommendations.additionalWorks.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm text-white/60 mb-3">다른 추천 작품들:</p>
                      <div className="flex gap-3">
                        {artworkRecommendations.additionalWorks.slice(0, 3).map((work, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 + index * 0.1 }}
                            className="relative w-20 h-20 overflow-hidden rounded-lg shadow-lg group cursor-pointer"
                          >
                            <img
                              src={work.image}
                              alt={work.title}
                              className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <span className="text-xs text-white text-center px-1">{work.title}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Default Message if no detailed data */}
          {!displayData && !artworkRecommendations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8"
            >
              <h3 className="text-2xl font-bold mb-4">✨ 분석 완료</h3>
              <p className="text-lg text-white/80">
                당신만의 독특한 미적 감각을 바탕으로 개인화된 예술 경험을 제공합니다.
                더 상세한 분석을 위해 다른 기능들을 탐험해보세요!
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <button
              onClick={shareResult}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl font-bold text-lg hover:scale-105 transition-all"
            >
              결과 공유하기 📤
            </button>
            
            {result.isScenarioQuiz && (
              <button
                onClick={() => setShowIDCard(true)}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl font-bold text-lg hover:scale-105 transition-all"
              >
                ID 카드 발급받기 🪪
              </button>
            )}
            
            <Link
              href="/agent"
              className="px-8 py-4 bg-white/20 backdrop-blur-sm rounded-2xl font-bold text-lg hover:bg-white/30 transition-all text-center"
            >
              AI 큐레이터 만나기 🧭
            </Link>
            
            <Link
              href="/quiz"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-2xl font-bold text-lg hover:bg-white/20 transition-all text-center"
            >
              퀴즈 다시하기 🔄
            </Link>
          </motion.div>

          {/* Future Features Teaser */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-16 text-white/60"
          >
            <p className="text-lg mb-2">🚀 Coming Soon</p>
            <p>상세 분석 • 빌리지 커뮤니티 • 토큰 이코노미 • 갤러리 투어</p>
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