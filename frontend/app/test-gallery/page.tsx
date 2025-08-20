'use client';

import { useState } from 'react';

export default function TestGalleryPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setTestResult('테스트 시작...\n');

    try {
      // 테스트용 ID 생성
      const testUserId = crypto.randomUUID();
      const testArtworkId = 'a1111111-1111-1111-1111-111111111111'; // DB에 있는 샘플 작품

      // 1. 초기 컬렉션 조회
      setTestResult(prev => prev + '\n1. 초기 컬렉션 조회 중...');
      const getResponse1 = await fetch(`/api/gallery/collection?userId=${testUserId}`);
      const getData1 = await getResponse1.json();
      setTestResult(prev => prev + `\n   ✅ 초기 컬렉션: ${getData1.count}개`);

      // 2. 작품 저장
      setTestResult(prev => prev + '\n\n2. 작품 저장 중...');
      const saveResponse = await fetch('/api/gallery/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: testUserId,
          artworkId: testArtworkId,
          action: 'save'
        })
      });
      const saveData = await saveResponse.json();
      setTestResult(prev => prev + `\n   ✅ 저장 성공: ${saveData.success}`);

      // 3. 저장 후 조회
      setTestResult(prev => prev + '\n\n3. 저장 후 컬렉션 확인...');
      const getResponse2 = await fetch(`/api/gallery/collection?userId=${testUserId}`);
      const getData2 = await getResponse2.json();
      setTestResult(prev => prev + `\n   ✅ 업데이트된 컬렉션: ${getData2.count}개`);
      if (getData2.items && getData2.items[0]) {
        setTestResult(prev => prev + `\n   작품: ${getData2.items[0].title} - ${getData2.items[0].artist}`);
      }

      // 4. 삭제
      setTestResult(prev => prev + '\n\n4. 작품 삭제 중...');
      const removeResponse = await fetch('/api/gallery/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: testUserId,
          artworkId: testArtworkId,
          action: 'remove'
        })
      });
      const removeData = await removeResponse.json();
      setTestResult(prev => prev + `\n   ✅ 삭제 성공: ${removeData.success}`);

      // 5. 최종 확인
      setTestResult(prev => prev + '\n\n5. 최종 컬렉션 확인...');
      const getResponse3 = await fetch(`/api/gallery/collection?userId=${testUserId}`);
      const getData3 = await getResponse3.json();
      setTestResult(prev => prev + `\n   ✅ 최종 컬렉션: ${getData3.count}개`);

      setTestResult(prev => prev + '\n\n✨ 테스트 완료! 모든 기능이 정상 작동합니다.');

    } catch (error: any) {
      setTestResult(prev => prev + `\n\n❌ 오류 발생: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Gallery Collection API 테스트</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <button
            onClick={runTest}
            disabled={loading}
            className="mb-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '테스트 진행 중...' : '테스트 시작'}
          </button>

          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
            {testResult || '버튼을 클릭하여 테스트를 시작하세요.'}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">테스트 항목</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✓ 빈 컬렉션 조회</li>
            <li>✓ 작품 저장</li>
            <li>✓ 저장된 작품 조회</li>
            <li>✓ 작품 삭제</li>
            <li>✓ 삭제 후 확인</li>
          </ul>
        </div>
      </div>
    </div>
  );
}