'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, Filter, Grid, List, Heart, Users, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { personalityAnimals } from '@/data/personality-animals';
import { EmotionalCard } from '@/components/emotional/EmotionalCard';
import '@/styles/emotional-palette.css';

type ViewMode = 'grid' | 'list';
type FilterDimension = 'all' | 'L' | 'S' | 'A' | 'R' | 'E' | 'M' | 'F' | 'C';

export default function PersonalityTypesPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDimension, setFilterDimension] = useState<FilterDimension>('all');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Filter types based on search and dimension
  const filteredTypes = Object.entries(personalityDescriptions).filter(([key, desc]) => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      key.toLowerCase().includes(searchLower) ||
      desc.title.toLowerCase().includes(searchLower) ||
      (desc.title_ko && desc.title_ko.includes(searchTerm)) ||
      desc.subtitle.toLowerCase().includes(searchLower) ||
      (desc.subtitle_ko && desc.subtitle_ko.includes(searchTerm));
    
    // Dimension filter
    const matchesDimension = filterDimension === 'all' || key.includes(filterDimension);
    
    return matchesSearch && matchesDimension;
  });

  // Group by first dimension for better organization
  const groupedTypes = {
    L: filteredTypes.filter(([key]) => key.startsWith('L')),
    S: filteredTypes.filter(([key]) => key.startsWith('S'))
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--gallery-pearl))] via-[hsl(var(--gallery-white))] to-[hsl(var(--journey-dawn-cream))]">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle variant="glass" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Users className="w-16 h-16 mx-auto mb-6 text-[hsl(var(--journey-amber))]" />
          <h1 className="text-4xl md:text-5xl font-serif mb-4 text-[hsl(var(--journey-midnight))]">
            {language === 'ko' ? 'SAYU 16가지 예술 성격 유형' : 'SAYU 16 Art Personality Types'}
          </h1>
          <p className="text-xl text-[hsl(var(--journey-twilight))] opacity-80 max-w-3xl mx-auto">
            {language === 'ko' 
              ? '각 유형만의 독특한 예술 감상 방식을 발견해보세요' 
              : 'Discover each type\'s unique way of experiencing art'
            }
          </p>
        </motion.div>

        {/* Controls */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={language === 'ko' ? '유형 검색...' : 'Search types...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--journey-twilight))]"
            />
          </div>

          {/* Filters and View Mode */}
          <div className="flex flex-wrap justify-center gap-4">
            {/* Dimension Filters */}
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
              <Filter className="w-4 h-4 text-gray-600" />
              {(['all', 'L', 'S', 'A', 'R', 'E', 'M', 'F', 'C'] as FilterDimension[]).map(dim => (
                <button
                  key={dim}
                  onClick={() => setFilterDimension(dim)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    filterDimension === dim 
                      ? 'bg-[hsl(var(--journey-twilight))] text-white' 
                      : 'hover:bg-gray-200'
                  }`}
                >
                  {dim === 'all' ? (language === 'ko' ? '전체' : 'All') : dim}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all ${
                  viewMode === 'grid' ? 'bg-[hsl(var(--journey-twilight))] text-white' : ''
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all ${
                  viewMode === 'list' ? 'bg-[hsl(var(--journey-twilight))] text-white' : ''
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dimension Legend */}
        <div className="mb-8 p-6 bg-white/50 backdrop-blur-sm rounded-2xl max-w-4xl mx-auto">
          <h3 className="text-lg font-medium mb-4 text-center">
            {language === 'ko' ? '4가지 차원' : '4 Dimensions'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-bold">L/S:</span> {language === 'ko' ? '고독한 (개별적, 내성적) / 사교적 (상호작용, 협력적)' : 'Lone (Individual, introspective) / Social (Interactive, collaborative)'}
            </div>
            <div>
              <span className="font-bold">A/R:</span> {language === 'ko' ? '추상 (분위기적, 상징적) / 구상 (현실적, 구체적)' : 'Abstract (Atmospheric, symbolic) / Representational (Realistic, concrete)'}
            </div>
            <div>
              <span className="font-bold">E/M:</span> {language === 'ko' ? '감정적 (정서적, 감정기반) / 의미추구 (분석적, 이성적)' : 'Emotional (Affective, feeling-based) / Meaning-driven (Analytical, rational)'}
            </div>
            <div>
              <span className="font-bold">F/C:</span> {language === 'ko' ? '흐름 (유동적, 자발적) / 구조적 (체계적, 조직적)' : 'Flow (Fluid, spontaneous) / Constructive (Structured, systematic)'}
            </div>
          </div>
        </div>

        {/* Types Display */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="space-y-12">
            {Object.entries(groupedTypes).map(([dimension, types]) => (
              types.length > 0 && (
                <div key={dimension}>
                  <h2 className="text-2xl font-serif mb-6 text-[hsl(var(--journey-midnight))]">
                    {dimension === 'L' 
                      ? (language === 'ko' ? '고독한 감상자들' : 'Lone Appreciators')
                      : (language === 'ko' ? '사교적 감상자들' : 'Social Appreciators')
                    }
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {types.map(([key, desc], index) => {
                      const animal = personalityAnimals[key];
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <EmotionalCard
                            personality={key}
                            className="h-full cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => router.push(`/results?type=${key}`)}
                          >
                            <div className="text-center p-6">
                              {/* Animal Emoji */}
                              <div className="text-5xl mb-4">{animal?.emoji}</div>
                              
                              {/* Type Code */}
                              <div className="font-mono text-lg font-bold mb-2 text-[hsl(var(--journey-midnight))]">
                                {key}
                              </div>
                              
                              {/* Title */}
                              <h3 className="text-lg font-medium mb-2">
                                {language === 'ko' && desc.title_ko ? desc.title_ko : desc.title}
                              </h3>
                              
                              {/* Animal Name */}
                              <p className="text-sm opacity-70 mb-4">
                                {language === 'ko' ? animal?.animal_ko : animal?.animal}
                              </p>
                              
                              {/* Subtitle */}
                              <p className="text-sm italic opacity-80">
                                {language === 'ko' && desc.subtitle_ko ? desc.subtitle_ko : desc.subtitle}
                              </p>
                            </div>
                            
                            {/* Hover Actions */}
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/compatibility?type1=${key}`);
                                }}
                                className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                              >
                                <Heart className="w-4 h-4" />
                              </button>
                            </div>
                          </EmotionalCard>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4 max-w-4xl mx-auto">
            {filteredTypes.map(([key, desc], index) => {
              const animal = personalityAnimals[key];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <EmotionalCard
                    personality={key}
                    className="cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => router.push(`/results?type=${key}`)}
                  >
                    <div className="flex items-center gap-6 p-6">
                      {/* Animal Emoji */}
                      <div className="text-5xl">{animal?.emoji}</div>
                      
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className="font-mono text-xl font-bold text-[hsl(var(--journey-midnight))]">
                            {key}
                          </span>
                          <h3 className="text-xl font-medium">
                            {language === 'ko' && desc.title_ko ? desc.title_ko : desc.title}
                          </h3>
                          <span className="text-sm opacity-70">
                            ({language === 'ko' ? animal?.animal_ko : animal?.animal})
                          </span>
                        </div>
                        <p className="text-sm italic opacity-80 mb-3">
                          {language === 'ko' && desc.subtitle_ko ? desc.subtitle_ko : desc.subtitle}
                        </p>
                        <p className="text-sm opacity-70 line-clamp-2">
                          {language === 'ko' && desc.essence_ko ? desc.essence_ko : desc.essence}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/compatibility?type1=${key}`);
                          }}
                          className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </EmotionalCard>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredTypes.length === 0 && (
          <div className="text-center py-20">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">
              {language === 'ko' ? '검색 결과가 없습니다' : 'No types found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}