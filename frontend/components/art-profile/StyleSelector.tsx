'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Palette, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArtStyle, predefinedStyles } from '@/types/art-profile';
import { Button } from '@/components/ui/button';
import { artProfileAPI } from '@/lib/art-profile-api';
import { useAuth } from '@/hooks/useAuth';

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

  useEffect(() => {
    loadRecommendedStyles();
  }, [user]);

  const loadRecommendedStyles = async () => {
    if (!user) return;
    
    try {
      const recommendations = await artProfileAPI.getRecommendedStyles(user.id);
      setRecommendedStyles(recommendations);
    } catch (error) {
      // 에러 시 기본 추천 사용
      setRecommendedStyles(predefinedStyles.slice(0, 3));
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
            className="w-full h-auto max-h-[400px] object-cover"
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
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>
                {language === 'ko' 
                  ? '최근 관람하신 전시를 바탕으로 추천해드려요' 
                  : 'Based on your recent exhibitions'
                }
              </span>
            </div>
            
            {recommendedStyles.map((style) => (
              <StyleCard
                key={style.id}
                style={style}
                isSelected={selectedStyle?.id === style.id}
                onSelect={() => onStyleSelect(style)}
                language={language}
                isRecommended
              />
            ))}
          </div>
        )}

        {/* All Styles */}
        {activeTab === 'all' && (
          <div className="space-y-3">
            {predefinedStyles.map((style) => (
              <StyleCard
                key={style.id}
                style={style}
                isSelected={selectedStyle?.id === style.id}
                onSelect={() => onStyleSelect(style)}
                language={language}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Style Card Component
function StyleCard({ 
  style, 
  isSelected, 
  onSelect, 
  language,
  isRecommended = false 
}: {
  style: ArtStyle;
  isSelected: boolean;
  onSelect: () => void;
  language: 'ko' | 'en';
  isRecommended?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`
        cursor-pointer rounded-xl p-4 transition-all
        ${isSelected 
          ? 'sayu-liquid-glass border-2 border-purple-500 shadow-lg' 
          : 'bg-white hover:shadow-md border-2 border-transparent'
        }
      `}
    >
      <div className="flex items-center gap-4">
        {/* Style Preview */}
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {style.sample ? (
            <img 
              src={style.sample} 
              alt={style.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Palette className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Style Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold">
                {language === 'ko' ? style.nameKo : style.name}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {language === 'ko' ? style.descriptionKo : style.description}
              </p>
              {style.artist && (
                <p className="text-xs text-gray-500 mt-1">
                  {style.artist} • {style.movement}
                </p>
              )}
            </div>
            
            {isRecommended && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                {language === 'ko' ? '추천' : 'Recommended'}
              </span>
            )}
          </div>

          {/* Color Palette Preview */}
          {style.colorPalette && (
            <div className="flex gap-1 mt-2">
              {style.colorPalette.map((color, idx) => (
                <div
                  key={idx}
                  className="w-6 h-6 rounded-full border border-gray-200"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Selection Indicator */}
        <ChevronRight 
          className={`w-5 h-5 transition-opacity ${
            isSelected ? 'opacity-100 text-purple-600' : 'opacity-30'
          }`}
        />
      </div>
    </motion.div>
  );
}