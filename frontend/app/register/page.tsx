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
import { 
  Mail, 
  Lock, 
  User, 
  LogIn, 
  Home, 
  Eye, 
  EyeOff, 
  Sparkles,
  CheckCircle,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import Image from 'next/image';

function RegisterContent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { signUp, signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast.error(language === 'ko' ? '이용약관에 동의해주세요' : 'Please agree to the terms');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error(language === 'ko' ? '비밀번호가 일치하지 않습니다' : 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error(language === 'ko' ? '비밀번호는 6자 이상이어야 합니다' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    try {
      const result = await signUp(email, password, { full_name: name });
      
      console.log('Registration result:', result);
      
      // Migrate guest data if exists
      if (typeof window !== 'undefined') {
        const { GuestStorage } = await import('@/lib/guest-storage');
        const guestData = GuestStorage.getData();
        
        if (guestData.quizResults || guestData.savedArtworks.length > 0) {
          // Save guest data to user's profile after successful login
          const metadata = {
            personalityType: guestData.quizResults?.personalityType,
            guestDataMigrated: true,
            migratedAt: new Date().toISOString()
          };
          
          // Store for migration after login
          sessionStorage.setItem('pendingGuestMigration', JSON.stringify({
            ...GuestStorage.exportForUser(),
            metadata
          }));
        }
      }
      
      // Check if email confirmation is required
      if (result?.user && !result?.session) {
        toast.success(
          language === 'ko' 
            ? '회원가입 성공! 이메일을 확인하여 계정을 활성화해주세요.' 
            : 'Registration successful! Please check your email to confirm your account.'
        );
      } else {
        toast.success(language === 'ko' ? '회원가입 성공! 로그인해주세요.' : 'Registration successful! Please login.');
      }
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push('/login');
        setLoading(false);
      }, 2000);
    } catch (error: any) {
      console.error('Registration error:', error);
      setLoading(false);
      
      // Check if user already exists
      if (error?.message?.includes('User already registered') || 
          error?.message?.includes('already registered') ||
          error?.code === 'user_already_exists' ||
          error?.message?.includes('duplicate key')) {
        toast.error(language === 'ko' ? '이미 가입된 이메일입니다' : 'This email is already registered');
      } else if (error?.message?.includes('valid') || error?.message?.includes('Invalid')) {
        toast.error(language === 'ko' ? '올바른 이메일 주소를 입력해주세요' : 'Please enter a valid email address');
      } else {
        const errorMessage = error?.message || (language === 'ko' ? '회원가입에 실패했습니다' : 'Registration failed');
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-gray-900 dark:bg-gray-950">
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sayu-blush to-sayu-lavender flex items-center justify-center shadow-lg">
                <UserPlus className="w-6 h-6 text-sayu-charcoal" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-sayu-blush to-sayu-lavender"
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
            <h1 className="sayu-display text-4xl font-bold text-white mb-2">
              {language === 'ko' ? '예술 여정 시작하기' : 'Start Your Art Journey'}
            </h1>
            <p className="text-gray-300">
              {language === 'ko' 
                ? 'SAYU와 함께 당신만의 예술 취향을 발견하세요' 
                : 'Discover your unique artistic preferences with SAYU'}
            </p>
          </motion.div>

          {/* Registration Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-2"
          >
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                {language === 'ko' ? '이름' : 'Name'}
              </label>
              <div className="relative group">
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 pl-10 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-sayu-mocha focus:outline-none focus:ring-2 focus:ring-sayu-mocha/10 transition-all duration-300 hover:border-gray-500 placeholder-gray-500"
                  placeholder={language === 'ko' ? '레오나르도 다빈치' : 'Leonardo da Vinci'}
                  required
                  autoComplete="name"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sayu-text-muted transition-colors group-focus-within:text-sayu-mocha" />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                {language === 'ko' ? '이메일' : 'Email'}
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 pl-10 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-sayu-mocha focus:outline-none focus:ring-2 focus:ring-sayu-mocha/10 transition-all duration-300 hover:border-gray-500 placeholder-gray-500"
                  placeholder={language === 'ko' ? 'your@email.com' : 'your@email.com'}
                  required
                  autoComplete="email"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sayu-text-muted transition-colors group-focus-within:text-sayu-mocha" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                {language === 'ko' ? '비밀번호' : 'Password'}
              </label>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-1.5 pl-10 pr-10 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-sayu-mocha focus:outline-none focus:ring-2 focus:ring-sayu-mocha/10 transition-all duration-300 hover:border-gray-500 placeholder-gray-500"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sayu-text-muted transition-colors group-focus-within:text-sayu-mocha" />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sayu-text-muted hover:text-sayu-text-primary transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2"
                >
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < passwordStrength
                            ? passwordStrength <= 2 ? 'bg-red-400' : passwordStrength <= 3 ? 'bg-yellow-400' : 'bg-green-400'
                            : 'bg-sayu-bg-tertiary'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {language === 'ko' 
                      ? passwordStrength <= 2 ? '약함' : passwordStrength <= 3 ? '보통' : '강함'
                      : passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Medium' : 'Strong'}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                {language === 'ko' ? '비밀번호 확인' : 'Confirm Password'}
              </label>
              <div className="relative group">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-2 pl-12 pr-12 bg-gray-800 text-white border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 hover:border-gray-500 placeholder-gray-500 ${
                    confirmPassword && (passwordsMatch ? 'border-green-400 focus:border-green-500 focus:ring-green-500/10' : 'border-red-400 focus:border-red-500 focus:ring-red-500/10')
                    || 'border-gray-600 focus:border-sayu-mocha focus:ring-sayu-mocha/10'
                  }`}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sayu-text-muted transition-colors group-focus-within:text-sayu-mocha" />
                <motion.button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sayu-text-muted hover:text-sayu-text-primary transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
              {confirmPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-xs mt-1 flex items-center gap-1 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}
                >
                  {passwordsMatch ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {passwordsMatch 
                    ? (language === 'ko' ? '비밀번호가 일치합니다' : 'Passwords match')
                    : (language === 'ko' ? '비밀번호가 일치하지 않습니다' : 'Passwords do not match')
                  }
                </motion.p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-5 h-5 text-purple-500 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 mt-0.5"
              />
              <label htmlFor="terms" className="text-sm text-white">
                {language === 'ko' 
                  ? <>
                      <Link href="/terms" className="text-white hover:text-white/80 underline">이용약관</Link>과{' '}
                      <Link href="/privacy" className="text-white hover:text-white/80 underline">개인정보 처리방침</Link>에 동의합니다
                    </>
                  : <>
                      I agree to the{' '}
                      <Link href="/terms" className="text-white hover:text-white/80 underline">Terms of Service</Link> and{' '}
                      <Link href="/privacy" className="text-white hover:text-white/80 underline">Privacy Policy</Link>
                    </>
                }
              </label>
            </div>

            {/* Submit Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ModernButton
                type="submit"
                className="w-full bg-white hover:bg-gray-100 text-gray-900 shadow-lg hover:shadow-xl"
                loading={loading}
                iconLeft={!loading && <UserPlus className="w-5 h-5" />}
                disabled={!agreedToTerms}
              >
                {language === 'ko' ? '가입하기' : 'Create Account'}
              </ModernButton>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 dark:bg-gray-950 text-gray-300">
                {language === 'ko' ? '또는' : 'Or continue with'}
              </span>
            </div>
          </div>

          {/* Social Login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <SocialLoginButton provider="instagram" />
            <SocialLoginButton provider="google" />
            <SocialLoginButton provider="discord" />
            <SocialLoginButton provider="kakao" />
          </motion.div>

          {/* Sign In Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center text-sm text-sayu-text-secondary"
          >
            {language === 'ko' ? '이미 계정이 있으신가요? ' : "Already have an account? "}
            <Link
              href="/login"
              className="font-medium text-sayu-mocha hover:text-sayu-mocha/80 transition-colors"
            >
              {language === 'ko' ? '로그인' : 'Sign in'}
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
          {/* No overlay - full opacity background */}
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
            <h2 className="sayu-display text-5xl font-bold text-white mb-6 drop-shadow-lg">
              {language === 'ko' 
                ? '예술로 만나는\n나의 진짜 모습' 
                : 'Discover Your\nTrue Artistic Self'}
            </h2>
            <p className="text-xl text-white/90 max-w-md mx-auto mb-12 whitespace-pre-line drop-shadow-md">
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-sayu-bg-primary">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sayu-mocha/30 border-t-sayu-mocha rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sayu-text-muted">Loading...</p>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}