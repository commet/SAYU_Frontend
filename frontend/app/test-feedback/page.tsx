'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function TestFeedbackPage() {
  const [feedback, setFeedback] = useState({
    type: 'general' as const,
    rating: 0,
    message: '',
    email: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const submitFeedback = async () => {
    if (!feedback.message.trim()) {
      setError('메시지를 입력해주세요.');
      return;
    }

    if (feedback.type === 'rating' && feedback.rating === 0) {
      setError('평점을 선택해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: feedback.type,
          rating: feedback.type === 'rating' ? feedback.rating : undefined,
          message: feedback.message,
          email: feedback.email || undefined,
          context: {
            page: 'test-feedback',
            feature: 'feedback-system-test'
          },
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        setFeedback({
          type: 'general',
          rating: 0,
          message: '',
          email: ''
        });
      } else {
        setError(result.error || '피드백 제출에 실패했습니다.');
      }
    } catch (err) {
      console.error('Feedback submission error:', err);
      setError('피드백 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8 max-w-md w-full text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            피드백이 제출되었습니다!
          </h2>
          <p className="text-gray-300 mb-6">
            소중한 의견 감사합니다. 검토 후 반영하겠습니다.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            다시 작성하기
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              피드백 시스템 테스트
            </h1>
            <p className="text-gray-300">
              새로운 피드백 저장 시스템을 테스트해보세요
            </p>
          </div>

          <div className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                피드백 유형
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: 'general', label: '일반', icon: '💬' },
                  { id: 'suggestion', label: '제안', icon: '💡' },
                  { id: 'bug', label: '버그', icon: '🐛' },
                  { id: 'rating', label: '평점', icon: '⭐' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFeedback(prev => ({ ...prev, type: type.id as any }))}
                    className={`p-3 rounded-lg border transition-all ${
                      feedback.type === type.id
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-lg mb-1">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Rating (only for rating type) */}
            {feedback.type === 'rating' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  평점
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setFeedback(prev => ({ ...prev, rating }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rating <= feedback.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-gray-400 text-sm mt-2">
                  {feedback.rating > 0 ? `${feedback.rating}/5` : '평점을 선택해주세요'}
                </p>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                메시지 *
              </label>
              <textarea
                value={feedback.message}
                onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
                placeholder="피드백을 자세히 작성해주세요..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={5}
              />
            </div>

            {/* Email (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                이메일 (선택사항)
              </label>
              <input
                type="email"
                value={feedback.email}
                onChange={(e) => setFeedback(prev => ({ ...prev, email: e.target.value }))}
                placeholder="답변을 받으려면 이메일을 입력해주세요"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <button
              onClick={submitFeedback}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {submitting ? '제출 중...' : '피드백 제출'}
            </button>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            테스트 방법
          </h3>
          <div className="space-y-2 text-gray-300 text-sm">
            <p>1. 위 폼을 사용해 피드백을 제출해보세요</p>
            <p>2. 관리자 대시보드 (/admin)에서 피드백 관리 탭을 확인하세요</p>
            <p>3. 피드백 전용 페이지 (/admin/feedback)에서 상세 관리 기능을 테스트하세요</p>
            <p>4. 필터, 정렬, 상태 변경 등의 기능을 확인하세요</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}