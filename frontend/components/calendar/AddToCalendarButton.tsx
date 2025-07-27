'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CalendarPlus, Download, Share, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlassButton } from '@/components/ui/glass';

interface Exhibition {
  id: string;
  title: string;
  institution_name: string;
  address?: string;
  city: string;
  start_date: string;
  end_date: string;
  description?: string;
  website_url?: string;
}

interface AddToCalendarButtonProps {
  exhibition: Exhibition;
  variant?: 'button' | 'icon' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}

export function AddToCalendarButton({ exhibition, variant = 'button', size = 'md' }: AddToCalendarButtonProps) {
  const { language } = useLanguage();
  const [isAdded, setIsAdded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // 구글 캘린더 링크 생성
  const generateGoogleCalendarUrl = () => {
    const startDate = new Date(exhibition.start_date);
    const endDate = new Date(exhibition.end_date);
    
    const googleParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: exhibition.title,
      dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
      details: `${exhibition.description || ''}\n\n📍 ${exhibition.institution_name}\n🌐 ${exhibition.website_url || ''}`,
      location: `${exhibition.institution_name}, ${exhibition.address || exhibition.city}`,
      sf: 'true',
      output: 'xml'
    });

    return `https://calendar.google.com/calendar/render?${googleParams.toString()}`;
  };

  // Apple 캘린더용 ICS 파일 생성
  const generateICSFile = () => {
    const startDate = new Date(exhibition.start_date);
    const endDate = new Date(exhibition.end_date);
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SAYU//Exhibition Calendar//EN
BEGIN:VEVENT
UID:${exhibition.id}@sayu.art
DTSTART;VALUE=DATE:${formatDateForICS(startDate)}
DTEND;VALUE=DATE:${formatDateForICS(endDate)}
SUMMARY:${exhibition.title}
DESCRIPTION:${exhibition.description || ''}\\n\\n📍 ${exhibition.institution_name}\\n🌐 ${exhibition.website_url || ''}
LOCATION:${exhibition.institution_name}, ${exhibition.address || exhibition.city}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exhibition.title}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Outlook 캘린더 링크 생성
  const generateOutlookUrl = () => {
    const startDate = new Date(exhibition.start_date);
    const endDate = new Date(exhibition.end_date);
    
    const outlookParams = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: exhibition.title,
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
      body: `${exhibition.description || ''}\n\n📍 ${exhibition.institution_name}\n🌐 ${exhibition.website_url || ''}`,
      location: `${exhibition.institution_name}, ${exhibition.address || exhibition.city}`
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${outlookParams.toString()}`;
  };

  const formatDateForGoogle = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const formatDateForICS = (date: Date) => {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  };

  const handleAddToCalendar = (type: string) => {
    setIsAdded(true);
    setShowOptions(false);
    
    switch (type) {
      case 'google':
        window.open(generateGoogleCalendarUrl(), '_blank');
        break;
      case 'apple':
      case 'ics':
        generateICSFile();
        break;
      case 'outlook':
        window.open(generateOutlookUrl(), '_blank');
        break;
    }

    // 2초 후 상태 리셋
    setTimeout(() => setIsAdded(false), 2000);
  };

  const calendarOptions = [
    {
      id: 'google',
      name: 'Google Calendar',
      icon: '📅',
      action: () => handleAddToCalendar('google')
    },
    {
      id: 'apple',
      name: 'Apple Calendar',
      icon: '🍎',
      action: () => handleAddToCalendar('apple')
    },
    {
      id: 'outlook',
      name: 'Outlook',
      icon: '📧',
      action: () => handleAddToCalendar('outlook')
    },
    {
      id: 'ics',
      name: language === 'ko' ? '파일 다운로드' : 'Download File',
      icon: '💾',
      action: () => handleAddToCalendar('ics')
    }
  ];

  if (variant === 'icon') {
    return (
      <div className="relative">
        <motion.button
          className="p-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white transition-colors"
          onClick={() => setShowOptions(!showOptions)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isAdded ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <CalendarPlus className="w-4 h-4 text-gray-600" />
          )}
        </motion.button>

        {showOptions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-48"
          >
            {calendarOptions.map((option) => (
              <button
                key={option.id}
                onClick={option.action}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
              >
                <span>{option.icon}</span>
                {option.name}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
      >
        {language === 'ko' ? '캘린더에 추가' : 'Add to Calendar'}
      </button>
    );
  }

  return (
    <div className="relative">
      <GlassButton
        onClick={() => setShowOptions(!showOptions)}
        variant={isAdded ? 'success' : 'default'}
        size={size}
        className="flex items-center gap-2"
      >
        {isAdded ? (
          <>
            <Check className="w-4 h-4" />
            {language === 'ko' ? '추가됨' : 'Added'}
          </>
        ) : (
          <>
            <Calendar className="w-4 h-4" />
            {language === 'ko' ? '캘린더에 추가' : 'Add to Calendar'}
          </>
        )}
      </GlassButton>

      {showOptions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-48"
        >
          {calendarOptions.map((option) => (
            <button
              key={option.id}
              onClick={option.action}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm transition-colors"
            >
              <span>{option.icon}</span>
              {option.name}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}