'use client';

import ModernHero from '@/components/modern/ModernHero';
import ModernFeatures from '@/components/modern/ModernFeatures';
import ScrollDrivenGallery from '@/components/modern/ScrollDrivenGallery';
import InteractiveShowcase from '@/components/modern/InteractiveShowcase';
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
      <ModernHero />
      
      {/* Features Section */}
      <ModernFeatures />
      
      {/* Scroll Driven Gallery */}
      <ScrollDrivenGallery />
      
      {/* Interactive Showcase */}
      <InteractiveShowcase />
      
      {/* Stats Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-50/50 to-transparent dark:via-purple-900/10" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Users,
                value: '50K+',
                label: language === 'ko' ? '활성 사용자' : 'Active Users',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: Brush,
                value: '1M+',
                label: language === 'ko' ? '큐레이션된 작품' : 'Curated Artworks',
                gradient: 'from-blue-500 to-purple-500',
              },
              {
                icon: TrendingUp,
                value: '98%',
                label: language === 'ko' ? '만족도' : 'Satisfaction Rate',
                gradient: 'from-green-500 to-teal-500',
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="glass-enhanced rounded-3xl p-8 hover-lift">
                  <stat.icon className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`} />
                  <motion.h3
                    className="text-5xl font-bold mb-2 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ type: "spring", delay: index * 0.1 + 0.3 }}
                    viewport={{ once: true }}
                  >
                    {stat.value}
                  </motion.h3>
                  <p className="text-gray-600 dark:text-gray-400 font-weight-animate">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative py-24 px-4">
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
            
            <div className="relative glass-enhanced rounded-3xl p-12 md:p-16">
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
                <div className="relative glass-enhanced px-10 py-5 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-90" />
                  <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
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
          <p className="font-weight-animate">
            © 2024 SAYU. {language === 'ko' ? '모든 권리 보유.' : 'All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
}