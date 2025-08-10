'use client';

import ModernHeroV2 from '@/components/modern/ModernHeroV2';
import ModernFeaturesV2 from '@/components/modern/ModernFeaturesV2';
import ScrollDrivenGalleryV2 from '@/components/modern/ScrollDrivenGalleryV2';
import SimpleStats from '@/components/modern/SimpleStats';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Brush, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ModernLandingPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  return (
    <div className="relative">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 transform-origin-0 z-50"
        style={{ scaleX }}
      />
      
      {/* Hero Section */}
      <ModernHeroV2 />
      
      {/* Features Section */}
      <ModernFeaturesV2 />
      
      {/* Scroll Driven Gallery */}
      <ScrollDrivenGalleryV2 />
      
      {/* Stats Section */}
      <SimpleStats />
      
      
      {/* CTA Section */}
      <section className="relative py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-3xl opacity-20" />
            
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-12 md:p-16 shadow-2xl border border-gray-200 dark:border-gray-700">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {language === 'ko' ? '지금 시작하세요' : 'Start Your Journey'}
                </span>
              </h2>
              
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                {language === 'ko' 
                  ? '3분만에 당신의 예술 성향을 발견하고, AI가 추천하는 맞춤형 작품을 만나보세요.'
                  : 'Discover your art personality in 3 minutes and explore AI-curated artworks just for you.'
                }
              </p>
              
              <motion.button
                onClick={() => router.push('/home')}
                className="group relative magnetic-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative px-10 py-5 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
                  
                  <span className="relative z-10 flex items-center gap-3 text-white font-bold text-xl">
                    {language === 'ko' ? '무료로 시작하기' : 'Start Free'}
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                </div>
              </motion.button>
              
              {/* Trust Indicators */}
              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-2">
                  ✓ {language === 'ko' ? '신용카드 불필요' : 'No credit card'}
                </span>
                <span className="flex items-center gap-2">
                  ✓ {language === 'ko' ? '3분 소요' : '3 minutes'}
                </span>
                <span className="flex items-center gap-2">
                  ✓ {language === 'ko' ? 'AI 맞춤 추천' : 'AI powered'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            © 2024 SAYU.MY. {language === 'ko' ? '모든 권리 보유.' : 'All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
}