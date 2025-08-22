'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Palette } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArtStyle } from '@/types/art-profile';
import { predefinedStyles } from '@/data/art-styles';
import { Button } from '@/components/ui/button';
import { artProfileAPI } from '@/lib/art-profile-api';
import { useAuth } from '@/hooks/useAuth';
import { personalityStyleMapping, stylePersonalityTraits } from '@/data/personality-style-mapping';
import StylePreviewGridFixed from './StylePreviewGridFixed';
import { styleFilters } from '@/data/style-filters';

interface StyleSelectorProps {
  imagePreview: string;
  onStyleSelect: (style: ArtStyle) => void;
  selectedStyle: ArtStyle | null;
  onBack: () => void;
  onGenerate: () => void;
  userPreferences?: any;
}

export default function StyleSelector({
  imagePreview,
  onStyleSelect,
  selectedStyle,
  onBack,
  onGenerate,
  userPreferences
}: StyleSelectorProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [recommendedStyles, setRecommendedStyles] = useState<ArtStyle[]>([]);
  const [activeTab, setActiveTab] = useState<'recommended' | 'all'>('recommended');
  const [personalityType, setPersonalityType] = useState<string | null>(null);
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendedStyles();
    loadPersonalityType();
  }, [user]);

  const getStyleFilter = (styleId: string): string => {
    return styleFilters[styleId as keyof typeof styleFilters]?.filter || 'none';
  };

  const loadPersonalityType = () => {
    const quizResults = localStorage.getItem('quizResults');
    if (quizResults) {
      const results = JSON.parse(quizResults);
      setPersonalityType(results.personalityType);
    }
  };

  const loadRecommendedStyles = async () => {
    // 1. 먼저 localStorage에서 성격 유형 확인
    const quizResults = localStorage.getItem('quizResults');
    let aptType = personalityType;
    
    if (quizResults && !aptType) {
      const results = JSON.parse(quizResults);
      aptType = results.personalityType;
      setPersonalityType(aptType);
    }
    
    // 2. 사용자 프로필에서도 확인
    if (!aptType && user?.personalityType) {
      aptType = user.personalityType;
      setPersonalityType(aptType);
    }
    
    // 3. 성격 유형에 따른 추천
    if (aptType && personalityStyleMapping[aptType]) {
      const mapping = personalityStyleMapping[aptType];
      const recommended = predefinedStyles.filter(style => 
        mapping.recommendedStyles.includes(style.id)
      );
      
      // 추천 이유 추가
      const enhancedRecommended = recommended.map(style => ({
        ...style,
        recommendationReason: mapping.reason,
        matchScore: calculateMatchScore(aptType, style.id)
      }));
      
      // 매치 점수로 정렬
      enhancedRecommended.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      
      setRecommendedStyles(enhancedRecommended);
    } else {
      // 기본 추천 (인기 스타일)
      const popularStyles = ['monet-impressionism', 'vangogh-postimpressionism', 'warhol-popart'];
      const defaultRecommended = predefinedStyles.filter(style => 
        popularStyles.includes(style.id)
      );
      setRecommendedStyles(defaultRecommended);
    }
  };

  // APT 성격과 스타일의 매치 점수 계산
  const calculateMatchScore = (aptType: string, styleId: string): number => {
    const mapping = personalityStyleMapping[aptType];
    if (!mapping) return 50;
    
    const recommendedIndex = mapping.recommendedStyles.indexOf(styleId);
    if (recommendedIndex === -1) return 40;
    
    // 첫 번째 추천: 100점, 두 번째: 85점, 세 번째: 70점
    return 100 - (recommendedIndex * 15);
  };

  // 스타일 선택 시 사용자 취향 저장
  const handleStyleSelect = (style: ArtStyle) => {
    onStyleSelect(style);
    
    // 로컬 스토리지에 사용자 취향 저장
    const preferences = JSON.parse(localStorage.getItem('artStylePreferences') || '{}');
    const styleHistory = preferences.selectedStyles || [];
    
    // 선택 기록 추가 (최대 10개)
    styleHistory.unshift({
      styleId: style.id,
      timestamp: new Date().toISOString(),
      aptType: personalityType
    });
    
    if (styleHistory.length > 10) {
      styleHistory.pop();
    }
    
    preferences.selectedStyles = styleHistory;
    preferences.lastUpdated = new Date().toISOString();
    
    localStorage.setItem('artStylePreferences', JSON.stringify(preferences));
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left: Image Preview */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="sayu-liquid-glass rounded-2xl p-4 md:sticky md:top-4 max-w-sm"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4 text-white hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2 text-white" />
          <span className="text-white">{language === 'ko' ? '다시 선택' : 'Choose another'}</span>
        </Button>

        <div className="relative overflow-hidden rounded-xl">
          <img 
            src={imagePreview} 
            alt="Your photo"
            className="w-full h-auto max-h-[250px] object-cover transition-all duration-300"
            style={{
              filter: selectedStyle ? getStyleFilter(selectedStyle.id) : 'none'
            }}
          />
          
          {selectedStyle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4"
            >
              <div className="text-white">
                <p className="text-sm opacity-80">{language === 'ko' ? '선택한 스타일' : 'Selected style'}</p>
                <p className="text-lg font-semibold">
                  {language === 'ko' ? selectedStyle.nameKo : selectedStyle.name}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {selectedStyle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Button
              onClick={onGenerate}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2 text-white" />
              <span className="text-white">{language === 'ko' ? '아트 프로필 만들기' : 'Create Art Profile'}</span>
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Right: Style Options */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'recommended' 
                ? 'bg-white shadow-sm font-medium' 
                : 'text-gray-600'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            {language === 'ko' ? 'AI 추천' : 'AI Picks'}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'all' 
                ? 'bg-white shadow-sm font-medium' 
                : 'text-gray-600'
            }`}
          >
            <Palette className="w-4 h-4 inline mr-2" />
            {language === 'ko' ? '모든 스타일' : 'All Styles'}
          </button>
        </div>

        {/* Recommended Styles */}
        {activeTab === 'recommended' && recommendedStyles.length > 0 && (
          <div className="space-y-4">
            {/* AI 추천 헤더 */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {personalityType ? (
                      <>
                        {language === 'ko' 
                          ? `${personalityType} 유형을 위한 맞춤 추천` 
                          : `Personalized for ${personalityType} type`
                        }
                      </>
                    ) : (
                      language === 'ko' ? 'AI 맞춤 추천' : 'AI Recommendations'
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed mt-2">
                    {personalityType && personalityStyleMapping[personalityType] ? (
                      personalityStyleMapping[personalityType].reason[language]
                    ) : (
                      language === 'ko' 
                        ? '당신의 성격 유형과 예술적 취향을 분석하여 가장 어울리는 스타일을 추천해드립니다.'
                        : 'We recommend styles that best match your personality type and artistic preferences.'
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* 스타일 그리드 with 매치 점수 */}
            <div className="space-y-3">
              {recommendedStyles.map((style, index) => (
                <motion.div
                  key={style.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleStyleSelect(style)}
                  onMouseEnter={() => setHoveredStyle(style.id)}
                  onMouseLeave={() => setHoveredStyle(null)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
                    selectedStyle?.id === style.id 
                      ? 'ring-2 ring-purple-500 shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="bg-white p-4 flex items-center gap-4">
                    {/* 스타일 프리뷰 */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={style.exampleImage || `/images/art-styles/${style.id}.jpg`} 
                        alt={style.name}
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                    </div>
                    
                    {/* 스타일 정보 */}
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">
                        {language === 'ko' ? style.nameKo : style.name}
                      </h5>
                      <p className="text-sm text-gray-600 mt-1">
                        {language === 'ko' ? style.descriptionKo : style.description}
                      </p>
                    </div>
                    
                    {/* 매치 점수 */}
                    {style.matchScore && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {style.matchScore}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {language === 'ko' ? '적합도' : 'Match'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 선택 인디케이터 */}
                  {selectedStyle?.id === style.id && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                        {language === 'ko' ? '선택됨' : 'Selected'}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* 피드백 섹션 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-3 bg-gray-50 rounded-lg text-center"
            >
              <p className="text-xs text-gray-600">
                {language === 'ko' 
                  ? '추천이 마음에 들지 않으신가요?' 
                  : "Not quite what you're looking for?"}
              </p>
              <button 
                onClick={() => setActiveTab('all')}
                className="text-xs text-purple-600 hover:text-purple-700 underline mt-1"
              >
                {language === 'ko' ? '모든 스타일 보기' : 'Browse all styles'}
              </button>
            </motion.div>
          </div>
        )}

        {/* All Styles */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Palette className="w-4 h-4 text-purple-500" />
              <span>
                {language === 'ko' 
                  ? '모든 스타일 보기' 
                  : 'All available styles'
                }
              </span>
            </div>
            
            <StylePreviewGridFixed
              selectedStyle={selectedStyle}
              onStyleSelect={handleStyleSelect}
              styles={predefinedStyles}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}