'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, MousePointer2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ModernHero() {
  const router = useRouter();
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(titleRef, { once: true });
  const [mounted, setMounted] = useState(false);
  
  // Scroll animations
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);
  
  // Spring animations
  const springConfig = { stiffness: 100, damping: 30 };
  const ySpring = useSpring(yParallax, springConfig);
  
  // Mouse position for magnetic effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState('default');
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Magnetic button effect
  const handleMagneticHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  };
  
  const handleMagneticLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translate(0, 0)';
  };
  
  return (
    <section ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Advanced Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />
        
        {/* Animated Mesh Gradient */}
        <svg className="absolute inset-0 w-full h-full" style={{ filter: 'blur(100px)' }}>
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3">
                <animate attributeName="stop-color" values="#8B5CF6;#EC4899;#8B5CF6" dur="10s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.3">
                <animate attributeName="stop-color" values="#EC4899;#3B82F6;#EC4899" dur="10s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>
          <circle cx="20%" cy="20%" r="40%" fill="url(#gradient1)">
            <animateTransform attributeName="transform" type="translate" values="0,0; 100,50; 0,0" dur="20s" repeatCount="indefinite" />
          </circle>
          <circle cx="80%" cy="80%" r="40%" fill="url(#gradient1)">
            <animateTransform attributeName="transform" type="translate" values="0,0; -100,-50; 0,0" dur="15s" repeatCount="indefinite" />
          </circle>
        </svg>
        
        {/* Particle Field */}
        <div className="absolute inset-0 overflow-hidden">
          {mounted && [...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
              initial={{
                x: (i * 137) % (typeof window !== 'undefined' ? window.innerWidth : 1920),
                y: (i * 239) % (typeof window !== 'undefined' ? window.innerHeight : 1080),
              }}
              animate={{
                x: [(i * 137) % (typeof window !== 'undefined' ? window.innerWidth : 1920), 
                    (i * 173) % (typeof window !== 'undefined' ? window.innerWidth : 1920)],
                y: [-10, typeof window !== 'undefined' ? window.innerHeight + 10 : 1090],
              }}
              transition={{
                duration: 10 + (i % 5) * 2,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <motion.div 
        className="relative z-10 flex items-center justify-center min-h-screen px-4"
        style={{ opacity, scale, y: ySpring }}
      >
        <div className="text-center max-w-6xl mx-auto">
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <div className="glass-enhanced px-6 py-3 rounded-full">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-weight-animate">
                  {language === 'ko' ? 'AI가 찾아주는 나만의 예술 취향' : 'AI-Powered Art Discovery'}
                </span>
              </div>
            </div>
          </motion.div>
          
          {/* Main Title with Variable Font Animation */}
          <motion.h1
            ref={titleRef}
            className="text-8xl md:text-9xl font-bold mb-8 text-fluid"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <motion.span
              className="inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
              style={{
                backgroundSize: '200% 200%',
                fontFamily: 'var(--font-display)',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                fontVariationSettings: [
                  '"wght" 400',
                  '"wght" 700',
                  '"wght" 400'
                ],
              }}
              transition={{
                backgroundPosition: {
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                },
                fontVariationSettings: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              SAYU
            </motion.span>
          </motion.h1>
          
          {/* Animated Subtitle */}
          <motion.p
            className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-12 font-light stagger-children"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="inline-block font-weight-animate">
              {language === 'ko' ? '당신의 성격이 만나는 ' : 'Where Your Personality Meets '}
            </span>
            <span className="inline-block font-medium text-purple-600 hover:font-weight-animate">
              {language === 'ko' ? '예술' : 'Art'}
            </span>
            <span className="inline-block font-weight-animate">
              {language === 'ko' ? '의 순간' : ''}
            </span>
          </motion.p>
          
          {/* CTA Buttons with Magnetic Effect */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              onClick={() => router.push('/home')}
              onMouseMove={handleMagneticHover}
              onMouseLeave={handleMagneticLeave}
              onMouseEnter={() => setCursorVariant('button')}
              className="group relative magnetic-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative glass-enhanced px-8 py-4 rounded-2xl overflow-hidden">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-80" />
                
                <span className="relative z-10 flex items-center gap-3 text-white font-semibold text-lg">
                  {language === 'ko' ? '3분 테스트 시작하기' : 'Start 3-Min Test'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </motion.button>
            
            <motion.button
              onClick={() => router.push('/gallery-3d')}
              onMouseMove={handleMagneticHover}
              onMouseLeave={handleMagneticLeave}
              className="group relative magnetic-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative neo-morph px-8 py-4 rounded-2xl hover-glow">
                <span className="flex items-center gap-3 text-gray-800 dark:text-white font-semibold text-lg">
                  <Sparkles className="w-5 h-5 text-purple-600 group-hover:rotate-12 transition-transform" />
                  {language === 'ko' ? '3D 갤러리 체험' : 'Experience 3D Gallery'}
                </span>
              </div>
            </motion.button>
          </motion.div>
          
          {/* Scroll Indicator with CSS Animation */}
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="scroll-fade-in">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex flex-col items-center gap-2 text-gray-500"
              >
                <MousePointer2 className="w-5 h-5" />
                <span className="text-sm font-weight-animate">
                  {language === 'ko' ? '스크롤하여 더보기' : 'Scroll to explore'}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Custom Cursor - Hidden on mobile */}
      <motion.div
        className="fixed w-4 h-4 bg-purple-600 rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block"
        animate={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
          scale: cursorVariant === 'button' ? 2 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </section>
  );
}