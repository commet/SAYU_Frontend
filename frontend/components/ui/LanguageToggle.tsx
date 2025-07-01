'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface LanguageToggleProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'glass';
}

export default function LanguageToggle({ className = '', variant = 'default' }: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage();

  const variants = {
    default: 'px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all text-white font-medium',
    minimal: 'px-3 py-1.5 text-sm bg-transparent border border-white/20 rounded-md hover:bg-white/10 transition-all text-white',
    glass: 'px-4 py-2 bg-black/20 backdrop-blur-md rounded-full hover:bg-black/30 transition-all text-white font-medium border border-white/10'
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      className={`${variants[variant]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle language"
    >
      {language === 'en' ? '한국어' : 'English'}
    </motion.button>
  );
}