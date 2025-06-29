'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface SocialLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  language?: 'ko' | 'en';
}

export default function SocialLoginModal({
  isOpen,
  onClose,
  onSuccess,
  language = 'ko'
}: SocialLoginModalProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'kakao' | 'instagram') => {
    setIsLoading(provider);
    
    try {
      // Instagram은 현재 NextAuth에서 직접 지원하지 않으므로 커스텀 처리 필요
      if (provider === 'instagram') {
        // Instagram OAuth URL 생성
        const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
        const redirectUri = `${window.location.origin}/api/auth/instagram/callback`;
        const scope = 'user_profile,user_media';
        
        if (!clientId) {
          toast.error('Instagram 로그인 설정이 필요합니다.');
          setIsLoading(null);
          return;
        }
        
        const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
        
        // 현재 상태 저장 (로그인 후 복원용)
        sessionStorage.setItem('authRedirect', window.location.pathname);
        sessionStorage.setItem('authAction', 'share-id-card');
        
        // Instagram 로그인 페이지로 리다이렉트
        window.location.href = authUrl;
      } else {
        // Google, Kakao는 NextAuth 사용
        const result = await signIn(provider, { 
          redirect: false,
          callbackUrl: window.location.pathname 
        });
        
        if (result?.error) {
          toast.error(language === 'ko' 
            ? '로그인에 실패했습니다.' 
            : 'Login failed.'
          );
        } else if (result?.ok) {
          toast.success(language === 'ko' 
            ? '로그인되었습니다!' 
            : 'Logged in successfully!'
          );
          if (onSuccess) onSuccess();
          onClose();
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(language === 'ko' 
        ? '로그인 중 오류가 발생했습니다.' 
        : 'An error occurred during login.'
      );
    } finally {
      if (provider !== 'instagram') {
        setIsLoading(null);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-gray-600 dark:text-gray-400">✕</span>
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-4xl">🎨</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-3 text-gray-900 dark:text-white">
              {language === 'ko' 
                ? '나만의 예술 취향 ID 카드를 공유하세요!' 
                : 'Share Your Art Identity Card!'
              }
            </h2>

            {/* Description */}
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              {language === 'ko' 
                ? '로그인하고 친구들과 예술 취향을 나눠보세요' 
                : 'Log in to share your art preferences with friends'
              }
            </p>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              {/* Instagram */}
              <button
                onClick={() => handleSocialLogin('instagram')}
                disabled={isLoading !== null}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white rounded-full py-3 px-6 font-medium hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading === 'instagram' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                  </svg>
                )}
                <span>
                  {language === 'ko' ? 'Instagram으로 계속하기' : 'Continue with Instagram'}
                </span>
              </button>

              {/* Google */}
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading !== null}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full py-3 px-6 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading === 'google' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full"
                  />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>
                  {language === 'ko' ? 'Google로 계속하기' : 'Continue with Google'}
                </span>
              </button>

              {/* Kakao */}
              <button
                onClick={() => handleSocialLogin('kakao')}
                disabled={isLoading !== null}
                className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#000000] rounded-full py-3 px-6 font-medium hover:bg-[#FDD835] transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading === 'kakao' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                  />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1c-6.627 0-12 4.208-12 9.399 0 3.356 2.246 6.301 5.625 7.963-1.678 5.749-2.664 6.123 4.244 1.287.692.097 1.404.148 2.131.148 6.627 0 12-4.208 12-9.399 0-5.19-5.373-9.398-12-9.398z"/>
                  </svg>
                )}
                <span>
                  {language === 'ko' ? '카카오로 계속하기' : 'Continue with Kakao'}
                </span>
              </button>
            </div>

            {/* Skip Button */}
            <button
              onClick={onClose}
              className="w-full mt-6 text-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {language === 'ko' ? '나중에 하기' : 'Maybe Later'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}