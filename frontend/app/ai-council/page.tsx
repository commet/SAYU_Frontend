'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CouncilResult {
  success: boolean;
  response?: string;
  responses?: {
    claude?: {
      success: boolean;
      response: string;
      error?: string;
    };
    gemini?: {
      success: boolean;
      response: string;
      error?: string;
    };
    chatgpt?: {
      success: boolean;
      response: string;
      error?: string;
    };
  };
  synthesis?: string;
  error?: string;
  model?: string;
}

export default function AICouncilPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [councilResult, setCouncilResult] = useState<CouncilResult | null>(null);

  const consultAICouncil = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/ai-council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: {
            claudePerspective: "As the facilitator, I believe we should focus on creating an immersive, emotionally resonant experience that connects users with art on a personal level."
          }
        })
      });
      
      const data = await response.json();
      setCouncilResult(data);
    } catch (error) {
      console.error('Council error:', error);
      setCouncilResult({ success: false, error: 'Failed to convene AI council' });
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "SAYU 미술관 시뮬레이션에서 사용자 몰입도를 높이는 최적의 방법은?",
    "16가지 성격 유형에 맞는 예술 작품을 추천하는 AI 알고리즘 설계는?",
    "감정 기반 예술 큐레이션 vs 스타일 기반 큐레이션, 어느 것이 더 효과적일까?",
    "미술관 방문 시뮬레이션에 VR/AR을 통합하는 것이 좋을까?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-bold mb-4 text-center">🤖 AI Council Chamber</h1>
          <p className="text-xl text-white/80 text-center mb-12">
            Claude, Gemini, ChatGPT가 함께 고민합니다
          </p>

          {/* Question Input */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">질문을 입력하세요</h2>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="예: SAYU 프로젝트에서 가장 중요한 UX 요소는 무엇일까요?"
              className="w-full h-32 px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            
            <div className="mt-4 flex flex-wrap gap-2">
              {sampleQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => setQuestion(q)}
                  className="text-sm px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 transition-all"
                >
                  {q.slice(0, 30)}...
                </button>
              ))}
            </div>
            
            <button
              onClick={consultAICouncil}
              disabled={loading || !question.trim()}
              className="mt-6 w-full bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
            >
              {loading ? '🤔 AI들이 고민 중...' : '🚀 AI Council 소집하기'}
            </button>
          </div>

          {/* Results */}
          <AnimatePresence>
            {councilResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Individual AI Responses */}
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Claude */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-blue-500/20 backdrop-blur-sm rounded-2xl p-6"
                  >
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <span className="text-2xl">🔵</span> Claude
                    </h3>
                    <p className="text-white/90 text-sm">
                      {councilResult.responses?.claude?.response || 'No response'}
                    </p>
                  </motion.div>

                  {/* Gemini */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-purple-500/20 backdrop-blur-sm rounded-2xl p-6"
                  >
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <span className="text-2xl">🟣</span> Gemini
                    </h3>
                    <p className="text-white/90 text-sm">
                      {councilResult.responses?.gemini?.success 
                        ? councilResult.responses.gemini.response 
                        : `Error: ${councilResult.responses?.gemini?.error}`}
                    </p>
                  </motion.div>

                  {/* ChatGPT */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-green-500/20 backdrop-blur-sm rounded-2xl p-6"
                  >
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <span className="text-2xl">🟢</span> ChatGPT
                    </h3>
                    <p className="text-white/90 text-sm">
                      {councilResult.responses?.chatgpt?.success 
                        ? councilResult.responses.chatgpt.response 
                        : `Error: ${councilResult.responses?.chatgpt?.error}`}
                    </p>
                  </motion.div>
                </div>

                {/* Synthesis */}
                {councilResult.synthesis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-8"
                  >
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <span className="text-3xl">🤝</span> AI Council 종합 의견
                    </h3>
                    <div className="text-white/90 whitespace-pre-wrap">
                      {councilResult.synthesis}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}