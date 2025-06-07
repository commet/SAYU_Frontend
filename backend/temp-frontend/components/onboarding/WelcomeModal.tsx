'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Palette, Brain, Heart, Trophy, ArrowRight, X } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export function WelcomeModal({ isOpen, onClose, userName }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Sparkles className="w-12 h-12 text-purple-400" />,
      title: `Welcome to SAYU${userName ? ', ' + userName : ''}!`,
      description: "You're about to discover your unique aesthetic personality through our scientifically-designed assessment.",
      image: "/images/onboarding/welcome.png"
    },
    {
      icon: <Brain className="w-12 h-12 text-blue-400" />,
      title: "Two-Part Assessment",
      description: "First, we'll explore how you experience art galleries, then discover what types of art resonate with your soul.",
      bullets: [
        "Exhibition preferences (5 minutes)",
        "Artwork preferences (5 minutes)",
        "Instant personality profile generation"
      ]
    },
    {
      icon: <Palette className="w-12 h-12 text-pink-400" />,
      title: "Your Personalized Experience",
      description: "Based on your responses, we'll create a unique profile from 128 possible aesthetic personalities.",
      bullets: [
        "AI-generated profile artwork",
        "Personalized UI theme",
        "Curated art recommendations"
      ]
    },
    {
      icon: <Heart className="w-12 h-12 text-red-400" />,
      title: "AI Curator & Community",
      description: "Chat with an AI curator who understands your taste, and connect with others who share your aesthetic vision.",
      bullets: [
        "24/7 AI art companion",
        "Weekly insight reports",
        "Achievement system"
      ]
    },
    {
      icon: <Trophy className="w-12 h-12 text-yellow-400" />,
      title: "Ready to Begin?",
      description: "Your journey to aesthetic self-discovery starts now. The assessment takes about 10 minutes.",
      cta: true
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && handleSkip()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Progress Bar */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm text-gray-400">Getting Started</h3>
                <button
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-purple-500' : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="flex justify-center mb-6">
                  {currentStepData.icon}
                </div>

                <h2 className="text-3xl font-bold text-white mb-4">
                  {currentStepData.title}
                </h2>

                <p className="text-gray-300 text-lg mb-6">
                  {currentStepData.description}
                </p>

                {currentStepData.bullets && (
                  <ul className="text-left max-w-md mx-auto mb-8 space-y-3">
                    {currentStepData.bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start text-gray-400">
                        <span className="text-purple-400 mr-2">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {currentStepData.image && (
                  <img
                    src={currentStepData.image}
                    alt={currentStepData.title}
                    className="rounded-lg mx-auto mb-8 max-w-full"
                  />
                )}
              </motion.div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-800 flex justify-between">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-400 hover:text-white"
              >
                Skip Tour
              </Button>

              <div className="flex gap-3">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  className={
                    currentStepData.cta
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      : ''
                  }
                >
                  {currentStepData.cta ? "Start Assessment" : "Next"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}