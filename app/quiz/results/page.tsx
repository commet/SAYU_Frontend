'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedResult = localStorage.getItem('quizResult');
    const personalityType = searchParams.get('type');

    if (storedResult) {
      const parsedResult = JSON.parse(storedResult);
      setResult(parsedResult);
      loadRecommendations(parsedResult.personalityType);
    } else if (personalityType) {
      // Fallback for direct access
      setResult({ personalityType });
      loadRecommendations(personalityType);
    } else {
      router.push('/quiz');
    }
  }, [searchParams, router]);

  const loadRecommendations = async (personalityType: string) => {
    try {
      const recs = await api.recommendations.get(personalityType, 'ko');
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const shareResult = () => {
    if (navigator.share) {
      navigator.share({
        title: `내 미적 성향: ${result?.personalityType}`,
        text: `SAYU에서 내 미적 성향을 발견했어요!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-xl">결과를 불러오는 중...</div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">🎨 당신의 미적 성향</h1>
            <h2 className="text-3xl font-semibold text-purple-300 mb-6">
              {result.personalityType}
            </h2>
            {result.personalityName && (
              <p className="text-xl text-gray-300 mb-8">
                {result.personalityName.ko || result.personalityName.en}
              </p>
            )}
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Personality Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20"
            >
              <h3 className="text-2xl font-bold mb-4">✨ 성향 분석</h3>
              {result.description ? (
                <p className="text-gray-300 leading-relaxed">
                  {result.description.ko || result.description.en}
                </p>
              ) : (
                <p className="text-gray-300 leading-relaxed">
                  당신의 독특한 미적 감각을 바탕으로 개인화된 예술 경험을 추천드립니다.
                </p>
              )}
            </motion.div>

            {/* Confidence Scores */}
            {result.confidence && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20"
              >
                <h3 className="text-2xl font-bold mb-4">📊 성향 분포</h3>
                <div className="space-y-4">
                  {Object.entries(result.confidence).map(([axis, score]: [string, any]) => (
                    <div key={axis}>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">{axis}</span>
                        <span className="text-white font-semibold">{Math.round(score * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${score * 100}%` }}
                          transition={{ delay: 0.6, duration: 1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Recommendations */}
          {recommendations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-12"
            >
              <h3 className="text-2xl font-bold mb-6">🎯 추천 예술 작품</h3>
              {recommendations.recommendations && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.recommendations.movements && (
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-purple-300">
                        추천 예술 운동
                      </h4>
                      <ul className="space-y-2">
                        {recommendations.recommendations.movements.map((movement: string, index: number) => (
                          <li key={index} className="text-gray-300 flex items-center">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                            {movement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {recommendations.recommendations.artists && (
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-pink-300">
                        추천 작가
                      </h4>
                      <ul className="space-y-2">
                        {recommendations.recommendations.artists.map((artist: string, index: number) => (
                          <li key={index} className="text-gray-300 flex items-center">
                            <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                            {artist}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={shareResult}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-lg font-semibold transition-all"
            >
              결과 공유하기 📤
            </button>
            <button
              onClick={() => router.push('/quiz')}
              className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-lg font-semibold border border-white/30 transition-all"
            >
              다시 테스트하기 🔄
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 hover:bg-gray-700 px-8 py-3 rounded-lg font-semibold transition-all"
            >
              홈으로 돌아가기 🏠
            </button>
          </div>
        </motion.div>
      </div>
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