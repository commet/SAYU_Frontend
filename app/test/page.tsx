'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sayubackend-production.up.railway.app';
      console.log('Testing API:', API_URL);
      
      const response = await fetch(`${API_URL}/api/health`);
      const data = await response.json();
      
      setResult(`✅ API 연결 성공!\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ API 연결 실패: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testQuiz = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sayubackend-production.up.railway.app';
      
      const response = await fetch(`${API_URL}/api/quiz/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: 'ko' }),
      });
      
      const data = await response.json();
      setResult(`✅ 퀴즈 시작 성공!\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ 퀴즈 시작 실패: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🔧 API 테스트</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={testAPI}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? '테스트 중...' : 'Health Check 테스트'}
          </button>
          
          <button
            onClick={testQuiz}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? '테스트 중...' : '퀴즈 시작 테스트'}
          </button>
        </div>

        <div className="bg-black/50 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">결과:</h2>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">
            {result || '테스트 버튼을 클릭하세요'}
          </pre>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold mb-2">환경 정보:</h3>
          <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'undefined'}</p>
        </div>
      </div>
    </div>
  );
}