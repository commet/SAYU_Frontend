'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Brain, Palette, Eye, Users, Star, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ModernFinalPage() {
  const router = useRouter();
  const { language } = useLanguage();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section - High Contrast */}
      <section className="relative min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Always white text on gradient background */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-white font-medium">
                  {language === 'ko' ? 'AI 예술 큐레이션' : 'AI Art Curation'}
                </span>
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white"
            >
              {language === 'ko' ? '당신만의' : 'Discover Your'}
              <br />
              {language === 'ko' ? '예술 성향 발견' : 'Art Personality'}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto"
            >
              {language === 'ko' 
                ? '3분 테스트로 나만의 예술 취향을 찾아보세요'
                : 'Find your unique art taste with a 3-minute test'
              }
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={() => router.push('/quiz')}
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <span className="flex items-center gap-2">
                  {language === 'ko' ? '시작하기' : 'Start Now'}
                  <ArrowRight className="w-5 h-5" />
                </span>
              </button>
              
              <button
                onClick={() => router.push('/gallery')}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full border-2 border-white/50 hover:bg-white/30 transition-all"
              >
                {language === 'ko' ? '갤러리 둘러보기' : 'Browse Gallery'}
              </button>
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex items-center justify-center gap-6 text-white/80"
            >
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-current" />
                <span>4.9/5</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>50K+ {language === 'ko' ? '사용자' : 'users'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>{language === 'ko' ? '무료' : 'Free'}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features - Clear contrast */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">
            {language === 'ko' ? '주요 기능' : 'Key Features'}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: language === 'ko' ? 'AI 분석' : 'AI Analysis',
                desc: language === 'ko' ? 'APT 이론 기반 정확한 분석' : 'Accurate APT-based analysis',
                color: 'bg-purple-500'
              },
              {
                icon: Palette,
                title: language === 'ko' ? '맞춤 추천' : 'Personalized',
                desc: language === 'ko' ? '취향에 맞는 작품 큐레이션' : 'Curated works for your taste',
                color: 'bg-pink-500'
              },
              {
                icon: Eye,
                title: language === 'ko' ? '미술관 연동' : 'Museum Access',
                desc: language === 'ko' ? '세계 유명 미술관 작품' : 'World-famous museum pieces',
                color: 'bg-blue-500'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className={`inline-flex p-4 rounded-xl ${feature.color} text-white mb-4`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats - Dark background for variety */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { value: '50K+', label: language === 'ko' ? '활성 사용자' : 'Active Users' },
              { value: '1M+', label: language === 'ko' ? '작품 보유' : 'Artworks' },
              { value: '98%', label: language === 'ko' ? '만족도' : 'Satisfaction' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h3 className="text-5xl font-bold text-white mb-2">
                  {stat.value}
                </h3>
                <p className="text-gray-400">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Final CTA - High contrast */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            {language === 'ko' ? '지금 시작하세요' : 'Start Today'}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {language === 'ko' 
              ? '나만의 예술 여정을 시작할 준비가 되셨나요?'
              : 'Ready to start your art journey?'
            }
          </p>
          <button
            onClick={() => router.push('/quiz')}
            className="px-10 py-5 bg-white text-purple-600 font-bold text-xl rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            <span className="flex items-center gap-3">
              {language === 'ko' ? '무료로 시작하기' : 'Start Free'}
              <ArrowRight className="w-6 h-6" />
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}