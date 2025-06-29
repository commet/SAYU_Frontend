'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function TestGeminiPage() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const consultGemini = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `
SAYU 미술관 시뮬레이션 이미지 구현 전략:

현재 상황:
- Next.js 앱에 8단계 미술관 방문 시뮬레이션 구현
- 각 단계마다 배경 이미지 + 2개의 선택지 이미지 필요 (총 24개 이미지)
- 현재는 그라디언트 플레이스홀더 사용 중

요구사항:
1. 몰입감 있는 시각적 경험 필수
2. 일관된 아트 스타일 유지
3. 한국 사용자에게 친숙한 미술관 분위기
4. 빠른 로딩 속도

가능한 옵션들:
A) AI 이미지 생성 (DALL-E, Midjourney, Stable Diffusion)
B) 스톡 사진 구매/라이선스
C) 일러스트레이션 커미션
D) 실제 미술관 사진 촬영
E) 하이브리드 접근

다음을 고려해서 추천해주세요:
1. 가장 현실적이고 효과적인 접근 방법
2. 예산 대비 효과
3. 구현 속도
4. 법적 이슈 회피
5. 구체적인 실행 단계

특히 AI 이미지 생성을 사용한다면:
- 최적의 프롬프트 작성법
- 일관성 유지 방법
- 저작권 이슈 해결책
`
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setResponse(data.response);
      } else {
        setResponse('Error: ' + data.error);
      }
    } catch (error) {
      setResponse('Failed to consult Gemini');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-8">Gemini 이미지 전략 상담</h1>
          
          <button
            onClick={consultGemini}
            disabled={loading}
            className="bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all disabled:opacity-50"
          >
            {loading ? '상담 중...' : 'Gemini에게 물어보기'}
          </button>
          
          {response && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 bg-white/10 rounded-2xl p-6"
            >
              <h2 className="text-2xl font-bold mb-4">Gemini의 조언:</h2>
              <div className="whitespace-pre-wrap text-white/90">
                {response}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}