'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, Heart, Palette } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  const slides = [
    {
      title: "Discover Your Aesthetic Soul",
      description: "A personalized journey through art that reveals who you truly are",
      gradient: "from-purple-600 to-pink-600",
    },
    {
      title: "Experience Art Differently",
      description: "Let AI understand your emotional connection with artworks",
      gradient: "from-blue-600 to-cyan-600",
    },
    {
      title: "Grow Your Aesthetic Self",
      description: "Transform how you see and feel about art",
      gradient: "from-amber-600 to-red-600",
    },
  ];

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Generate consistent random values for animation
  const particles = useState(() => 
    [...Array(50)].map(() => ({
      initialX: Math.random() * 1920,
      initialY: Math.random() * 1080,
      animateX: Math.random() * 1920,
      animateY: Math.random() * 1080,
      duration: Math.random() * 20 + 10,
    }))
  )[0];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-blue-900" />
        {mounted && particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{
              x: particle.initialX,
              y: particle.initialY,
            }}
            animate={{
              x: particle.animateX,
              y: particle.animateY,
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 md:p-8">
          <nav className="flex justify-between items-center">
            <motion.h1 
              className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              SAYU
            </motion.h1>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:text-purple-400">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Start Journey
                </Button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-6 md:px-8">
          <div className="max-w-4xl w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <h2 className={`text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r ${slides[currentSlide].gradient} bg-clip-text text-transparent`}>
                  {slides[currentSlide].title}
                </h2>
                <p className="text-xl md:text-2xl text-gray-300 mb-12">
                  {slides[currentSlide].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* CTA */}
            <motion.div
              className="flex flex-col items-center gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-lg rounded-full group"
                >
                  Begin Your Journey
                  <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              {/* Features */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-900/50 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="font-semibold">AI-Powered</h3>
                  <p className="text-sm text-gray-400 mt-1">Deep personality analysis</p>
                </motion.div>

                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-pink-900/50 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-pink-400" />
                  </div>
                  <h3 className="font-semibold">Emotional</h3>
                  <p className="text-sm text-gray-400 mt-1">Connect with art deeply</p>
                </motion.div>

                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-900/50 flex items-center justify-center">
                    <Palette className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="font-semibold">Personalized</h3>
                  <p className="text-sm text-gray-400 mt-1">Your unique journey</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 pb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
