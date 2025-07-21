'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Heart, Palette, Eye, Sparkles, Brain, Fingerprint } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Feature {
  icon: React.ElementType;
  title: { en: string; ko: string };
  description: { en: string; ko: string };
  gradient: string;
  delay: number;
}

export default function ModernFeatures() {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });
  
  const features: Feature[] = [
    {
      icon: Fingerprint,
      title: { ko: '성격 분석', en: 'Personality Analysis' },
      description: { ko: 'APT 이론 기반 정밀 분석', en: 'Precise analysis based on APT theory' },
      gradient: 'from-purple-500 to-pink-500',
      delay: 0,
    },
    {
      icon: Brain,
      title: { ko: 'AI 큐레이션', en: 'AI Curation' },
      description: { ko: '딥러닝으로 찾는 완벽한 매칭', en: 'Perfect matching with deep learning' },
      gradient: 'from-blue-500 to-purple-500',
      delay: 0.1,
    },
    {
      icon: Palette,
      title: { ko: '맞춤 추천', en: 'Custom Recommendations' },
      description: { ko: '취향에 맞는 작품 큐레이션', en: 'Artwork curation for your taste' },
      gradient: 'from-pink-500 to-orange-500',
      delay: 0.2,
    },
    {
      icon: Eye,
      title: { ko: '예술 탐험', en: 'Art Exploration' },
      description: { ko: '세계 미술관의 명작 감상', en: 'Explore world museum masterpieces' },
      gradient: 'from-green-500 to-teal-500',
      delay: 0.3,
    },
    {
      icon: Heart,
      title: { ko: '감정 연결', en: 'Emotional Connection' },
      description: { ko: '예술과 마음의 깊은 만남', en: 'Deep connection between art and soul' },
      gradient: 'from-red-500 to-pink-500',
      delay: 0.4,
    },
    {
      icon: Sparkles,
      title: { ko: '특별한 경험', en: 'Special Experience' },
      description: { ko: '당신만의 예술 여정', en: 'Your unique art journey' },
      gradient: 'from-yellow-500 to-orange-500',
      delay: 0.5,
    },
  ];
  
  return (
    <section ref={containerRef} className="relative py-24 px-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(147 51 234) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {language === 'ko' ? '당신만의 예술 여정' : 'Your Art Journey'}
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-weight-animate">
            {language === 'ko' 
              ? '개인 맞춤형 AI가 제공하는 특별한 경험'
              : 'A special experience powered by personalized AI'
            }
          </p>
        </motion.div>
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.5, 
                delay: feature.delay,
                ease: [0.21, 0.47, 0.32, 0.98]
              }}
              whileHover={{ y: -5 }}
              className={`group relative ${
                index === 0 ? 'md:col-span-2 lg:col-span-1' : ''
              } ${
                index === 3 ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="relative h-full glass-enhanced rounded-3xl p-8 overflow-hidden hover-lift">
                {/* Gradient Orb */}
                <div 
                  className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500`}
                />
                
                {/* Icon Container */}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
                
                {/* Content */}
                <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white font-weight-animate">
                  {feature.title[language as 'ko' | 'en']}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description[language as 'ko' | 'en']}
                </p>
                
                {/* Hover Effect Line */}
                <motion.div
                  className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.gradient}`}
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Floating Elements */}
        <div className="absolute -z-10 top-1/2 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -z-10 top-1/2 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -z-10 bottom-0 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>
    </section>
  );
}