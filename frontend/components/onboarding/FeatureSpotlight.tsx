'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowRight } from 'lucide-react';

interface SpotlightStep {
  target: string; // CSS selector for the target element
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface FeatureSpotlightProps {
  steps: SpotlightStep[];
  onComplete?: () => void;
  storageKey?: string;
}

export function FeatureSpotlight({ steps, onComplete, storageKey = 'featureSpotlight' }: FeatureSpotlightProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    // Check if spotlight has been shown before
    const hasShown = localStorage.getItem(`${storageKey}_completed`);
    if (!hasShown) {
      setIsActive(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isActive || !steps[currentStep]) return;

    const updateTargetPosition = () => {
      const target = document.querySelector(steps[currentStep].target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        
        // Scroll target into view
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updateTargetPosition();
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);

    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [currentStep, steps, isActive]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsActive(false);
    localStorage.setItem(`${storageKey}_completed`, 'true');
    onComplete?.();
  };

  if (!isActive || !targetRect) return null;

  const currentStepData = steps[currentStep];
  const position = currentStepData.position || 'bottom';

  // Calculate tooltip position
  const getTooltipStyle = () => {
    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200; // Approximate

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top - tooltipHeight - padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - padding;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + padding;
        break;
    }

    // Keep tooltip within viewport
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

    return { top, left, width: tooltipWidth };
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none"
      >
        {/* Backdrop with cutout */}
        <div className="absolute inset-0 pointer-events-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            className="absolute bg-transparent"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
              borderRadius: '12px'
            }}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Tooltip */}
        <motion.div
          className="absolute bg-gray-900 rounded-xl shadow-2xl border border-purple-500/50 p-6 pointer-events-auto"
          style={getTooltipStyle()}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Progress */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 w-8 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-purple-500' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <h3 className="text-xl font-semibold text-white mb-2">
            {currentStepData.title}
          </h3>
          <p className="text-gray-300 mb-4">
            {currentStepData.description}
          </p>

          {/* Actions */}
          <div className="flex justify-between items-center">
            {currentStepData.action ? (
              <Button
                size="sm"
                variant="outline"
                onClick={currentStepData.action.onClick}
                className="text-purple-400 border-purple-400 hover:bg-purple-400/10"
              >
                {currentStepData.action.label}
              </Button>
            ) : (
              <div />
            )}

            <Button
              size="sm"
              onClick={handleNext}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {currentStep < steps.length - 1 ? 'Next' : 'Got it'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>

        {/* Pulse animation on target */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-full h-full rounded-xl border-2 border-purple-500" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}