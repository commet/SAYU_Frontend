'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModernGlassCard from '@/components/ui/modern-glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, Zap, Heart, Star, Moon, Sun, Cloud, Rainbow } from 'lucide-react';

export default function InteractiveShowcase() {
  const { language } = useLanguage();
  const [selectedMood, setSelectedMood] = useState<string>('creative');
  
  const moods = [
    { id: 'creative', icon: Sparkles, color: 'purple', label: { ko: '창의적', en: 'Creative' } },
    { id: 'energetic', icon: Zap, color: 'blue', label: { ko: '활기찬', en: 'Energetic' } },
    { id: 'romantic', icon: Heart, color: 'pink', label: { ko: '로맨틱', en: 'Romantic' } },
    { id: 'peaceful', icon: Cloud, color: 'green', label: { ko: '평화로운', en: 'Peaceful' } },
  ];
  
  const currentMood = moods.find(m => m.id === selectedMood);
  
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Dynamic Background based on mood */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMood}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br
            ${selectedMood === 'creative' ? 'from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950' : ''}
            ${selectedMood === 'energetic' ? 'from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950' : ''}
            ${selectedMood === 'romantic' ? 'from-pink-100 to-rose-100 dark:from-pink-950 dark:to-rose-950' : ''}
            ${selectedMood === 'peaceful' ? 'from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950' : ''}
          `} />
        </motion.div>
      </AnimatePresence>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {language === 'ko' ? '인터랙티브 경험' : 'Interactive Experience'}
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {language === 'ko' ? '당신의 기분에 맞는 예술을 선택하세요' : 'Choose art that matches your mood'}
          </p>
        </motion.div>
        
        {/* Mood Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {moods.map((mood) => (
            <motion.button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              className={cn(
                'group relative p-4 rounded-2xl transition-all duration-300',
                selectedMood === mood.id ? 'scale-110' : 'hover:scale-105'
              )}
              whileTap={{ scale: 0.95 }}
            >
              <ModernGlassCard
                gradient={mood.color as any}
                intensity={selectedMood === mood.id ? 'heavy' : 'light'}
                glow={selectedMood === mood.id}
              >
                <div className="flex flex-col items-center gap-2">
                  <mood.icon className={`w-8 h-8 ${
                    selectedMood === mood.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                  }`} />
                  <span className={`font-medium ${
                    selectedMood === mood.id ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {mood.label[language as 'ko' | 'en']}
                  </span>
                </div>
              </ModernGlassCard>
            </motion.button>
          ))}
        </div>
        
        {/* Interactive Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Feature Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <ModernGlassCard
              gradient={currentMood?.color as any}
              intensity="medium"
              interactive
              glow
              className="h-full"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  {currentMood && <currentMood.icon className="w-12 h-12 text-purple-600" />}
                  <h3 className="text-2xl font-bold font-weight-animate">
                    {language === 'ko' ? '맞춤형 예술 추천' : 'Personalized Art Recommendations'}
                  </h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {language === 'ko' 
                    ? '당신의 현재 기분과 성격을 분석하여 가장 적합한 예술 작품을 추천해드립니다. AI가 수백만 개의 작품 중에서 당신만을 위한 특별한 컬렉션을 만들어냅니다.'
                    : 'We analyze your current mood and personality to recommend the most suitable artworks. AI creates a special collection just for you from millions of pieces.'
                  }
                </p>
                
                {/* Animated Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  {[
                    { value: '99%', label: language === 'ko' ? '정확도' : 'Accuracy' },
                    { value: '1M+', label: language === 'ko' ? '작품' : 'Artworks' },
                    { value: '0.5s', label: language === 'ko' ? '응답속도' : 'Response' },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: index * 0.1, type: "spring" }}
                      viewport={{ once: true }}
                      className="text-center"
                    >
                      <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ModernGlassCard>
          </motion.div>
          
          {/* Side Cards */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <ModernGlassCard gradient="rainbow" intensity="light" interactive>
                <div className="text-center space-y-4">
                  <Rainbow className="w-12 h-12 mx-auto text-purple-600" />
                  <h4 className="font-bold">
                    {language === 'ko' ? '다양한 스타일' : 'Diverse Styles'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ko' ? '모든 예술 장르 지원' : 'All art genres supported'}
                  </p>
                </div>
              </ModernGlassCard>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <ModernGlassCard gradient="blue" intensity="light" interactive>
                <div className="text-center space-y-4">
                  <Star className="w-12 h-12 mx-auto text-blue-600" />
                  <h4 className="font-bold">
                    {language === 'ko' ? '전문가 큐레이션' : 'Expert Curation'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ko' ? 'AI + 인간 전문가' : 'AI + Human Experts'}
                  </p>
                </div>
              </ModernGlassCard>
            </motion.div>
          </div>
        </div>
        
        {/* Interactive Demo Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <GlassButton
            variant="creative"
            size="lg"
            className="hover-scale"
            icon={<Sparkles />}
          >
            {language === 'ko' ? '지금 체험하기' : 'Try Now'}
          </GlassButton>
        </motion.div>
      </div>
    </section>
  );
}

// Helper function (should be imported from utils in real implementation)
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}