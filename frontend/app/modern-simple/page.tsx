'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function ModernSimplePage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <div className="glass-enhanced px-6 py-3 rounded-full">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI-Powered Art Discovery
                </span>
              </div>
            </div>
          </motion.div>
          
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-7xl md:text-8xl font-bold mb-8"
          >
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              SAYU
            </span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-2xl text-gray-700 mb-12"
          >
            Where Your Personality Meets Art
          </motion.p>
          
          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <button
              onClick={() => router.push('/home')}
              className="group glass-enhanced px-8 py-4 rounded-2xl hover:scale-105 transition-transform"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-80" />
                <span className="relative z-10 flex items-center gap-3 text-white font-semibold text-lg">
                  Start 3-Min Test
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </button>
          </motion.div>
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            Your Art Journey
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Personality Analysis', desc: 'APT theory based analysis' },
              { title: 'AI Curation', desc: 'Smart artwork recommendations' },
              { title: 'Art Exploration', desc: 'Discover world museums' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-enhanced p-6 rounded-2xl hover-lift"
              >
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}