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
  const { signUp } = useAuth();
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
      await signUp(email, password, { full_name: name });
      toast.success(language === 'ko' ? '회원가입 성공!' : 'Registration successful!');
      router.push('/quiz');
    } catch (error) {
      toast.error(language === 'ko' ? '회원가입에 실패했습니다' : 'Registration failed');
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
            <h1 className="sayu-display text-4xl font-bold text-sayu-text-primary mb-2">
              {language === 'ko' ? '예술 여정 시작하기' : 'Start Your Art Journey'}
            </h1>
            <p className="text-sayu-text-secondary">
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
            className="space-y-6"
          >
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-sayu-text-secondary mb-2">
                {language === 'ko' ? '이름' : 'Name'}
              </label>
              <div className="relative group">
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-white border-2 border-sayu-warm-gray/30 rounded-xl focus:border-sayu-mocha focus:outline-none focus:ring-4 focus:ring-sayu-mocha/10 transition-all duration-300 hover:border-sayu-warm-gray/50"
                  placeholder={language === 'ko' ? '홍길동' : 'John Doe'}
                  required
                  autoComplete="name"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sayu-text-muted transition-colors group-focus-within:text-sayu-mocha" />
              </div>
            </div>

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
                  className="w-full px-4 py-3 pl-12 bg-white border-2 border-sayu-warm-gray/30 rounded-xl focus:border-sayu-mocha focus:outline-none focus:ring-4 focus:ring-sayu-mocha/10 transition-all duration-300 hover:border-sayu-warm-gray/50"
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
                  className="w-full px-4 py-3 pl-12 pr-12 bg-white border-2 border-sayu-warm-gray/30 rounded-xl focus:border-sayu-mocha focus:outline-none focus:ring-4 focus:ring-sayu-mocha/10 transition-all duration-300 hover:border-sayu-warm-gray/50"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
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
                  <p className="text-xs text-sayu-text-muted">
                    {language === 'ko' 
                      ? passwordStrength <= 2 ? '약함' : passwordStrength <= 3 ? '보통' : '강함'
                      : passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Medium' : 'Strong'}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-sayu-text-secondary mb-2">
                {language === 'ko' ? '비밀번호 확인' : 'Confirm Password'}
              </label>
              <div className="relative group">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 pl-12 pr-12 bg-white border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 hover:border-sayu-warm-gray/50 ${
                    confirmPassword && (passwordsMatch ? 'border-green-400 focus:border-green-500 focus:ring-green-500/10' : 'border-red-400 focus:border-red-500 focus:ring-red-500/10')
                    || 'border-sayu-warm-gray/30 focus:border-sayu-mocha focus:ring-sayu-mocha/10'
                  }`}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sayu-text-muted transition-colors group-focus-within:text-sayu-mocha" />
                <motion.button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sayu-text-muted hover:text-sayu-text-primary transition-colors"
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
                className="w-5 h-5 text-sayu-mocha border-sayu-warm-gray rounded focus:ring-sayu-mocha mt-0.5"
              />
              <label htmlFor="terms" className="text-sm text-sayu-text-secondary">
                {language === 'ko' 
                  ? <>
                      <Link href="/terms" className="text-sayu-mocha hover:text-sayu-mocha/80">이용약관</Link>과{' '}
                      <Link href="/privacy" className="text-sayu-mocha hover:text-sayu-mocha/80">개인정보 처리방침</Link>에 동의합니다
                    </>
                  : <>
                      I agree to the{' '}
                      <Link href="/terms" className="text-sayu-mocha hover:text-sayu-mocha/80">Terms of Service</Link> and{' '}
                      <Link href="/privacy" className="text-sayu-mocha hover:text-sayu-mocha/80">Privacy Policy</Link>
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
                size="lg"
                className="w-full bg-gradient-to-r from-sayu-blush to-sayu-lavender hover:from-sayu-blush/90 hover:to-sayu-lavender/90 shadow-lg hover:shadow-xl"
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
              <div className="w-full border-t border-sayu-warm-gray/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-sayu-bg-primary text-sayu-text-muted">
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
            <SocialLoginButton provider="google" />
            <SocialLoginButton provider="apple" />
            <SocialLoginButton provider="instagram" />
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
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-sayu-powder-blue via-sayu-lavender to-sayu-blush">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          {/* Gradient Orbs */}
          <motion.div
            className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-sayu-sage/40 to-transparent blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-sayu-lavender/40 to-transparent blur-3xl"
            animate={{
              x: [0, 80, 0],
              y: [0, -60, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
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
                ? '당신만의\n예술 성격을 찾아서' 
                : 'Find Your\nArtistic Personality'}
            </h2>
            <p className="text-xl text-sayu-charcoal/70 max-w-md mx-auto mb-12">
              {language === 'ko'
                ? '간단한 퀴즈를 통해 16가지 예술 성격 중 당신만의 유형을 발견하세요.'
                : 'Discover your unique type among 16 art personalities through a simple quiz.'}
            </p>

            {/* Personality Types Preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-4 gap-4 max-w-md mx-auto"
            >
              {[
                { emoji: '🦁', color: 'from-orange-400 to-red-400' },
                { emoji: '🦋', color: 'from-purple-400 to-pink-400' },
                { emoji: '🐺', color: 'from-gray-400 to-blue-400' },
                { emoji: '🦅', color: 'from-yellow-400 to-orange-400' },
                { emoji: '🐧', color: 'from-blue-400 to-cyan-400' },
                { emoji: '🦊', color: 'from-red-400 to-orange-400' },
                { emoji: '🐨', color: 'from-gray-400 to-green-400' },
                { emoji: '🦉', color: 'from-purple-400 to-indigo-400' },
              ].map((type, index) => (
                <motion.div
                  key={type.emoji}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.05, type: "spring" }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center shadow-lg cursor-pointer`}
                >
                  <span className="text-3xl">{type.emoji}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 inline-flex items-center gap-2 px-6 py-3 bg-white/30 backdrop-blur-md rounded-full border border-white/40"
            >
              <Sparkles className="w-5 h-5 text-sayu-charcoal" />
              <span className="text-sayu-charcoal font-medium">
                {language === 'ko' ? '가입 후 바로 시작하세요!' : 'Start right after signing up!'}
              </span>
            </motion.div>
          </motion.div>
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