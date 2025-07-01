'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { SocialLoginButton } from '@/components/ui/social-login-button';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/ui/LanguageToggle';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: '',
    age: '',
    personalManifesto: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await register(formData);
    } catch (error) {
      toast.error(language === 'ko' ? '회원가입에 실패했습니다' : 'Registration failed');
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
            {language === 'ko' ? '예술 여행을 시작하세요' : 'Begin Your Journey'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'ko' ? '이메일' : 'Email'}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
                minLength={6}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'ko' ? '닉네임' : 'Nickname'}
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'ko' ? '나이 (선택사항)' : 'Age (optional)'}
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                min="13"
                max="120"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'ko' ? '나만의 예술 선언 (선택사항)' : 'Personal Manifesto (optional)'}
              </label>
              <textarea
                value={formData.personalManifesto}
                onChange={(e) => setFormData({...formData, personalManifesto: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                rows={3}
                placeholder={language === 'ko' ? '예술은 당신에게 어떤 의미인가요?' : 'What does art mean to you?'}
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (language === 'ko' ? '계정 생성 중...' : 'Creating Account...') : (language === 'ko' ? '여행 시작하기' : 'Start Your Journey')}
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
            {language === 'ko' ? '이미 계정이 있으신가요?' : 'Already have an account?'}{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300">
              {language === 'ko' ? '로그인' : 'Login'}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}