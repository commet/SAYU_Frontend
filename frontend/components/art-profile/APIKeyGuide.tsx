'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Key, Sparkles, Copy, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface APIKeyGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function APIKeyGuide({ isOpen, onClose }: APIKeyGuideProps) {
  const { language } = useLanguage();
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = language === 'ko' ? [
    {
      title: '1. Hugging Face 회원가입',
      description: 'Hugging Face 웹사이트에서 무료 계정을 생성하세요',
      action: 'https://huggingface.co/join',
      actionText: '회원가입하기'
    },
    {
      title: '2. API 토큰 생성',
      description: '프로필 설정에서 "Access Tokens" 메뉴로 이동하세요',
      action: 'https://huggingface.co/settings/tokens',
      actionText: '토큰 페이지 열기'
    },
    {
      title: '3. 토큰 복사',
      description: '"New token" 버튼을 클릭하고 생성된 토큰을 복사하세요',
      note: '토큰은 hf_로 시작하는 긴 문자열입니다'
    },
    {
      title: '4. 환경변수 설정',
      description: 'frontend/.env.local 파일에서 아래 라인을 찾아 수정하세요:',
      code: 'NEXT_PUBLIC_HUGGINGFACE_API_KEY=여기에_복사한_토큰_붙여넣기',
      note: '파일을 저장하고 브라우저를 새로고침하세요'
    }
  ] : [
    {
      title: '1. Sign up for Hugging Face',
      description: 'Create a free account on Hugging Face website',
      action: 'https://huggingface.co/join',
      actionText: 'Sign Up'
    },
    {
      title: '2. Generate API Token',
      description: 'Go to your profile settings and navigate to "Access Tokens"',
      action: 'https://huggingface.co/settings/tokens',
      actionText: 'Open Token Page'
    },
    {
      title: '3. Copy Token',
      description: 'Click "New token" button and copy the generated token',
      note: 'Token starts with hf_ followed by a long string'
    },
    {
      title: '4. Set Environment Variable',
      description: 'Find this line in frontend/.env.local file and modify it:',
      code: 'NEXT_PUBLIC_HUGGINGFACE_API_KEY=paste_your_copied_token_here',
      note: 'Save the file and refresh your browser'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {language === 'ko' ? 'AI 모델 사용 설정' : 'Enable AI Models'}
                  </h2>
                  <p className="text-sm text-gray-300">
                    {language === 'ko' 
                      ? '진짜 AI 아트 생성을 위한 API 키 설정' 
                      : 'Set up API key for real AI art generation'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Current Status */}
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-200">
                  {language === 'ko' ? '현재 상태: 데모 모드' : 'Current Status: Demo Mode'}
                </span>
              </div>
              <p className="text-xs text-yellow-200/80">
                {language === 'ko' 
                  ? 'Canvas 기반 효과를 사용하고 있습니다. 진짜 AI 모델을 사용하려면 아래 단계를 따라하세요.'
                  : 'Using Canvas-based effects. Follow the steps below to use real AI models.'
                }
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl"
                >
                  <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-300 mb-3">{step.description}</p>
                  
                  {step.action && (
                    <a
                      href={step.action}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-200 hover:bg-blue-500/30 transition-colors text-sm"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {step.actionText}
                    </a>
                  )}
                  
                  {step.code && (
                    <div className="mt-3">
                      <div className="relative">
                        <pre className="bg-black/30 border border-gray-600 rounded p-3 text-xs text-gray-200 overflow-x-auto">
                          <code>{step.code}</code>
                        </pre>
                        <button
                          onClick={() => copyToClipboard(step.code, index)}
                          className="absolute top-2 right-2 p-1 bg-white/10 rounded hover:bg-white/20 transition-colors"
                        >
                          {copiedStep === index ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {step.note && (
                    <p className="text-xs text-gray-400 mt-2">💡 {step.note}</p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Benefits */}
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <h3 className="font-semibold text-green-200 mb-2">
                {language === 'ko' ? '🎨 AI 모델 사용시 혜택' : '🎨 Benefits of AI Models'}
              </h3>
              <ul className="text-sm text-green-200/80 space-y-1">
                <li>• {language === 'ko' ? '전문적 수준의 아트 스타일 변환' : 'Professional-level art style transformation'}</li>
                <li>• {language === 'ko' ? '8가지 고급 AI 모델 (Stable Diffusion, OpenJourney 등)' : '8 advanced AI models (Stable Diffusion, OpenJourney, etc.)'}</li>
                <li>• {language === 'ko' ? '더욱 정교하고 사실적인 결과물' : 'More sophisticated and realistic results'}</li>
                <li>• {language === 'ko' ? '무료 Hugging Face 계정으로 사용 가능' : 'Available with free Hugging Face account'}</li>
              </ul>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                {language === 'ko' ? '닫기' : 'Close'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}