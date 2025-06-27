'use client';

import { useState } from 'react';

export default function SimpleQuizPage() {
  const [step, setStep] = useState(0);
  const [sessionId, setSessionId] = useState<string>('');

  const startQuiz = async () => {
    try {
      const response = await fetch('https://sayubackend-production.up.railway.app/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'ko' }),
      });
      
      const data = await response.json();
      if (data.success) {
        setSessionId(data.sessionId);
        setStep(1);
      } else {
        alert('퀴즈 시작 실패');
      }
    } catch (error) {
      alert('네트워크 오류: ' + error);
    }
  };

  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-8">🎨 SAYU 퀴즈</h1>
          <p className="text-xl mb-8">당신의 미적 성향을 발견해보세요</p>
          <button
            onClick={startQuiz}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-lg text-lg font-semibold"
          >
            퀴즈 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">✅ 퀴즈 연결 성공!</h1>
        <p className="text-xl mb-4">세션 ID: {sessionId}</p>
        <p className="text-lg text-gray-300">백엔드 연결이 정상적으로 작동합니다.</p>
        <div className="mt-8">
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}