'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

interface ArtworkItem {
  id: number;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  color: string;
}

const sampleArtworks: ArtworkItem[] = [
  {
    id: 1,
    title: "Starry Night",
    artist: "Vincent van Gogh",
    year: "1889",
    imageUrl: "/api/placeholder/400/600",
    color: "#1e3a8a"
  },
  {
    id: 2,
    title: "The Great Wave",
    artist: "Katsushika Hokusai", 
    year: "1831",
    imageUrl: "/api/placeholder/400/600",
    color: "#0c4a6e"
  },
  {
    id: 3,
    title: "Girl with a Pearl Earring",
    artist: "Johannes Vermeer",
    year: "1665",
    imageUrl: "/api/placeholder/400/600",
    color: "#713f12"
  },
  {
    id: 4,
    title: "The Kiss",
    artist: "Gustav Klimt",
    year: "1908",
    imageUrl: "/api/placeholder/400/600",
    color: "#a16207"
  },
  {
    id: 5,
    title: "The Persistence of Memory",
    artist: "Salvador Dalí",
    year: "1931",
    imageUrl: "/api/placeholder/400/600",
    color: "#7c2d12"
  }
];

export default function ScrollDrivenGallery() {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrollAnimationSupported, setIsScrollAnimationSupported] = useState(false);
  
  // Check for native scroll-driven animation support
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof CSS !== 'undefined' && CSS.supports) {
      try {
        setIsScrollAnimationSupported(CSS.supports('animation-timeline', 'scroll()'));
      } catch (e) {
        setIsScrollAnimationSupported(false);
      }
    }
  }, []);
  
  // Fallback to Framer Motion for browsers without native support
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const springConfig = { stiffness: 100, damping: 30 };
  
  return (
    <section ref={containerRef} className="relative min-h-[300vh] py-20">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background Gradient that changes with scroll */}
        <motion.div
          className="absolute inset-0 transition-colors duration-1000"
          style={{
            background: useTransform(
              scrollYProgress,
              [0, 0.25, 0.5, 0.75, 1],
              [
                'linear-gradient(to br, #fef3c7, #fde68a)',
                'linear-gradient(to br, #ddd6fe, #c4b5fd)',
                'linear-gradient(to br, #fecaca, #fca5a5)',
                'linear-gradient(to br, #bfdbfe, #93c5fd)',
                'linear-gradient(to br, #d1fae5, #a7f3d0)'
              ]
            )
          }}
        />
        
        {/* Title */}
        <div className="relative z-10 text-center pt-20 px-4">
          <motion.h2
            className="text-5xl md:text-6xl font-bold mb-4"
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]),
              y: useTransform(scrollYProgress, [0, 0.1], [0, -50])
            }}
          >
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {language === 'ko' ? '명작 갤러리' : 'Masterpiece Gallery'}
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-700 dark:text-gray-300"
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0])
            }}
          >
            {language === 'ko' ? '스크롤하여 작품을 감상하세요' : 'Scroll to explore artworks'}
          </motion.p>
        </div>
        
        {/* Gallery Container */}
        <div className="relative h-full flex items-center justify-center">
          {/* Native CSS Scroll Animation (if supported) */}
          {isScrollAnimationSupported && (
            <div className="scroll-gallery-container absolute inset-0">
              {sampleArtworks.map((artwork, index) => (
                <div
                  key={artwork.id}
                  className="scroll-gallery-item"
                  style={{
                    '--index': index,
                    '--total': sampleArtworks.length,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          )}
          
          {/* Framer Motion Fallback */}
          <div className="relative w-full max-w-6xl h-[600px] perspective-1000">
            {sampleArtworks.map((artwork, index) => {
              const progress = index / (sampleArtworks.length - 1);
              const start = progress * 0.8;
              const end = start + 0.2;
              
              const scale = useTransform(scrollYProgress, [start, start + 0.1, end - 0.1, end], [0.8, 1, 1, 0.8]);
              const opacity = useTransform(scrollYProgress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0]);
              const x = useTransform(scrollYProgress, [start, end], [(index - 2) * 100, (index - 2) * -100]);
              const rotateY = useTransform(scrollYProgress, [start, start + 0.1, end - 0.1, end], [45, 0, 0, -45]);
              
              const springScale = useSpring(scale, springConfig);
              const springX = useSpring(x, springConfig);
              const springRotateY = useSpring(rotateY, springConfig);
              
              return (
                <motion.div
                  key={artwork.id}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    scale: springScale,
                    opacity,
                    x: springX,
                    rotateY: springRotateY,
                    transformStyle: 'preserve-3d',
                    zIndex: useTransform(scrollYProgress, [start, start + 0.1, end - 0.1, end], [1, 10, 10, 1])
                  }}
                >
                  <div className="relative group cursor-pointer">
                    {/* Card */}
                    <div className="glass-enhanced rounded-2xl overflow-hidden shadow-2xl hover-lift">
                      {/* Image Container */}
                      <div className="relative w-[300px] md:w-[400px] h-[450px] md:h-[600px] bg-gray-200">
                        <div 
                          className="absolute inset-0"
                          style={{ backgroundColor: artwork.color }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        
                        {/* Placeholder for actual image */}
                        <div className="absolute inset-0 flex items-center justify-center text-white/20 text-6xl">
                          🎨
                        </div>
                      </div>
                      
                      {/* Info Overlay */}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 p-6 text-white"
                        initial={{ y: 100, opacity: 0 }}
                        whileHover={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-2xl font-bold mb-1 font-weight-animate">
                          {artwork.title}
                        </h3>
                        <p className="text-lg opacity-90">{artwork.artist}</p>
                        <p className="text-sm opacity-70">{artwork.year}</p>
                      </motion.div>
                    </div>
                    
                    {/* 3D Shadow */}
                    <div 
                      className="absolute inset-0 bg-black/20 blur-2xl -z-10 transform translate-y-4"
                      style={{ transform: 'translateZ(-50px) translateY(20px)' }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Progress Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 h-1 bg-white/20 rounded-full overflow-hidden"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
            style={{ scaleX: scrollYProgress }}
          />
        </motion.div>
      </div>
      
      {/* CSS for native scroll animations */}
      <style jsx>{`
        @supports (animation-timeline: scroll()) {
          .scroll-gallery-item {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            height: 600px;
            background: linear-gradient(45deg, #8b5cf6, #ec4899);
            border-radius: 1rem;
            opacity: 0;
            animation: galleryScroll linear both;
            animation-timeline: scroll();
            animation-range: calc(var(--index) * 20%) calc((var(--index) + 1) * 20% + 20%);
          }
          
          @keyframes galleryScroll {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.8) rotateY(45deg) translateX(200px);
            }
            20% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1) rotateY(0deg) translateX(0);
            }
            80% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1) rotateY(0deg) translateX(0);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.8) rotateY(-45deg) translateX(-200px);
            }
          }
        }
      `}</style>
    </section>
  );
}