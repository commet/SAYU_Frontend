'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const storedResult = localStorage.getItem('quizResult');
    const personalityType = searchParams.get('type');

    if (storedResult) {
      setResult(JSON.parse(storedResult));
    } else if (personalityType) {
      setResult({ personalityType });
    } else {
      router.push('/quiz');
    }
  }, [searchParams, router]);

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
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">🎨 당신의 미적 성향</h1>
          <h2 className="text-3xl font-semibold text-purple-300 mb-6">
            {result.personalityType || '미적 성향'}
          </h2>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4">✨ 분석 완료</h3>
            <p className="text-gray-300 leading-relaxed">
              당신만의 독특한 미적 감각을 바탕으로 개인화된 예술 경험을 제공합니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `내 미적 성향: ${result.personalityType}`,
                    text: 'SAYU에서 내 미적 성향을 발견했어요!',
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('링크가 복사되었습니다!');
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-lg font-semibold"
            >
              결과 공유하기 📤
            </button>
            <button
              onClick={() => router.push('/quiz')}
              className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-lg font-semibold border border-white/30"
            >
              다시 테스트하기 🔄
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 hover:bg-gray-700 px-8 py-3 rounded-lg font-semibold"
            >
              홈으로 돌아가기 🏠
            </button>
          </div>
        </div>
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