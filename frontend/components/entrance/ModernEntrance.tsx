'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface ModernEntranceProps {
  onEnter: () => void;
  isOpen: boolean;
}

export default function ModernEntrance({ onEnter, isOpen }: ModernEntranceProps) {
  const { language } = useLanguage();
  const [showText, setShowText] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          style={{
            background: 'radial-gradient(ellipse at center, #FBF7F4 0%, #F5F1ED 100%)',
          }}
        >
          {/* Animated geometric patterns */}
          <div className="absolute inset-0">
            <svg className="w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="doorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6F4E37" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#8B7E74" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#6F4E37" stopOpacity="0.1" />
                </linearGradient>
                <filter id="doorGlow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Left door panel */}
              <motion.rect
                x="0"
                y="0"
                width="960"
                height="1080"
                fill="url(#doorGradient)"
                initial={{ x: 0 }}
                animate={{ x: isOpen ? -960 : 0 }}
                transition={{ duration: 2, ease: [0.43, 0.13, 0.23, 0.96] }}
              />

              {/* Right door panel */}
              <motion.rect
                x="960"
                y="0"
                width="960"
                height="1080"
                fill="url(#doorGradient)"
                initial={{ x: 960 }}
                animate={{ x: isOpen ? 1920 : 960 }}
                transition={{ duration: 2, ease: [0.43, 0.13, 0.23, 0.96] }}
              />

              {/* Center line decoration */}
              <motion.line
                x1="960"
                y1="0"
                x2="960"
                y2="1080"
                stroke="#6F4E37"
                strokeWidth="2"
                opacity="0.3"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{ transformOrigin: 'center' }}
              />

              {/* Decorative circles */}
              {[...Array(5)].map((_, i) => (
                <motion.circle
                  key={i}
                  cx="960"
                  cy={216 * (i + 1)}
                  r="0"
                  fill="none"
                  stroke="#6F4E37"
                  strokeWidth="1"
                  opacity="0.2"
                  initial={{ r: 0 }}
                  animate={{ r: 50 + i * 10 }}
                  transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
                />
              ))}
            </svg>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-sayu-mocha rounded-full opacity-20"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  y: [null, Math.random() * -100 - 50],
                  opacity: [0.2, 0, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          {/* Interactive light effect following cursor */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: 400,
              height: 400,
              background: 'radial-gradient(circle, rgba(111, 78, 55, 0.1) 0%, transparent 70%)',
              left: cursorPosition.x - 200,
              top: cursorPosition.y - 200,
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Center content */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {/* Logo */}
            <motion.div
              className="mb-12"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <h1 className="sayu-display text-6xl md:text-8xl font-bold text-sayu-mocha relative">
                SAYU
                <motion.span
                  className="absolute -inset-4 bg-sayu-lavender rounded-full opacity-20 blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </h1>
            </motion.div>

            {/* Tagline */}
            <AnimatePresence>
              {showText && (
                <motion.p
                  className="text-sayu-text-secondary text-lg md:text-xl mb-12 text-center max-w-md"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.8 }}
                >
                  {language === 'ko' 
                    ? '당신의 예술적 영혼을 발견하는 여정'
                    : 'Discover Your Artistic Soul'}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Enter button */}
            <motion.button
              onClick={onEnter}
              className="relative group"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative px-8 py-4 bg-sayu-mocha text-sayu-cream rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-sayu-lavender to-sayu-sage opacity-0 group-hover:opacity-30"
                  initial={false}
                  animate={{ x: [-100, 100] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <span className="relative z-10 font-medium text-lg">
                  {language === 'ko' ? '입장하기' : 'Enter Gallery'}
                </span>
              </div>
              
              {/* Ripple effect on hover */}
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={false}
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(111, 78, 55, 0.3)',
                    '0 0 0 20px rgba(111, 78, 55, 0)',
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            </motion.button>

            {/* Hint text */}
            <motion.p
              className="mt-8 text-sayu-text-muted text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 1, delay: 2 }}
            >
              {language === 'ko' ? '클릭하여 시작' : 'Click to begin'}
            </motion.p>
          </motion.div>

          {/* Corner decorations */}
          <svg className="absolute top-0 left-0 w-32 h-32" viewBox="0 0 100 100">
            <motion.path
              d="M0,0 L100,0 L0,100 Z"
              fill="none"
              stroke="#6F4E37"
              strokeWidth="0.5"
              opacity="0.2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>
          <svg className="absolute top-0 right-0 w-32 h-32" viewBox="0 0 100 100">
            <motion.path
              d="M100,0 L0,0 L100,100 Z"
              fill="none"
              stroke="#6F4E37"
              strokeWidth="0.5"
              opacity="0.2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>
          <svg className="absolute bottom-0 left-0 w-32 h-32" viewBox="0 0 100 100">
            <motion.path
              d="M0,100 L100,100 L0,0 Z"
              fill="none"
              stroke="#6F4E37"
              strokeWidth="0.5"
              opacity="0.2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>
          <svg className="absolute bottom-0 right-0 w-32 h-32" viewBox="0 0 100 100">
            <motion.path
              d="M100,100 L0,100 L100,0 Z"
              fill="none"
              stroke="#6F4E37"
              strokeWidth="0.5"
              opacity="0.2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}