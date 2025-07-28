'use client';

import { useState } from 'react';
import { MessageCircle, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import FeedbackModal from './FeedbackModal';

interface FeedbackButtonProps {
  position?: 'fixed' | 'inline';
  variant?: 'primary' | 'secondary' | 'minimal';
  contextData?: {
    page?: string;
    personalityType?: string;
    feature?: string;
  };
}

export default function FeedbackButton({ 
  position = 'fixed', 
  variant = 'primary',
  contextData 
}: FeedbackButtonProps) {
  const { language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getButtonClasses = () => {
    const baseClasses = 'flex items-center gap-2 font-medium transition-all duration-200';
    
    if (position === 'fixed') {
      return `${baseClasses} fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full shadow-lg hover:shadow-xl`;
    }

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-purple-600 text-white hover:bg-purple-700 px-6 py-3 rounded-lg`;
      case 'secondary':
        return `${baseClasses} bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg`;
      case 'minimal':
        return `${baseClasses} text-gray-600 hover:text-purple-600 hover:bg-gray-50 px-3 py-2 rounded-lg`;
      default:
        return `${baseClasses} bg-purple-600 text-white hover:bg-purple-700 px-6 py-3 rounded-lg`;
    }
  };

  const getButtonStyles = () => {
    if (position === 'fixed') {
      switch (variant) {
        case 'primary':
          return 'bg-purple-600 text-white hover:bg-purple-700';
        case 'secondary':
          return 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50';
        case 'minimal':
          return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
        default:
          return 'bg-purple-600 text-white hover:bg-purple-700';
      }
    }
    return '';
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`${getButtonClasses()} ${getButtonStyles()}`}
        title={language === 'ko' ? '피드백 보내기' : 'Send Feedback'}
      >
        <MessageCircle className="w-5 h-5" />
        {position === 'fixed' ? (
          <span className="hidden sm:inline">
            {language === 'ko' ? '피드백' : 'Feedback'}
          </span>
        ) : (
          <span>
            {language === 'ko' ? '피드백 보내기' : 'Send Feedback'}
          </span>
        )}
      </button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contextData={contextData}
      />
    </>
  );
}