'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { personalityGradients } from '@/constants/personality-gradients';

interface PersonalityDimension {
  name: { en: string; ko: string };
  left: { code: string; label: { en: string; ko: string } };
  right: { code: string; label: { en: string; ko: string } };
  description: { en: string; ko: string };
  position: 'left' | 'right';
}

interface PersonalityTypeGridProps {
  currentType: string;
  dimensions?: PersonalityDimension[];
}

const defaultDimensions: PersonalityDimension[] = [
  {
    name: { en: 'Location Preference', ko: '장소 선호도' },
    left: { code: 'L', label: { en: 'Local', ko: '로컬' } },
    right: { code: 'T', label: { en: 'Traveler', ko: '여행자' } },
    description: { 
      en: 'Do you prefer familiar local galleries or exploring new museums?',
      ko: '익숙한 로컬 갤러리를 선호하나요, 아니면 새로운 미술관 탐험을 좋아하나요?'
    },
    position: 'left'
  },
  {
    name: { en: 'Art Approach', ko: '예술 접근법' },
    left: { code: 'A', label: { en: 'Analytical', ko: '분석적' } },
    right: { code: 'I', label: { en: 'Intuitive', ko: '직관적' } },
    description: { 
      en: 'Do you analyze artworks intellectually or experience them emotionally?',
      ko: '작품을 지적으로 분석하나요, 아니면 감정적으로 경험하나요?'
    },
    position: 'left'
  },
  {
    name: { en: 'Social Style', ko: '사회적 스타일' },
    left: { code: 'E', label: { en: 'Engaging', ko: '참여적' } },
    right: { code: 'O', label: { en: 'Observing', ko: '관찰적' } },
    description: { 
      en: 'Do you actively engage with art communities or quietly observe?',
      ko: '예술 커뮤니티에 적극적으로 참여하나요, 아니면 조용히 관찰하나요?'
    },
    position: 'left'
  },
  {
    name: { en: 'Experience Style', ko: '경험 스타일' },
    left: { code: 'F', label: { en: 'Flowing', ko: '유동적' } },
    right: { code: 'S', label: { en: 'Structured', ko: '구조적' } },
    description: { 
      en: 'Do you prefer spontaneous art discoveries or planned museum visits?',
      ko: '즉흥적인 예술 발견을 선호하나요, 아니면 계획된 미술관 방문을 좋아하나요?'
    },
    position: 'left'
  }
];

export default function PersonalityTypeGrid({ 
  currentType, 
  dimensions = defaultDimensions 
}: PersonalityTypeGridProps) {
  const { language } = useLanguage();
  
  // Parse current type to get positions
  const typePositions = currentType.split('').reduce((acc, char, index) => {
    const dimension = dimensions[index];
    if (dimension) {
      acc[index] = char === dimension.left.code ? 'left' : 'right';
    }
    return acc;
  }, {} as Record<number, 'left' | 'right'>);
  
  // Get all 16 types
  const allTypes = Object.keys(personalityGradients);
  
  return (
    <div className="space-y-8">
      {/* Dimensions Breakdown */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8">
        <h3 className="text-2xl font-bold text-white mb-6">
          {language === 'ko' ? '당신의 성향 분석' : 'Your Personality Analysis'}
        </h3>
        
        <div className="space-y-6">
          {dimensions.map((dimension, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold text-white/90">
                  {dimension.name[language]}
                </h4>
                <span className="text-2xl font-bold text-white">
                  {typePositions[index] === 'left' ? dimension.left.code : dimension.right.code}
                </span>
              </div>
              
              <div className="relative h-8 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: typePositions[index] === 'left' ? '30%' : '70%',
                    x: typePositions[index] === 'left' ? '0%' : '0%'
                  }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                />
                
                <div className="absolute inset-0 flex justify-between items-center px-4 text-sm">
                  <span className={`font-medium ${typePositions[index] === 'left' ? 'text-white' : 'text-white/60'}`}>
                    {dimension.left.label[language]}
                  </span>
                  <span className={`font-medium ${typePositions[index] === 'right' ? 'text-white' : 'text-white/60'}`}>
                    {dimension.right.label[language]}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-white/70">
                {dimension.description[language]}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* All 16 Types Grid */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8">
        <h3 className="text-2xl font-bold text-white mb-6">
          {language === 'ko' ? '16가지 성격 유형' : 'All 16 Personality Types'}
        </h3>
        
        <div className="grid grid-cols-4 gap-3">
          {allTypes.map((type) => {
            const gradient = personalityGradients[type as keyof typeof personalityGradients];
            const isCurrentType = type === currentType;
            
            return (
              <motion.div
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative rounded-lg p-3 text-center cursor-pointer transition-all ${
                  isCurrentType 
                    ? 'ring-4 ring-white/50 shadow-lg' 
                    : 'hover:ring-2 hover:ring-white/30'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${gradient.colors.join(', ')})`,
                  opacity: isCurrentType ? 1 : 0.7
                }}
              >
                <div className="text-white">
                  <div className="font-bold text-lg">{type}</div>
                  <div className="text-xs opacity-80 mt-1">
                    {language === 'ko' ? gradient.name : gradient.nameEn}
                  </div>
                </div>
                
                {isCurrentType && (
                  <motion.div
                    className="absolute -top-2 -right-2 bg-white text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
        
        <p className="text-sm text-white/70 mt-4 text-center">
          {language === 'ko' 
            ? '각 유형은 4가지 차원의 조합으로 만들어집니다' 
            : 'Each type is created by combining 4 dimensions'
          }
        </p>
      </div>
    </div>
  );
}