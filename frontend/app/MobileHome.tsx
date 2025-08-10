'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Sparkles } from 'lucide-react';
import Image from 'next/image';

const sections = [
  {
    id: 0,
    title: "Your feelings shift like the tides,",
    subtitle: "Wondering which one is the real you?",
    description: "Begin your artistic journey to discover your true self",
    gradient: "from-purple-900 via-purple-700 to-indigo-600",
    buttonText: "Discover My Art Persona"
  },
  {
    id: 1,
    title: "16 Unique Perspectives on Art",
    artwork: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/640px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
      title: "Starry Night",
      artist: "Vincent van Gogh"
    },
    gradient: "from-indigo-900 via-blue-800 to-cyan-700"
  },
  {
    id: 2,
    title: "Many people are already with SAYU",
    testimonial: {
      quote: "I start each day viewing artworks that match my emotions.",
      name: "Emily",
      type: "APT: LAEF",
      emoji: "🦊"
    },
    gradient: "from-purple-800 via-purple-600 to-pink-600"
  },
  {
    id: 3,
    title: "A Garden of Art We Create Together",
    benefits: [
      "🎁 Special Benefits for First 100",
      "🌱 Early Access to New Features", 
      "🏆 Founding Member Badge",
      "🎨 Co-create the Service"
    ],
    stats: "Today 47 people discovered their Art Persona",
    gradient: "from-green-800 via-green-600 to-emerald-500",
    buttonText: "Start Now →"
  }
];

export default function MobileHome() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe && currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
    if (isDownSwipe && currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSwipeUp = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handleButtonClick = () => {
    if (currentSection === 0 || currentSection === 3) {
      router.push('/quiz');
    }
  };

  const section = sections[currentSection];

  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 bg-gradient-to-b ${section.gradient} flex flex-col`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <button className="text-white p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">SAYU</h1>
            <div className="w-10" />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            {currentSection === 0 && (
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                  {section.title}
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  {section.subtitle}
                </p>
                <p className="text-white/70 mb-12">
                  {section.description}
                </p>
                <button
                  onClick={handleButtonClick}
                  className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg border border-white/30"
                >
                  {section.buttonText}
                </button>
              </motion.div>
            )}

            {currentSection === 1 && section.artwork && (
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center w-full"
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  16 Unique Eyes
                </h2>
                <p className="text-white/80 mb-6">
                  16 unique perspectives on art
                </p>
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                  <img
                    src={section.artwork.url}
                    alt={section.artwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {section.artwork.title}
                </h3>
                <p className="text-white/70">
                  {section.artwork.artist}
                </p>
                <div className="flex justify-center gap-4 mt-6">
                  <button className="text-white p-2">←</button>
                  <button className="text-white p-2">→</button>
                </div>
              </motion.div>
            )}

            {currentSection === 2 && section.testimonial && (
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center w-full"
              >
                <h2 className="text-2xl font-bold text-white mb-8">
                  {section.title}
                </h2>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <p className="text-xl text-white mb-8 italic">
                    "{section.testimonial.quote}"
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center text-2xl">
                      {section.testimonial.emoji}
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">
                        {section.testimonial.name}
                      </p>
                      <p className="text-white/70 text-sm">
                        {section.testimonial.type}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentSection === 3 && section.benefits && (
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center w-full"
              >
                <h2 className="text-2xl font-bold text-white mb-8 leading-tight">
                  {section.title}
                </h2>
                <div className="space-y-3 mb-8">
                  {section.benefits.map((benefit, i) => (
                    <div key={i} className="text-white text-left">
                      {benefit}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleButtonClick}
                  className="w-full bg-white text-green-700 px-8 py-4 rounded-full font-bold text-lg"
                >
                  {section.buttonText}
                </button>
                <p className="text-white/70 text-sm mt-6">
                  {section.stats}
                </p>
              </motion.div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="p-6">
            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-4">
              {sections.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === currentSection ? 'w-8 bg-white' : 'w-2 bg-white/30'
                  }`}
                />
              ))}
            </div>

            {/* Swipe Hint */}
            {currentSection < sections.length - 1 && (
              <motion.div 
                className="flex flex-col items-center text-white/60"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <p className="text-sm mb-2">Swipe up</p>
                <ChevronUp className="w-5 h-5" />
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="flex items-center justify-around py-2">
          <button className="flex flex-col items-center p-2 text-purple-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </button>
          <button onClick={() => router.push('/quiz')} className="flex flex-col items-center p-2 text-gray-400">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs mt-1">Quiz</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            <span className="text-xs mt-1">Gallery</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <span className="text-xs mt-1">Community</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-400">
            <div className="w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center">
              <span className="text-xs">🦊</span>
            </div>
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}