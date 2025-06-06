'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { useAuth } from '@/hooks/useAuth';

export default function QuizIntroPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showWelcomeModal, setShowWelcomeModal } = useOnboarding();
  const [selectedType, setSelectedType] = useState<'exhibition' | 'artwork' | null>(null);

  const startQuiz = () => {
    if (selectedType) {
      router.push(`/quiz/${selectedType}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-black/50 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-purple-500/20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
            Discover Your Aesthetic Soul
          </h1>
          
          <p className="text-gray-300 text-lg mb-8 text-center">
            Through a series of questions about how you experience art, 
            we'll reveal your unique aesthetic personality.
          </p>
          
          <div className="space-y-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedType('exhibition')}
              className={`p-6 rounded-2xl cursor-pointer transition-all ${
                selectedType === 'exhibition' 
                  ? 'bg-purple-600/30 border-2 border-purple-500' 
                  : 'bg-gray-800/50 border-2 border-transparent hover:border-purple-500/50'
              }`}
            >
              <h3 className="text-xl font-semibold text-white mb-2">
                Exhibition Experience
              </h3>
              <p className="text-gray-400">
                How do you prefer to experience art exhibitions?
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedType('artwork')}
              className={`p-6 rounded-2xl cursor-pointer transition-all ${
                selectedType === 'artwork' 
                  ? 'bg-purple-600/30 border-2 border-purple-500' 
                  : 'bg-gray-800/50 border-2 border-transparent hover:border-purple-500/50'
              }`}
            >
              <h3 className="text-xl font-semibold text-white mb-2">
                Artwork Preferences
              </h3>
              <p className="text-gray-400">
                What kind of artworks resonate with you?
              </p>
            </motion.div>
          </div>
          
          <Button
            onClick={startQuiz}
            disabled={!selectedType}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            Begin the Journey
          </Button>
        </div>
      </motion.div>

      <WelcomeModal 
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        userName={user?.nickname}
      />
    </div>
  );
}
