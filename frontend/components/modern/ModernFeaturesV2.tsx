'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Heart, Palette, Eye, Sparkles, Brain, Fingerprint, Users, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Feature {
  icon: React.ElementType;
  title: { en: string; ko: string };
  description: { en: string; ko: string };
  color: string;
  size?: 'normal' | 'large';
}

export default function ModernFeaturesV2() {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  
  const features: Feature[] = [
    {
      icon: Fingerprint,
      title: { ko: 'APT 성격 분석', en: 'APT Personality Analysis' },
      description: { ko: '과학적 이론에 기반한 정확한 성격 유형 진단', en: 'Accurate personality diagnosis based on scientific theory' },
      color: 'purple',
      size: 'large',
    },
    {
      icon: Brain,
      title: { ko: 'AI 큐레이션', en: 'AI Curation' },
      description: { ko: '딥러닝으로 당신에게 완벽한 작품 매칭', en: 'Perfect artwork matching with deep learning' },
      color: 'blue',
      size: 'large',
    },
    {
      icon: Palette,
      title: { ko: '맞춤 추천', en: 'Personalized' },
      description: { ko: '취향 기반 작품 추천', en: 'Taste-based recommendations' },
      color: 'pink',
    },
    {
      icon: Eye,
      title: { ko: '미술관 연동', en: 'Museum Access' },
      description: { ko: '세계 유명 미술관 작품', en: 'World-famous museum pieces' },
      color: 'green',
    },
    {
      icon: Heart,
      title: { ko: '감정 연결', en: 'Emotional Link' },
      description: { ko: '예술과 마음의 만남', en: 'Art meets emotion' },
      color: 'red',
    },
    {
      icon: Users,
      title: { ko: '커뮤니티', en: 'Community' },
      description: { ko: '같은 취향의 사람들', en: 'Like-minded people' },
      color: 'indigo',
    },
  ];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };
  
  return (
    <section ref={containerRef} className="relative py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gray-900 dark:text-white">
              {language === 'ko' ? '왜 SAYU인가?' : 'Why SAYU?'}
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {language === 'ko' 
              ? '개인화된 AI 기술로 당신만의 특별한 예술 경험을 만들어드립니다'
              : 'Creating your unique art experience with personalized AI technology'
            }
          </p>
        </motion.div>
        
        {/* Features Grid - Bento Style */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const isLarge = feature.size === 'large';
            const colorClasses = {
              purple: 'from-purple-500 to-purple-600',
              blue: 'from-blue-500 to-blue-600',
              pink: 'from-pink-500 to-pink-600',
              green: 'from-green-500 to-green-600',
              red: 'from-red-500 to-red-600',
              indigo: 'from-indigo-500 to-indigo-600',
            };
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`group relative ${isLarge ? 'md:col-span-2 md:row-span-2' : ''}`}
              >
                <div className={`
                  relative h-full bg-white dark:bg-gray-800 rounded-2xl p-8 
                  shadow-sm hover:shadow-xl transition-all duration-300
                  border border-gray-200 dark:border-gray-700
                  ${isLarge ? 'min-h-[300px]' : 'min-h-[200px]'}
                `}>
                  {/* Background Gradient */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} 
                    opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl
                  `} />
                  
                  {/* Icon */}
                  <div className={`
                    inline-flex p-3 rounded-xl bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]}
                    text-white mb-4
                  `}>
                    <feature.icon className={isLarge ? 'w-8 h-8' : 'w-6 h-6'} />
                  </div>
                  
                  {/* Content */}
                  <h3 className={`
                    font-bold text-gray-900 dark:text-white mb-2
                    ${isLarge ? 'text-2xl md:text-3xl' : 'text-xl'}
                  `}>
                    {feature.title[language as 'en' | 'ko']}
                  </h3>
                  <p className={`
                    text-gray-600 dark:text-gray-400
                    ${isLarge ? 'text-base md:text-lg' : 'text-sm md:text-base'}
                  `}>
                    {feature.description[language as 'en' | 'ko']}
                  </p>
                  
                  {/* Hover Effect */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {language === 'ko' 
              ? '지금 바로 당신의 예술 성향을 발견하세요'
              : 'Discover your art personality right now'
            }
          </p>
          <div className="flex items-center justify-center gap-4">
            <Award className="w-6 h-6 text-yellow-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'ko' ? '2024 최고의 예술 플랫폼 선정' : 'Best Art Platform 2024'}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}