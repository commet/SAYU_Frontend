'use client';

import { useState } from 'react';
import { saveQuizResultsWithSync, getQuizResults, migrateLocalQuizResults } from '@/lib/quiz-api';
import { useAuth } from '@/hooks/useAuth';

export default function TestQuizSave() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string[]>([]);
  const [savedData, setSavedData] = useState<any>(null);

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSaveResults = async () => {
    addStatus('테스트 시작...');
    
    // Mock quiz results
    const mockResults = {
      personalityType: 'SAMF',
      scores: { S: 10, A: 8, M: 7, F: 9 },
      responses: [
        { questionId: 1, choice: 'A' },
        { questionId: 2, choice: 'B' }
      ],
      completedAt: new Date().toISOString()
    };

    try {
      addStatus('결과 저장 중...');
      await saveQuizResultsWithSync(mockResults);
      addStatus('✅ 결과 저장 완료!');
      
      // Check localStorage
      const localData = localStorage.getItem('quizResults');
      if (localData) {
        addStatus('✅ localStorage에 저장됨');
      }
    } catch (error) {
      addStatus(`❌ 에러: ${error}`);
    }
  };

  const testGetResults = async () => {
    addStatus('백엔드에서 결과 가져오기...');
    
    try {
      const results = await getQuizResults();
      setSavedData(results);
      addStatus('✅ 결과 가져오기 성공!');
    } catch (error) {
      addStatus(`❌ 에러: ${error}`);
    }
  };

  const testMigration = async () => {
    addStatus('localStorage → 백엔드 마이그레이션...');
    
    try {
      await migrateLocalQuizResults();
      addStatus('✅ 마이그레이션 완료!');
    } catch (error) {
      addStatus(`❌ 에러: ${error}`);
    }
  };

  const checkLocalStorage = () => {
    const data = localStorage.getItem('quizResults');
    if (data) {
      setSavedData(JSON.parse(data));
      addStatus('✅ localStorage 데이터 확인');
    } else {
      addStatus('❌ localStorage에 데이터 없음');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Quiz Results 저장 테스트</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">상태</h2>
          <p className="mb-4">
            로그인 상태: {user ? `✅ 로그인됨 (${user.auth?.email})` : '❌ 로그인 안됨'}
          </p>
          
          <div className="space-y-4">
            <button
              onClick={testSaveResults}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              1. 퀴즈 결과 저장 테스트
            </button>
            
            <button
              onClick={checkLocalStorage}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-4"
            >
              2. localStorage 확인
            </button>
            
            <button
              onClick={testGetResults}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 ml-4"
              disabled={!user}
            >
              3. 백엔드에서 가져오기 (로그인 필요)
            </button>
            
            <button
              onClick={testMigration}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 ml-4"
              disabled={!user}
            >
              4. 마이그레이션 테스트 (로그인 필요)
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">로그</h2>
          <div className="bg-gray-100 rounded p-4 font-mono text-sm">
            {status.map((s, i) => (
              <div key={i} className="mb-1">{s}</div>
            ))}
          </div>
        </div>

        {savedData && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">저장된 데이터</h2>
            <pre className="bg-gray-100 rounded p-4 overflow-x-auto text-sm">
              {JSON.stringify(savedData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}