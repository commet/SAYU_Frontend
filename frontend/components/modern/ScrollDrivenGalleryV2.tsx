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
  category: string;
  description: string;
}

// Using placeholder images for better performance
const artworks: ArtworkItem[] = [
  {
    id: 1,
    title: "The Starry Night",
    artist: "Vincent van Gogh",
    year: "1889",
    imageUrl: "/api/placeholder/400/600",
    category: "Post-Impressionism",
    description: "A swirling night sky over a French village"
  },
  {
    id: 2,
    title: "The Great Wave",
    artist: "Katsushika Hokusai",
    year: "1831",
    imageUrl: "/api/placeholder/400/600",
    category: "Ukiyo-e",
    description: "Iconic Japanese woodblock print of a towering wave"
  },
  {
    id: 3,
    title: "Water Lilies",
    artist: "Claude Monet",
    year: "1906",
    imageUrl: "/api/placeholder/400/600",
    category: "Impressionism",
    description: "Serene pond with floating lilies"
  },
  {
    id: 4,
    title: "The Dance Class",
    artist: "Edgar Degas",
    year: "1874",
    imageUrl: "/api/placeholder/400/600",
    category: "Impressionism",
    description: "Ballet dancers in rehearsal"
  },
  {
    id: 5,
    title: "Wheat Field with Cypresses",
    artist: "Vincent van Gogh",
    year: "1889",
    imageUrl: "/api/placeholder/400/600",
    category: "Post-Impressionism",
    description: "Vibrant landscape with swirling clouds"
  }
];

export default function ScrollDrivenGalleryV2() {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  // Track active artwork based on scroll
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((progress) => {
      const index = Math.floor(progress * artworks.length);
      setActiveIndex(Math.min(index, artworks.length - 1));
    });
    return unsubscribe;
  }, [scrollYProgress]);
  
  return (
    <section ref={containerRef} className="relative min-h-[400vh] bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background that changes with active artwork */}
        <motion.div 
          className="absolute inset-0 transition-all duration-1000 bg-white dark:bg-gray-900"
        />
        
        {/* Section Header */}
        <div className="relative z-20 text-center pt-20 px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            <span className="text-gray-900 dark:text-white">
              {language === 'ko' ? '명작 컬렉션' : 'Masterpiece Collection'}
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400"
          >
            {language === 'ko' ? '스크롤하여 시대를 초월한 예술을 감상하세요' : 'Scroll to explore timeless art'}
          </motion.p>
        </div>
        
        {/* Gallery Container */}
        <div className="relative h-full flex items-center justify-center px-4 pb-20">
          <div className="relative w-full max-w-7xl">
            {artworks.map((artwork, index) => {
              const progress = index / (artworks.length - 1);
              const start = progress * 0.8;
              const end = start + 0.2;
              
              const scale = useTransform(scrollYProgress, 
                [start, start + 0.05, end - 0.05, end], 
                [0.8, 1, 1, 0.8]
              );
              const opacity = useTransform(scrollYProgress, 
                [start, start + 0.02, end - 0.02, end], 
                [0, 1, 1, 0]
              );
              const x = useTransform(scrollYProgress, 
                [start, end], 
                [100, -100]
              );
              const rotateY = useTransform(scrollYProgress, 
                [start, start + 0.1, end - 0.1, end], 
                [25, 0, 0, -25]
              );
              
              const springScale = useSpring(scale, { stiffness: 100, damping: 30 });
              const springX = useSpring(x, { stiffness: 100, damping: 30 });
              
              return (
                <motion.div
                  key={artwork.id}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    scale: springScale,
                    opacity,
                    x: springX,
                    rotateY,
                    transformStyle: 'preserve-3d',
                    zIndex: index === activeIndex ? 10 : 1
                  }}
                >
                  <div className="flex flex-col md:flex-row items-center gap-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
                    {/* Image Placeholder */}
                    <div className="relative w-full md:w-96 h-96 md:h-[500px] bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl opacity-20">🎨</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </div>
                    
                    {/* Content */}
                    <div className="p-8 md:p-12 max-w-md">
                      <div className="mb-4">
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          {artwork.category}
                        </span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                        {artwork.title}
                      </h3>
                      <p className="text-xl text-gray-600 dark:text-gray-400 mb-1">
                        {artwork.artist}
                      </p>
                      <p className="text-lg text-gray-500 dark:text-gray-500 mb-6">
                        {artwork.year}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {artwork.description}
                      </p>
                      
                      {/* Action Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                      >
                        {language === 'ko' ? '자세히 보기' : 'View Details'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <div className="flex gap-2">
            {artworks.map((_, index) => (
              <motion.div
                key={index}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: index === activeIndex 
                    ? 'rgb(147 51 234)' 
                    : 'rgb(229 231 235)',
                }}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {activeIndex + 1} / {artworks.length}
          </span>
        </div>
      </div>
    </section>
  );
}