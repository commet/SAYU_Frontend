'use client';

import { useState, useEffect } from 'react';

export default function QuizPage() {
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    startQuiz();
  }, []);

  const startQuiz = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('https://sayubackend-production.up.railway.app/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'ko' }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Quiz data:', data);
      
      if (data.success) {
        setSessionId(data.sessionId);
        setCurrentQuestion(data.currentQuestion);
      } else {
        setError('퀴즈 시작 실패: ' + data.message);
      }
    } catch (err) {
      console.error('Quiz start error:', err);
      setError('네트워크 연결 오류: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (choiceId: string) => {
    if (!sessionId || !currentQuestion) return;
    
    try {
      const response = await fetch('https://sayubackend-production.up.railway.app/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          choiceId,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.completed) {
          alert(`퀴즈 완료! 당신의 성향: ${data.result.personalityType}`);
        } else {
          setCurrentQuestion(data.nextQuestion);
        }
      }
    } catch (err) {
      alert('답변 제출 오류: ' + err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl">퀴즈를 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">⚠️ 오류 발생</h1>
          <p className="text-lg mb-6">{error}</p>
          <button
            onClick={startQuiz}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">질문을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🎨 SAYU 퀴즈</h1>
          <p className="text-lg opacity-80">세션 ID: {sessionId.slice(0, 8)}...</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">{currentQuestion.scenario?.ko}</h2>
          <p className="text-xl mb-6">{currentQuestion.question?.ko}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentQuestion.choices?.map((choice: any) => (
            <button
              key={choice.id}
              onClick={() => submitAnswer(choice.id)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl p-6 text-left transition-all transform hover:scale-105 border-2 border-transparent hover:border-white/30"
            >
              <div className="text-3xl mb-3">{choice.id === 'A' ? '🚪' : '🌙'}</div>
              <h3 className="text-xl font-semibold mb-2">{choice.text?.ko}</h3>
              <span className="absolute top-4 right-4 text-2xl opacity-30">{choice.id}</span>
            </button>
          ))}
        </div>

        <div className="text-center mt-8">
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