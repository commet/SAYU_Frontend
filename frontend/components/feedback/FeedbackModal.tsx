'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MessageCircle, Bug, Lightbulb, Heart, Send, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextData?: {
    page?: string;
    personalityType?: string;
    feature?: string;
  };
}

type FeedbackType = 'rating' | 'suggestion' | 'bug' | 'general';

export default function FeedbackModal({ isOpen, onClose, contextData }: FeedbackModalProps) {
  const { language } = useLanguage();
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('rating');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const feedbackTypes = {
    rating: {
      icon: Star,
      label: language === 'ko' ? '평점 및 리뷰' : 'Rating & Review',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 hover:bg-yellow-200'
    },
    suggestion: {
      icon: Lightbulb,
      label: language === 'ko' ? '개선 제안' : 'Suggestion',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 hover:bg-blue-200'
    },
    bug: {
      icon: Bug,
      label: language === 'ko' ? '버그 신고' : 'Bug Report',
      color: 'text-red-500',
      bgColor: 'bg-red-100 hover:bg-red-200'
    },
    general: {
      icon: MessageCircle,
      label: language === 'ko' ? '일반 피드백' : 'General Feedback',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 hover:bg-purple-200'
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const feedbackData = {
        type: feedbackType,
        rating: feedbackType === 'rating' ? rating : undefined,
        message,
        email: email || undefined,
        context: contextData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setIsSubmitted(true);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);

    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert(language === 'ko' ? '피드백 전송에 실패했습니다. 다시 시도해주세요.' : 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFeedbackType('rating');
    setRating(0);
    setMessage('');
    setEmail('');
    setIsSubmitted(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'ko' ? '피드백 보내기' : 'Send Feedback'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {isSubmitted ? (
              /* Success State */
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Heart className="w-8 h-8 text-green-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'ko' ? '피드백이 전송되었습니다!' : 'Feedback Sent!'}
                </h3>
                <p className="text-gray-600">
                  {language === 'ko' 
                    ? '소중한 의견 감사합니다. 더 나은 서비스를 위해 반영하겠습니다.'
                    : 'Thank you for your valuable feedback. We will use it to improve our service.'
                  }
                </p>
              </div>
            ) : (
              /* Feedback Form */
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Feedback Type Selection */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    {language === 'ko' ? '피드백 유형' : 'Feedback Type'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(feedbackTypes).map(([key, type]) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setFeedbackType(key as FeedbackType)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            feedbackType === key
                              ? `border-purple-500 ${type.bgColor}`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${type.color} mx-auto mb-2`} />
                          <span className="text-sm font-medium text-gray-700">
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rating (only for rating type) */}
                {feedbackType === 'rating' && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      {language === 'ko' ? '평점' : 'Rating'}
                    </h3>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {rating > 0 && `${rating}/5`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Message */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    {language === 'ko' ? '메시지' : 'Message'}
                  </h3>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      language === 'ko'
                        ? '자세한 의견이나 제안사항을 알려주세요...'
                        : 'Please share your detailed feedback or suggestions...'
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    rows={4}
                    required
                  />
                </div>

                {/* Email (optional) */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    {language === 'ko' ? '이메일 (선택사항)' : 'Email (Optional)'}
                  </h3>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      language === 'ko'
                        ? '답변을 받으시려면 이메일을 입력해주세요'
                        : 'Enter your email to receive a response'
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* Context Info */}
                {contextData && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <p>
                      {language === 'ko' ? '현재 페이지: ' : 'Current page: '}
                      {contextData.page || 'Unknown'}
                    </p>
                    {contextData.personalityType && (
                      <p>
                        {language === 'ko' ? '성격 유형: ' : 'Personality type: '}
                        {contextData.personalityType}
                      </p>
                    )}
                    {contextData.feature && (
                      <p>
                        {language === 'ko' ? '기능: ' : 'Feature: '}
                        {contextData.feature}
                      </p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim() || (feedbackType === 'rating' && rating === 0)}
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {language === 'ko' ? '전송 중...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {language === 'ko' ? '피드백 보내기' : 'Send Feedback'}
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}