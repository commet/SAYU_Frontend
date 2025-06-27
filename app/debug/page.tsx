'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testDirectAPI = async () => {
    setLoading(true);
    setResult('테스트 시작...\n');
    
    try {
      // 1. 먼저 현재 도메인 확인
      const currentDomain = window.location.origin;
      setResult(prev => prev + `현재 도메인: ${currentDomain}\n`);
      
      // 2. Fetch API로 테스트
      setResult(prev => prev + '백엔드 연결 시도...\n');
      
      const response = await fetch('https://sayubackend-production.up.railway.app/api/quiz/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: 'ko' }),
      });
      
      setResult(prev => prev + `응답 상태: ${response.status}\n`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setResult(prev => prev + '✅ 성공!\n' + JSON.stringify(data, null, 2));
      
    } catch (error: any) {
      setResult(prev => prev + `❌ 오류: ${error.message}\n`);
      setResult(prev => prev + `오류 타입: ${error.constructor.name}\n`);
      setResult(prev => prev + `전체 오류: ${error.toString()}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testWithProxy = async () => {
    setLoading(true);
    setResult('프록시 테스트 시작...\n');
    
    try {
      // Next.js API route를 통한 프록시 테스트
      const response = await fetch('/api/test-backend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: 'ko' }),
      });
      
      const data = await response.json();
      setResult(prev => prev + '✅ 프록시 성공!\n' + JSON.stringify(data, null, 2));
      
    } catch (error: any) {
      setResult(prev => prev + `❌ 프록시 오류: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">🔧 API 연결 디버그</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={testDirectAPI}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? '테스트 중...' : '직접 API 테스트'}
          </button>
          
          <button
            onClick={testWithProxy}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? '테스트 중...' : '프록시 API 테스트'}
          </button>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">디버그 결과:</h2>
          <pre className="text-sm overflow-auto whitespace-pre-wrap font-mono bg-black p-4 rounded">
            {result || '테스트 버튼을 클릭하세요'}
          </pre>
        </div>

        <div className="mt-8 bg-gray-900 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-2">환경 정보:</h3>
          <p>현재 URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
          <p>User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}