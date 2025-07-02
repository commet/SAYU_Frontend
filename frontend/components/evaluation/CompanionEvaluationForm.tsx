'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Send, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { personalityAnimals } from '@/data/personality-animals';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface CompanionEvaluationFormProps {
  exhibitionVisitId: string;
  exhibitionName: string;
  companionId: string;
  companionType: string;
  onSubmit: (evaluation: any) => void;
  onCancel: () => void;
}

const ratingCategories = [
  {
    key: 'exhibitionEngagement',
    name: 'Exhibition Engagement',
    name_ko: '전시 몰입도',
    description: 'How engaged were they with the exhibition?',
    description_ko: '전시에 얼마나 집중하고 몰입했나요?'
  },
  {
    key: 'communication',
    name: 'Communication',
    name_ko: '소통과 공유',
    description: 'Quality of conversation and idea sharing',
    description_ko: '대화와 의견 공유의 질은 어땠나요?'
  },
  {
    key: 'paceMatching',
    name: 'Pace Matching',
    name_ko: '페이스 맞추기',
    description: 'How well did they match your viewing pace?',
    description_ko: '서로의 관람 속도를 얼마나 잘 맞췄나요?'
  },
  {
    key: 'newPerspectives',
    name: 'New Perspectives',
    name_ko: '새로운 시각',
    description: 'Did they offer fresh insights or viewpoints?',
    description_ko: '새로운 관점이나 인사이트를 제공했나요?'
  },
  {
    key: 'overallSatisfaction',
    name: 'Overall Satisfaction',
    name_ko: '전반적 만족도',
    description: 'How satisfied were you with the experience?',
    description_ko: '함께한 전시 경험에 얼마나 만족하시나요?'
  }
];

export function CompanionEvaluationForm({
  exhibitionVisitId,
  exhibitionName,
  companionId,
  companionType,
  onSubmit,
  onCancel
}: CompanionEvaluationFormProps) {
  const { language } = useLanguage();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [wouldGoAgain, setWouldGoAgain] = useState<boolean | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [highlights, setHighlights] = useState('');
  const [improvements, setImprovements] = useState('');
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  
  const companionInfo = personalityDescriptions[companionType];
  const companionAnimal = personalityAnimals[companionType];

  const handleRatingChange = (category: string, rating: number) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
  };

  const handleCommentChange = (category: string, comment: string) => {
    setComments(prev => ({ ...prev, [`${category}_comment`]: comment }));
  };

  const handleSubmit = () => {
    // 모든 카테고리에 대한 평가가 완료되었는지 확인
    const allRated = ratingCategories.every(cat => ratings[cat.key]);
    
    if (!allRated) {
      toast.error(language === 'ko' 
        ? '모든 항목을 평가해주세요' 
        : 'Please rate all categories'
      );
      return;
    }

    if (wouldGoAgain === null) {
      toast.error(language === 'ko' 
        ? '다시 함께 가고 싶은지 선택해주세요' 
        : 'Please select if you would go again'
      );
      return;
    }

    const evaluation = {
      exhibitionVisitId,
      evaluatedId: companionId,
      evaluatedType: companionType,
      ratings: {
        ...ratings,
        ...comments
      },
      highlights: highlights || undefined,
      highlights_ko: highlights || undefined,
      improvements: improvements || undefined,
      improvements_ko: improvements || undefined,
      wouldGoAgain,
      isAnonymous
    };

    onSubmit(evaluation);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">{companionAnimal?.emoji}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {language === 'ko' ? '동반자 평가' : 'Companion Evaluation'}
        </h2>
        <p className="text-gray-600">
          {exhibitionName}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {language === 'ko' 
            ? `${companionInfo?.title_ko || companionInfo?.title} (${companionType})와 함께` 
            : `With ${companionInfo?.title} (${companionType})`
          }
        </p>
      </div>

      {/* Anonymous Toggle */}
      <div className="flex items-center justify-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
        <button
          onClick={() => setIsAnonymous(!isAnonymous)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
        >
          {isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {language === 'ko' 
            ? isAnonymous ? '익명 평가' : '실명 평가'
            : isAnonymous ? 'Anonymous' : 'Not Anonymous'
          }
        </button>
      </div>

      {/* Rating Categories */}
      <div className="space-y-6 mb-8">
        {ratingCategories.map(category => (
          <div key={category.key} className="space-y-2">
            <div>
              <h4 className="font-medium text-gray-800">
                {language === 'ko' ? category.name_ko : category.name}
              </h4>
              <p className="text-sm text-gray-600">
                {language === 'ko' ? category.description_ko : category.description}
              </p>
            </div>
            
            {/* Star Rating */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleRatingChange(category.key, star)}
                  className="transition-all"
                >
                  <Star
                    className={`w-8 h-8 ${
                      ratings[category.key] >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 hover:text-amber-300'
                    }`}
                  />
                </button>
              ))}
              <button
                onClick={() => setShowComments(prev => ({ 
                  ...prev, 
                  [category.key]: !prev[category.key] 
                }))}
                className="ml-2 p-1.5 rounded hover:bg-gray-100"
              >
                <MessageSquare className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Comment Field */}
            {showComments[category.key] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-2"
              >
                <textarea
                  value={comments[`${category.key}_comment`] || ''}
                  onChange={(e) => handleCommentChange(category.key, e.target.value)}
                  placeholder={language === 'ko' ? '추가 코멘트 (선택사항)' : 'Additional comment (optional)'}
                  className="w-full p-2 text-sm border rounded-lg resize-none"
                  rows={2}
                />
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Feedback */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'ko' ? '좋았던 점' : 'Highlights'}
          </label>
          <textarea
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
            placeholder={language === 'ko' 
              ? '함께 전시를 보면서 좋았던 점을 공유해주세요' 
              : 'Share what you enjoyed about viewing together'
            }
            className="w-full p-3 border rounded-lg resize-none"
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'ko' ? '개선할 점' : 'Areas for Improvement'}
          </label>
          <textarea
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            placeholder={language === 'ko' 
              ? '더 나은 경험을 위한 건설적인 피드백' 
              : 'Constructive feedback for better experiences'
            }
            className="w-full p-3 border rounded-lg resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Would Go Again */}
      <div className="mb-8 p-4 bg-amber-50 rounded-lg">
        <p className="text-center font-medium text-gray-800 mb-3">
          {language === 'ko' 
            ? '이 분과 다시 전시를 보러 가고 싶으신가요?' 
            : 'Would you like to visit exhibitions with them again?'
          }
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setWouldGoAgain(true)}
            className={`px-6 py-2 rounded-full transition-all ${
              wouldGoAgain === true
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {language === 'ko' ? '네!' : 'Yes!'}
          </button>
          <button
            onClick={() => setWouldGoAgain(false)}
            className={`px-6 py-2 rounded-full transition-all ${
              wouldGoAgain === false
                ? 'bg-gray-500 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {language === 'ko' ? '아니요' : 'No'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          {language === 'ko' ? '나중에' : 'Later'}
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          <Send className="w-4 h-4 mr-2" />
          {language === 'ko' ? '평가 제출' : 'Submit Evaluation'}
        </Button>
      </div>
    </motion.div>
  );
}