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
import StylePreviewGrid from './StylePreviewGrid';
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
    if (!user) return;
    
    try {
      // API 추천 시도
      const recommendations = await artProfileAPI.getRecommendedStyles(user.auth.id);
      setRecommendedStyles(recommendations);
    } catch (error) {
      // 실패 시 성격 유형 기반 추천
      if (personalityType && personalityStyleMapping[personalityType]) {
        const mapping = personalityStyleMapping[personalityType];
        const recommended = predefinedStyles.filter(style => 
          mapping.recommendedStyles.includes(style.id)
        );
        setRecommendedStyles(recommended);
      } else {
        // 기본 추천
        setRecommendedStyles(predefinedStyles.slice(0, 3));
      }
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left: Image Preview */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="sayu-liquid-glass rounded-2xl p-6 sticky top-4"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'ko' ? '다시 선택' : 'Choose another'}
        </Button>

        <div className="relative overflow-hidden rounded-xl">
          <img 
            src={imagePreview} 
            alt="Your photo"
            className="w-full h-auto max-h-[400px] object-cover transition-all duration-300"
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
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {language === 'ko' ? '아트 프로필 만들기' : 'Create Art Profile'}
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
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>
                  {language === 'ko' 
                    ? '당신에게 맞는 스타일 추천' 
                    : 'Styles recommended for you'
                  }
                </span>
              </div>
              
              {personalityType && personalityStyleMapping[personalityType] && (
                <p className="text-xs text-gray-500 pl-6">
                  {personalityStyleMapping[personalityType].reason[language]}
                </p>
              )}
            </div>
            
            <StylePreviewGrid
              selectedStyle={selectedStyle}
              onStyleSelect={onStyleSelect}
              styles={recommendedStyles}
            />
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
            
            <StylePreviewGrid
              selectedStyle={selectedStyle}
              onStyleSelect={onStyleSelect}
              styles={predefinedStyles}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}