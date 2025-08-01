'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { SocialLoginButton } from '@/components/ui/social-login-button';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernButton } from '@/components/ui/modern-button';
import { Mail, Lock, LogIn, Home, Eye, EyeOff, Sparkles } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  useEffect(() => {
    const error = searchParams?.get('error');
    const info = searchParams?.get('info');
    
    if (info === 'instagram_no_email') {
      toast(
        language === 'ko' 
          ? 'Instagram은 이메일을 제공하지 않습니다. 프로필에서 이메일을 추가해주세요.' 
          : 'Instagram does not provide email. Please add your email in profile settings.',
        { icon: 'ℹ️', duration: 6000 }
      );
    } else if (error) {
      const errorMessages: Record<string, Record<string, string>> = {
        auth_failed: { en: 'Authentication failed. Please try again.', ko: '인증에 실패했습니다. 다시 시도해주세요.' },
        auth_error: { en: 'An error occurred during authentication.', ko: '인증 중 오류가 발생했습니다.' },
        missing_tokens: { en: 'Authentication tokens missing.', ko: '인증 토큰이 없습니다.' },
        google_auth_failed: { en: 'Google authentication failed.', ko: '구글 인증에 실패했습니다.' },
        github_auth_failed: { en: 'GitHub authentication failed.', ko: '깃허브 인증에 실패했습니다.' },
        apple_auth_failed: { en: 'Apple authentication failed.', ko: '애플 인증에 실패했습니다.' },
        server_error: { en: 'Instagram login failed. This is a known limitation.', ko: 'Instagram 로그인에 실패했습니다. 알려진 제한사항입니다.' }
      };
      const message = errorMessages[error]?.[language] || (language === 'ko' ? '인증 오류' : 'Authentication error');
      toast.error(message);
    }
  }, [searchParams, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(email, password);
      toast.success(language === 'ko' ? '로그인 성공!' : 'Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error(language === 'ko' ? '잘못된 인증 정보입니다' : 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-sayu-bg-primary">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo and Back Button */}
          <div className="flex items-center justify-between mb-12">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-sayu-text-muted hover:text-sayu-text-primary transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="text-sm font-medium">{language === 'ko' ? '홈으로' : 'Back to Home'}</span>
            </Link>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
              className="relative"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sayu-lavender to-sayu-sage flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-sayu-charcoal" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-sayu-lavender to-sayu-sage"
                animate={{
                  scale: [1, 1.5, 1.5, 1],
                  opacity: [0.5, 0, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            </motion.div>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="sayu-display text-4xl font-bold text-sayu-text-primary mb-2">
              {language === 'ko' ? '다시 만나요' : 'Welcome back'}
            </h1>
            <p className="text-sayu-text-secondary">
              {language === 'ko' 
                ? '예술 여정을 계속 이어가세요' 
                : 'Continue your artistic journey'}
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-sayu-text-secondary mb-2">
                {language === 'ko' ? '이메일' : 'Email'}
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-gray-300 rounded-xl focus:border-gray-900 dark:focus:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-900/10 dark:focus:ring-gray-300/10 transition-all duration-300 hover:border-gray-700 dark:hover:border-gray-400 text-gray-900 dark:text-gray-100"
                  placeholder={language === 'ko' ? 'your@email.com' : 'your@email.com'}
                  required
                  autoComplete="email"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sayu-text-muted transition-colors group-focus-within:text-sayu-mocha" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-sayu-text-secondary mb-2">
                {language === 'ko' ? '비밀번호' : 'Password'}
              </label>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 pr-12 bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-gray-300 rounded-xl focus:border-gray-900 dark:focus:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-900/10 dark:focus:ring-gray-300/10 transition-all duration-300 hover:border-gray-700 dark:hover:border-gray-400 text-gray-900 dark:text-gray-100"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sayu-text-muted transition-colors group-focus-within:text-sayu-mocha" />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sayu-text-muted hover:text-sayu-text-primary transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-sayu-mocha border-sayu-warm-gray rounded focus:ring-sayu-mocha"
                />
                <span className="text-sm text-sayu-text-secondary">
                  {language === 'ko' ? '로그인 상태 유지' : 'Remember me'}
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-sayu-mocha hover:text-sayu-mocha/80 transition-colors"
              >
                {language === 'ko' ? '비밀번호 찾기' : 'Forgot password?'}
              </Link>
            </div>

            {/* Submit Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ModernButton
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-sayu-mocha to-sayu-mocha/90 hover:from-sayu-mocha/90 hover:to-sayu-mocha shadow-lg hover:shadow-xl"
                loading={loading}
                iconLeft={!loading && <LogIn className="w-5 h-5" />}
              >
                {language === 'ko' ? '로그인' : 'Sign in'}
              </ModernButton>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-900 dark:border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                {language === 'ko' ? '또는' : 'Or continue with'}
              </span>
            </div>
          </div>

          {/* Social Login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 -mt-1"
          >
            <SocialLoginButton provider="instagram" />
            <SocialLoginButton provider="google" />
            <SocialLoginButton provider="kakao" />
            <SocialLoginButton provider="discord" />
          </motion.div>

          {/* Sign Up Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center text-sm text-sayu-text-secondary"
          >
            {language === 'ko' ? '아직 계정이 없으신가요? ' : "Don't have an account? "}
            <Link
              href="/register"
              className="font-medium text-sayu-mocha hover:text-sayu-mocha/80 transition-colors"
            >
              {language === 'ko' ? '회원가입' : 'Sign up'}
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("/images/backgrounds/baroque-gallery-ornate-arches-historical.jpg")',
          }}
        >
          {/* Overlay for transparency */}
          <div className="absolute inset-0 bg-white/30 dark:bg-black/30" />
        </div>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          {/* Gradient Orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-sayu-blush/40 to-transparent blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-sayu-powder-blue/40 to-transparent blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Pattern Overlay */}
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236F4E37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="sayu-display text-5xl font-bold text-sayu-charcoal mb-6">
              {language === 'ko' 
                ? '예술로 만나는\n나의 진짜 모습' 
                : 'Discover Your\nTrue Artistic Self'}
            </h2>
            <p className="text-xl text-sayu-charcoal/70 max-w-md mx-auto mb-12 whitespace-pre-line">
              {language === 'ko'
                ? 'SAYU와 함께 당신만의 예술 취향을\n발견하고, 마음에 드는 작품들을 만나보세요.'
                : 'Explore your unique art preferences and discover masterpieces that resonate with your soul.'}
            </p>

            {/* Feature List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4 text-left max-w-sm mx-auto"
            >
              {[
                { icon: '🎨', text: language === 'ko' ? 'AI 기반 개인 맞춤 추천' : 'AI-powered personalization' },
                { icon: '🎭', text: language === 'ko' ? '16가지 예술 성격 유형' : '16 art personality types' },
                { icon: '🖼️', text: language === 'ko' ? '세계적인 미술관 컬렉션' : 'World-class museum collections' },
                { icon: '👥', text: language === 'ko' ? '예술 애호가 커뮤니티' : 'Art enthusiast community' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="group flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-xl px-5 py-4 border border-white/30 hover:bg-white/30 hover:border-white/40 transition-all cursor-pointer"
                  whileHover={{ x: 10 }}
                >
                  <motion.span 
                    className="text-2xl"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {feature.icon}
                  </motion.span>
                  <span className="text-sayu-charcoal font-medium group-hover:text-sayu-charcoal/90">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Art Frames */}
        <div className="absolute inset-0 pointer-events-none">
          {[
            { size: 'w-32 h-40', top: '10%', left: '15%', delay: 0, duration: 25 },
            { size: 'w-24 h-32', top: '60%', left: '70%', delay: 2, duration: 30 },
            { size: 'w-28 h-36', top: '35%', left: '80%', delay: 4, duration: 28 },
            { size: 'w-36 h-44', top: '70%', left: '20%', delay: 6, duration: 32 },
          ].map((frame, i) => (
            <motion.div
              key={i}
              className={`absolute ${frame.size} bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-2xl`}
              style={{ top: frame.top, left: frame.left }}
              initial={{ opacity: 0, rotate: -5 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                rotate: [-5, 5, -5],
                y: [-20, 20, -20],
              }}
              transition={{
                duration: frame.duration,
                delay: frame.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-sayu-bg-primary">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sayu-mocha/30 border-t-sayu-mocha rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sayu-text-muted">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}