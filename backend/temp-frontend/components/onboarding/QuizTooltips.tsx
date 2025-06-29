'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';

interface Dimension {
  code: string;
  name: string;
  description: string;
  leftLabel: string;
  rightLabel: string;
}

const dimensions: Record<string, Dimension> = {
  exhibition: {
    code: 'G/S',
    name: 'Experience Style',
    description: 'How you prefer to experience art galleries',
    leftLabel: 'Grounded (Personal, intimate experiences)',
    rightLabel: 'Shared (Social, communal experiences)'
  },
  art_preference: {
    code: 'A/R',
    name: 'Art Preference',
    description: 'What types of art resonate with you',
    leftLabel: 'Abstract (Conceptual, symbolic art)',
    rightLabel: 'Realistic (Representational, figurative art)'
  },
  engagement: {
    code: 'M/E',
    name: 'Engagement Approach',
    description: 'How you connect with artworks',
    leftLabel: 'Meaning (Analytical, intellectual approach)',
    rightLabel: 'Emotion (Intuitive, feeling-based approach)'
  }
};

export function QuizTooltips({ currentQuestionType }: { currentQuestionType?: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasShownTooltip, setHasShownTooltip] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Show tooltip for each dimension once
    if (currentQuestionType && !hasShownTooltip[currentQuestionType]) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        setHasShownTooltip(prev => ({ ...prev, [currentQuestionType]: true }));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentQuestionType, hasShownTooltip]);

  const handleDismiss = () => {
    setShowTooltip(false);
  };

  const dimension = currentQuestionType ? dimensions[currentQuestionType] : null;

  if (!dimension || !showTooltip) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-24 right-6 z-40 max-w-sm"
      >
        <div className="bg-purple-900/95 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-purple-700">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">
                Understanding {dimension.name}
              </h4>
              <p className="text-sm text-purple-100 mb-2">
                {dimension.description}
              </p>
              <div className="space-y-1 text-xs text-purple-200">
                <div>
                  <span className="font-medium">{dimension.code.split('/')[0]}:</span> {dimension.leftLabel}
                </div>
                <div>
                  <span className="font-medium">{dimension.code.split('/')[1]}:</span> {dimension.rightLabel}
                </div>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-purple-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Floating help button for quiz pages
export function QuizHelpButton() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <motion.button
        className="fixed bottom-6 left-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowHelp(!showHelp)}
      >
        <Info className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed bottom-20 left-6 bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800 max-w-sm"
          >
            <h3 className="font-semibold text-white mb-3">About the Assessment</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <p>
                SAYU uses a scientifically-designed personality assessment to understand your unique aesthetic preferences.
              </p>
              <p>
                There are no right or wrong answers - choose what feels most authentic to you.
              </p>
              <p>
                Your responses create one of 128 possible aesthetic personalities, each with its own:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Personalized UI theme</li>
                <li>AI-generated profile artwork</li>
                <li>Curated art recommendations</li>
                <li>Custom AI curator personality</li>
              </ul>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-4 text-purple-400 hover:text-purple-300 text-sm"
            >
              Got it
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}