'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Heart, 
  Footprints, 
  Palette, 
  ArrowRight,
  Quote,
  Eye,
  Clock,
  Waves,
  Mountain,
  Sun,
  Moon
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// 철학적 섹션들
const PHILOSOPHY_SECTIONS = {
  ko: [
    {
      id: 'opening',
      title: '감정의 우주',
      subtitle: '모든 사람은 말로 표현할 수 없는 감정의 우주를 품고 있습니다.',
      description: 'SAYU는 그 우주를 예술이라는 언어로 번역하는 조용한 동반자입니다.',
      icon: Heart,
      color: 'from-pink-500 to-purple-600'
    },
    {
      id: 'translation',
      title: '감정의 번역가',
      subtitle: '당신의 마음을 색상으로, 형태로, 소리로 표현해보세요.',
      description: 'AI가 당신의 감정을 해석하고, 가장 공명하는 예술 작품을 찾아드립니다.',
      icon: Palette,
      color: 'from-blue-500 to-teal-500'
    },
    {
      id: 'walk',
      title: '사유의 산책',
      subtitle: '예술은 빠르게 소비하는 것이 아니라, 천천히 대화하는 것입니다.',
      description: '한 작품 앞에서 충분한 시간을 가지고, 깊은 대화를 나누어보세요.',
      icon: Footprints,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'growth',
      title: '보이지 않는 성장',
      subtitle: '성과가 아닌 경험, 숫자가 아닌 깊이를 추구합니다.',
      description: '당신의 예술적 여정은 레벨이나 점수로 측정되지 않습니다.',
      icon: Mountain,
      color: 'from-orange-500 to-red-500'
    }
  ],
  en: [
    {
      id: 'opening',
      title: 'Universe of Emotions',
      subtitle: 'Everyone carries a universe of emotions that words cannot express.',
      description: 'SAYU is a quiet companion that translates that universe into the language of art.',
      icon: Heart,
      color: 'from-pink-500 to-purple-600'
    },
    {
      id: 'translation',
      title: 'Emotion Translator',
      subtitle: 'Express your heart through colors, shapes, and sounds.',
      description: 'AI interprets your emotions and finds the most resonant artworks.',
      icon: Palette,
      color: 'from-blue-500 to-teal-500'
    },
    {
      id: 'walk',
      title: 'Contemplative Walk',
      subtitle: 'Art is not for quick consumption, but for slow conversation.',
      description: 'Take enough time with each artwork and engage in deep dialogue.',
      icon: Footprints,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'growth',
      title: 'Invisible Growth',
      subtitle: 'We pursue experience over achievement, depth over numbers.',
      description: 'Your artistic journey is not measured by levels or scores.',
      icon: Mountain,
      color: 'from-orange-500 to-red-500'
    }
  ]
};

export default function PhilosophyPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [currentSection, setCurrentSection] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const sections = PHILOSOPHY_SECTIONS[language];
  
  // 배경 그라디언트 애니메이션
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -300]);
  
  // 자동 진행
  useEffect(() => {
    if (!isAutoScrolling) return;
    
    const timer = setInterval(() => {
      setCurrentSection(prev => (prev + 1) % sections.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isAutoScrolling, sections.length]);
  
  // 사용자 인터랙션 시 자동 진행 중단
  const handleUserInteraction = () => {
    setIsAutoScrolling(false);
  };
  
  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden"
    >
      {/* 배경 애니메이션 */}
      <motion.div
        style={{ y: backgroundY }}
        className="fixed inset-0 opacity-5"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
      </motion.div>
      
      {/* 헤더 */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-6"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold">SAYU</h1>
              <p className="text-sm text-muted-foreground">
                {language === 'ko' ? 'Art Life Platform' : 'Art Life Platform'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="gap-2"
            >
              {language === 'ko' ? '처음으로' : 'Back to Start'}
            </Button>
            <Button
              variant="default"
              onClick={() => router.push('/home')}
              className="gap-2"
            >
              {language === 'ko' ? '바로 시작하기' : 'Get Started'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.header>
      
      {/* 메인 콘텐츠 */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pb-12">
        {/* 오프닝 인용구 */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-16"
        >
          <Quote className="w-12 h-12 mx-auto mb-6 text-primary/60" />
          <blockquote className="text-2xl md:text-3xl font-light leading-relaxed max-w-4xl mx-auto">
            {language === 'ko' ? (
              <>
                <span className="text-primary">"감정"</span>과{' '}
                <span className="text-primary">"예술"</span> 사이에는<br />
                말로 설명할 수 없는 다리가 있습니다.
              </>
            ) : (
              <>
                Between <span className="text-primary">"emotion"</span> and{' '}
                <span className="text-primary">"art"</span><br />
                lies a bridge beyond words.
              </>
            )}
          </blockquote>
        </motion.section>
        
        {/* 철학 섹션들 */}
        <section className="space-y-32">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              onViewportEnter={() => setCurrentSection(index)}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              {/* 텍스트 콘텐츠 */}
              <motion.div
                initial={{ x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ x: 0 }}
                transition={{ delay: 0.2 }}
                className={`space-y-6 ${index % 2 === 1 ? 'md:order-2' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${section.color}`}>
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">{section.title}</h2>
                </div>
                
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {section.subtitle}
                </p>
                
                <p className="text-lg leading-relaxed">
                  {section.description}
                </p>
                
                {/* CTA 버튼 */}
                {section.id === 'translation' && (
                  <Button
                    onClick={() => router.push('/emotion-translator')}
                    className="gap-2 mt-6"
                    size="lg"
                  >
                    <Palette className="w-5 h-5" />
                    {language === 'ko' ? '감정 번역해보기' : 'Try Emotion Translation'}
                  </Button>
                )}
                
                {section.id === 'walk' && (
                  <Button
                    onClick={() => router.push('/contemplative-walk')}
                    className="gap-2 mt-6"
                    size="lg"
                  >
                    <Footprints className="w-5 h-5" />
                    {language === 'ko' ? '사유의 산책 시작' : 'Start Contemplative Walk'}
                  </Button>
                )}
              </motion.div>
              
              {/* 시각적 요소 */}
              <motion.div
                initial={{ x: index % 2 === 0 ? 50 : -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`${index % 2 === 1 ? 'md:order-1' : ''}`}
              >
                <PhilosophyVisualization sectionId={section.id} color={section.color} />
              </motion.div>
            </motion.div>
          ))}
        </section>
        
        {/* 경험 미리보기 */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-24 text-center"
        >
          <h2 className="text-3xl font-bold mb-8">
            {language === 'ko' ? '지금 바로 경험해보세요' : 'Experience It Now'}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Eye className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'ko' ? '직관적 감상' : 'Intuitive Viewing'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {language === 'ko' 
                  ? '복잡한 설정 없이 바로 시작하세요'
                  : 'Start immediately without complex setup'}
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Clock className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'ko' ? '느린 시간' : 'Slow Time'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {language === 'ko' 
                  ? '당신만의 속도로 예술과 대화하세요'
                  : 'Converse with art at your own pace'}
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Waves className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'ko' ? '감정의 흐름' : 'Flow of Emotions'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {language === 'ko' 
                  ? '마음의 변화를 자연스럽게 기록하세요'
                  : 'Record the natural changes in your heart'}
              </p>
            </Card>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/home')}
              size="lg"
              className="gap-2"
            >
              <Heart className="w-5 h-5" />
              {language === 'ko' ? '홈으로 이동' : 'Go to Home'}
            </Button>
            
            <Button
              onClick={() => router.push('/emotion-translator')}
              size="lg"
              variant="outline"
              className="gap-2"
            >
              <Palette className="w-5 h-5" />
              {language === 'ko' ? '감정으로 시작하기' : 'Start with Emotion'}
            </Button>
            
            <Button
              onClick={() => router.push('/contemplative-walk')}
              size="lg"
              variant="outline"
              className="gap-2"
            >
              <Footprints className="w-5 h-5" />
              {language === 'ko' ? '산책으로 시작하기' : 'Start with Walk'}
            </Button>
          </div>
        </motion.section>
      </main>
      
      {/* 진행 인디케이터 */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex gap-2">
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSection(index);
                handleUserInteraction();
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSection
                  ? 'bg-primary scale-125'
                  : 'bg-primary/30 hover:bg-primary/60'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 섹션별 시각화 컴포넌트
function PhilosophyVisualization({ 
  sectionId, 
  color 
}: { 
  sectionId: string; 
  color: string; 
}) {
  return (
    <div className="relative h-96 flex items-center justify-center">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`w-64 h-64 rounded-full bg-gradient-to-r ${color} opacity-20`}
      />
      
      {sectionId === 'opening' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full"
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: `0 ${100 + i * 10}px`,
                transform: `rotate(${i * 45}deg)`,
              }}
              animate={{
                scale: [0.5, 1.5, 0.5],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      )}
      
      {sectionId === 'translation' && (
        <motion.div
          animate={{ 
            background: [
              'radial-gradient(circle, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)',
              'radial-gradient(circle, #4ecdc4 0%, #45b7d1 50%, #96ceb4 100%)',
              'radial-gradient(circle, #45b7d1 0%, #96ceb4 50%, #ffc3a0 100%)',
              'radial-gradient(circle, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)',
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-8 rounded-full opacity-60"
        />
      )}
      
      {sectionId === 'walk' && (
        <motion.div className="absolute inset-0 flex items-center justify-center">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-16 h-16 border-2 border-primary/30 rounded-full"
              animate={{
                scale: [1, 2, 1],
                opacity: [0.7, 0, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1,
              }}
            />
          ))}
        </motion.div>
      )}
      
      {sectionId === 'growth' && (
        <motion.div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl opacity-60"
          >
            🌱
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}