'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Camera, Clock, Star, Check, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Exhibition {
  id: string;
  title: string;
  museum: string;
  image?: string;
  startDate: string;
  endDate: string;
}

interface CheckInProps {
  exhibition: Exhibition;
  onCheckIn: (data: CheckInData) => void;
  onCancel: () => void;
}

interface CheckInData {
  exhibitionId: string;
  rating?: number;
  photo?: string;
  notes?: string;
  startTime: string;
  endTime?: string;
}

export default function ExhibitionCheckIn({ exhibition, onCheckIn, onCancel }: CheckInProps) {
  const { language } = useLanguage();
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [startTime] = useState(new Date().toISOString());

  const handleCheckIn = () => {
    onCheckIn({
      exhibitionId: exhibition.id,
      rating: rating || undefined,
      photo: photo || undefined,
      notes: notes || undefined,
      startTime,
      endTime: new Date().toISOString(),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md sayu-liquid-glass rounded-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Exhibition Info */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {language === 'ko' ? '전시 체크인' : 'Exhibition Check-In'}
          </h2>
          <div className="flex items-start gap-3">
            {exhibition.image && (
              <img
                src={exhibition.image}
                alt={exhibition.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{exhibition.title}</h3>
              <p className="text-sm opacity-70 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {exhibition.museum}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full mx-1 transition-all ${
                s <= step ? 'bg-purple-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Rating */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">
                {language === 'ko' ? '전시는 어떠셨나요?' : 'How was the exhibition?'}
              </h3>
              
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    onClick={() => setRating(star)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= rating
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-2">
                <motion.button
                  onClick={() => setStep(2)}
                  className="flex-1 sayu-button sayu-button-primary py-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {rating > 0 
                    ? (language === 'ko' ? '다음' : 'Next')
                    : (language === 'ko' ? '건너뛰기' : 'Skip')
                  }
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Photo & Notes */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">
                {language === 'ko' ? '기록을 남기시겠어요?' : 'Would you like to add a record?'}
              </h3>

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === 'ko' ? '사진 추가' : 'Add Photo'}
                </label>
                <motion.button
                  className="w-full h-32 border-2 border-dashed border-white/30 rounded-xl flex flex-col items-center justify-center hover:border-white/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Camera className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm opacity-70">
                    {language === 'ko' ? '사진 선택' : 'Choose Photo'}
                  </span>
                </motion.button>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === 'ko' ? '메모' : 'Notes'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'ko' 
                    ? '전시에 대한 감상을 남겨주세요...' 
                    : 'Share your thoughts about the exhibition...'
                  }
                  className="w-full h-24 bg-white/10 border border-white/20 rounded-lg p-3 resize-none focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>

              <div className="flex gap-2">
                <motion.button
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {language === 'ko' ? '이전' : 'Back'}
                </motion.button>
                <motion.button
                  onClick={() => setStep(3)}
                  className="flex-1 sayu-button sayu-button-primary py-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {language === 'ko' ? '다음' : 'Next'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>
                
                <h3 className="text-lg font-semibold mb-2">
                  {language === 'ko' ? '체크인 완료!' : 'Check-in Complete!'}
                </h3>
                
                <p className="text-sm opacity-70">
                  {language === 'ko' 
                    ? '전시 기록이 저장되었습니다.' 
                    : 'Your exhibition visit has been recorded.'
                  }
                </p>

                {/* Summary */}
                <div className="mt-4 space-y-2 text-sm">
                  {rating > 0 && (
                    <div className="flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 opacity-70">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date().toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={handleCheckIn}
                className="w-full sayu-button sayu-button-primary py-3 font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {language === 'ko' ? '완료' : 'Done'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}