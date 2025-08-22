'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { personalityGradients } from '@/constants/personality-gradients';
import { SAYUTypeCode, validateSAYUType } from '@/types/sayu-shared';

interface PersonalityDimension {
  name: { en: string; ko: string };
  left: { code: string; label: { en: string; ko: string } };
  right: { code: string; label: { en: string; ko: string } };
  description: { en: string; ko: string };
  position: 'left' | 'right';
}

interface PersonalityTypeGridProps {
  currentType: SAYUTypeCode;
  dimensions?: PersonalityDimension[];
}

const defaultDimensions: PersonalityDimension[] = [
  {
    name: { en: 'Viewing Preference', ko: '관람 선호도' },
    left: { code: 'L', label: { en: 'Lone (Individual, introspective)', ko: '고독한 (개별적, 내성적)' } },
    right: { code: 'S', label: { en: 'Social (Interactive, collaborative)', ko: '사교적 (상호작용, 협력적)' } },
    description: { 
      en: 'Do you prefer experiencing art alone or with others?',
      ko: '예술을 혼자 경험하는 것을 선호하나요, 아니면 다른 사람들과 함께 하나요?'
    },
    position: 'left'
  },
  {
    name: { en: 'Perception Style', ko: '인식 스타일' },
    left: { code: 'A', label: { en: 'Abstract (Atmospheric, symbolic)', ko: '추상 (분위기적, 상징적)' } },
    right: { code: 'R', label: { en: 'Representational (Realistic, concrete)', ko: '구상 (현실적, 구체적)' } },
    description: { 
      en: 'Do you prefer abstract or representational artworks?',
      ko: '추상적인 작품을 선호하나요, 아니면 구상적인 작품을 선호하나요?'
    },
    position: 'left'
  },
  {
    name: { en: 'Reflection Type', ko: '성찰 유형' },
    left: { code: 'E', label: { en: 'Emotional (Affective, feeling-based)', ko: '감정적 (정서적, 감정기반)' } },
    right: { code: 'M', label: { en: 'Meaning-driven (Analytical, rational)', ko: '의미추구 (분석적, 이성적)' } },
    description: { 
      en: 'Do you respond to art emotionally or analytically?',
      ko: '예술에 감정적으로 반응하나요, 아니면 분석적으로 접근하나요?'
    },
    position: 'left'
  },
  {
    name: { en: 'Exploration Style', ko: '탐색 스타일' },
    left: { code: 'F', label: { en: 'Flow (Fluid, spontaneous)', ko: '흐름 (유동적, 자발적)' } },
    right: { code: 'C', label: { en: 'Constructive (Structured, systematic)', ko: '구조적 (체계적, 조직적)' } },
    description: { 
      en: 'Do you explore galleries spontaneously or systematically?',
      ko: '갤러리를 자발적으로 탐색하나요, 아니면 체계적으로 관람하나요?'
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
    <div className="space-y-2">
      {/* Dimensions Breakdown - Compressed */}
      <div className="liquid-glass rounded-xl p-2 md:p-3">
        <h3 className="text-sm font-bold text-white mb-1.5">
          {language === 'ko' ? '당신의 성향 분석' : 'Your Personality Analysis'}
        </h3>
        
        <div className="space-y-1.5">
          {dimensions.map((dimension, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-0.5"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-medium text-white/90">
                  {dimension.name[language]}
                </h4>
                <span className="text-sm font-bold text-white">
                  {typePositions[index] === 'left' ? dimension.left.code : dimension.right.code}
                </span>
              </div>
              
              <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: typePositions[index] === 'left' ? '30%' : '70%',
                    x: typePositions[index] === 'left' ? '0%' : '0%'
                  }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                />
                
                <div className="absolute inset-0 flex justify-between items-center px-1.5 text-[9px] md:text-xs">
                  <span className={`font-medium whitespace-nowrap overflow-hidden text-ellipsis ${typePositions[index] === 'left' ? 'text-white' : 'text-white/60'}`}>
                    {dimension.left.label[language]}
                  </span>
                  <span className={`font-medium whitespace-nowrap overflow-hidden text-ellipsis ${typePositions[index] === 'right' ? 'text-white' : 'text-white/60'}`}>
                    {dimension.right.label[language]}
                  </span>
                </div>
              </div>
              
              {/* Removed description for compact view */}
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* All 16 Types Grid - Compressed */}
      <div className="liquid-glass rounded-xl p-2 md:p-3">
        <h3 className="text-sm font-bold text-white mb-2">
          {language === 'ko' ? '16가지 성격 유형' : 'All 16 Personality Types'}
        </h3>
        
        <div className="grid grid-cols-4 gap-2">
          {allTypes.map((type) => {
            if (!validateSAYUType(type)) {
              console.warn(`Invalid SAYU type encountered: ${type}`);
              return null;
            }
            const gradient = personalityGradients[type as SAYUTypeCode];
            const isCurrentType = type === currentType;
            
            return (
              <motion.div
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative rounded-lg p-2 text-center cursor-pointer transition-all glass ${
                  isCurrentType 
                    ? 'ring-3 ring-white/50 shadow-lg scale-105' 
                    : 'hover:ring-2 hover:ring-white/30'
                }`}
                style={{
                  background: isCurrentType 
                    ? `linear-gradient(135deg, ${gradient.colors.join(', ')})` 
                    : `linear-gradient(135deg, ${gradient.colors.map(c => c + '40').join(', ')})`
                }}
              >
                <div className="text-white">
                  <div className="font-bold text-xs">{type}</div>
                  <div className="text-[9px] opacity-80 break-words text-center leading-tight">
                    {language === 'ko' ? gradient.name : gradient.nameEn}
                  </div>
                </div>
                
                {isCurrentType && (
                  <motion.div
                    className="absolute -top-1 -right-1 bg-white text-purple-600 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold"
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
        
        <p className="text-xs text-white/70 mt-2 text-center">
          {language === 'ko' 
            ? '각 유형은 4가지 차원의 조합으로 만들어집니다' 
            : 'Each type is created by combining 4 dimensions'
          }
        </p>
      </div>
    </div>
  );
}