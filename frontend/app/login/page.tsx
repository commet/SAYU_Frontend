'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { SocialLoginButton } from '@/components/ui/social-login-button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/ui/LanguageToggle';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      const errorMessages: Record<string, Record<string, string>> = {
        auth_failed: { en: 'Authentication failed. Please try again.', ko: '인증에 실패했습니다. 다시 시도해주세요.' },
        auth_error: { en: 'An error occurred during authentication.', ko: '인증 중 오류가 발생했습니다.' },
        missing_tokens: { en: 'Authentication tokens missing.', ko: '인증 토큰이 없습니다.' },
        google_auth_failed: { en: 'Google authentication failed.', ko: '구글 인증에 실패했습니다.' },
        github_auth_failed: { en: 'GitHub authentication failed.', ko: '깃허브 인증에 실패했습니다.' },
        apple_auth_failed: { en: 'Apple authentication failed.', ko: '애플 인증에 실패했습니다.' }
      };
      const message = errorMessages[error]?.[language] || (language === 'ko' ? '인증 오류' : 'Authentication error');
      toast.error(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
    } catch (error) {
      toast.error(language === 'ko' ? '잘못된 인증 정보입니다' : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageToggle variant="glass" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-800">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            {language === 'ko' ? '다시 만나 반가워요' : 'Welcome Back'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'ko' ? '이메일' : 'Email'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'ko' ? '비밀번호' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (language === 'ko' ? '로그인 중...' : 'Logging in...') : (language === 'ko' ? '로그인' : 'Login')}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900/50 text-gray-400">{language === 'ko' ? '또는' : 'Or continue with'}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <SocialLoginButton provider="instagram" />
              <SocialLoginButton provider="google" />
              <SocialLoginButton provider="apple" />
              <SocialLoginButton provider="github" />
            </div>
          </div>
          
          <p className="mt-6 text-center text-gray-400">
            {language === 'ko' ? '계정이 없으신가요?' : "Don't have an account?"}{' '}
            <Link href="/register" className="text-purple-400 hover:text-purple-300">
              {language === 'ko' ? '회원가입' : 'Register'}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}