'use client';

import { motion } from 'framer-motion';
import PersonalityIconFixed from '@/components/PersonalityIconFixed';
import { useLanguage } from '@/contexts/LanguageContext';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { personalityAnimals } from '@/data/personality-animals';
import { completeChemistryMatrix } from '@/data/chemistry-matrix';
import { realExhibitionRecommendations } from '@/data/real-exhibition-recommendations';
import { getMasterpieceForAnyPersonality } from '@/data/personality-masterpieces';

interface LRMCResultCardProps {
  personalityType: string;
  scores?: Record<string, number>;
}

export default function LRMCResultCard({ personalityType, scores }: LRMCResultCardProps) {
  const { language } = useLanguage();
  const personality = personalityDescriptions[personalityType];
  const animal = personalityAnimals[personalityType];
  const masterpiece = getMasterpieceForAnyPersonality(personalityType);
  
  // 실제 전시 데이터 가져오기
  const realExhibition = realExhibitionRecommendations['LRMC'];
  const exhibitionRec = realExhibition ? 
    (language === 'ko' ? realExhibition.title_ko : realExhibition.title_en) : 
    (language === 'ko' ? '현대 미술전' : 'Contemporary Art');
  const exhibitionMuseum = realExhibition ?
    (language === 'ko' ? realExhibition.museum_ko : realExhibition.museum_en) :
    '';

  // 함께 가면 좋은 유형들 찾기
  const goodMatches = completeChemistryMatrix
    .filter(chem => 
      (chem.type1 === personalityType || chem.type2 === personalityType) &&
      (chem.compatibility === 'platinum' || chem.compatibility === 'gold')
    )
    .slice(0, 3)
    .map(chem => {
      const partnerType = chem.type1 === personalityType ? chem.type2 : chem.type1;
      const partnerAnimal = personalityAnimals[partnerType];
      const partnerPersonality = personalityDescriptions[partnerType];
      return {
        type: partnerType,
        emoji: partnerAnimal?.emoji || '🎨',
        name_ko: partnerPersonality?.title_ko || partnerType,
        name: partnerPersonality?.title || partnerType
      };
    });

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Background image */}
      <img 
        src={masterpiece.imageUrl}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
        crossOrigin="anonymous"
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />

      <div className="relative z-10 flex flex-col h-screen text-white p-8 md:p-16">
        {/* Top section - 동물 캐릭터 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mt-8 md:mt-16"
        >
          <div className="transform scale-[3] mb-12">
            <PersonalityIconFixed
              type={personalityType}
              size="small"
              animated={false}
            />
          </div>
          
          {/* LRMC */}
          <h1 className="font-black text-6xl md:text-7xl mb-2" 
            style={{ 
              textShadow: '3px 3px 6px rgba(0,0,0,0.9)',
              letterSpacing: '0.02em'
            }}
          >
            LRMC
          </h1>
          
          {/* 체계적 연구자 */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.9)' }}
          >
            {language === 'ko' ? '체계적 연구자' : 'Systematic Researcher'}
          </h2>
          
          {/* 부제목 */}
          <p className="text-base md:text-lg italic opacity-90 max-w-md"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
          >
            {language === 'ko' 
              ? '"체계적 연구로 포괄적 이해를 구축하는"' 
              : '"Building comprehensive understanding through systematic research"'}
          </p>
        </motion.div>

        {/* Middle section - 추천 내용 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex-1 flex flex-col justify-center items-center mt-12"
        >
          <div className="w-full max-w-lg space-y-4">
            {/* 추천 전시 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm font-semibold mb-2 opacity-90" 
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                ✨ {language === 'ko' ? '추천 전시' : 'Recommended Exhibition'}
              </div>
              <div className="text-base leading-tight opacity-90" 
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                <div className="font-semibold">{exhibitionRec}</div>
                {exhibitionMuseum && (
                  <div className="text-sm opacity-80 mt-1">{exhibitionMuseum}</div>
                )}
              </div>
            </div>

            {/* 함께 가면 좋은 유형 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm font-semibold mb-3 opacity-90"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                🤝 {language === 'ko' ? '함께 가면 좋은 유형' : 'Good Match Types'}
              </div>
              <div className="flex justify-center gap-4">
                {goodMatches.map((match, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-2xl mb-1">{match.emoji}</div>
                    <div className="text-xs opacity-80" 
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                    >
                      {language === 'ko' ? match.name_ko : match.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom section - Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center mb-8"
        >
          {/* Masterpiece 정보 */}
          <div className="opacity-50 mb-3 text-xs italic"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
          >
            {language === 'ko' 
              ? `${masterpiece.title_ko} - ${masterpiece.artist_ko}`
              : `${masterpiece.title} - ${masterpiece.artist}`
            }
          </div>
          
          <div className="pt-3 border-t border-white/20">
            {/* Call to action */}
            <div className="font-semibold text-lg mb-2"
              style={{ 
                textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                letterSpacing: '0.5px'
              }}
            >
              {language === 'ko' ? '나만의 예술 성격 발견하기' : 'Discover Your Art Personality'}
            </div>
            
            {/* Brand mark */}
            <div className="text-lg"
              style={{ 
                fontFamily: 'var(--font-cormorant), Georgia, serif',
                fontWeight: 300,
                textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                letterSpacing: '0.1em',
                opacity: 0.95
              }}
            >
              SAYU.MY
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}