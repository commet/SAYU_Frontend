'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ForumList } from '@/components/community/ForumList';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, Sparkles, Heart, Palette, Eye, Calendar, MapPin, ChevronRight, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { getAnimalByType } from '@/data/personality-animals';
import { PersonalityAnimalImage } from '@/components/ui/PersonalityAnimalImage';
import { chemistryData } from '@/data/personality-chemistry';
import { getArtworkRecommendations } from '@/lib/artworkRecommendations';
import { getExhibitionRecommendation } from '@/lib/exhibitionRecommendations';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface UserMatch {
  id: string;
  nickname: string;
  personalityType: string;
  compatibility: 'perfect' | 'good' | 'challenging' | 'learning';
  compatibilityScore: number;
  lastActive: string;
  exhibitions: number;
  artworks: number;
  avatar?: string;
}

interface ExhibitionMatch {
  id: string;
  title: string;
  museum: string;
  image: string;
  matchingUsers: number;
  endDate: string;
}

export default function CommunityPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'matches' | 'exhibitions' | 'forums'>('matches');
  const [selectedMatch, setSelectedMatch] = useState<UserMatch | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Mock data for user personality type (should come from user profile)
  const userPersonalityType = user.personalityType || 'LAEF';
  const userAnimal = getAnimalByType(userPersonalityType);

  // Find compatible users based on chemistry data
  const findCompatibleUsers = (): UserMatch[] => {
    const mockUsers: UserMatch[] = [
      {
        id: '1',
        nickname: '예술탐험가',
        personalityType: 'SAEF',
        compatibility: 'perfect',
        compatibilityScore: 95,
        lastActive: '2시간 전',
        exhibitions: 42,
        artworks: 156
      },
      {
        id: '2',
        nickname: '갤러리워커',
        personalityType: 'LAMF',
        compatibility: 'good',
        compatibilityScore: 78,
        lastActive: '1일 전',
        exhibitions: 28,
        artworks: 89
      },
      {
        id: '3',
        nickname: '미술관친구',
        personalityType: 'SRMF',
        compatibility: 'good',
        compatibilityScore: 72,
        lastActive: '3일 전',
        exhibitions: 67,
        artworks: 234
      },
      {
        id: '4',
        nickname: '아트러버',
        personalityType: 'LREC',
        compatibility: 'challenging',
        compatibilityScore: 45,
        lastActive: '방금 전',
        exhibitions: 15,
        artworks: 48
      }
    ];

    return mockUsers.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  };

  const compatibleUsers = findCompatibleUsers();

  // Mock exhibition matches
  const exhibitionMatches: ExhibitionMatch[] = [
    {
      id: '1',
      title: '모네의 정원',
      museum: '국립현대미술관',
      image: '/images/exhibitions/monet-garden.jpg',
      matchingUsers: 12,
      endDate: '2024.03.31'
    },
    {
      id: '2',
      title: '추상표현주의의 거장들',
      museum: '서울시립미술관',
      image: '/images/exhibitions/abstract-expressionism.jpg',
      matchingUsers: 8,
      endDate: '2024.04.15'
    }
  ];

  const getChemistryInfo = (type1: string, type2: string) => {
    return chemistryData.find(
      (c) => (c.type1 === type1 && c.type2 === type2) || (c.type1 === type2 && c.type2 === type1)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            {language === 'ko' ? '예술 동행자 찾기' : 'Find Art Companions'}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {language === 'ko' 
              ? '당신과 잘 맞는 예술 동행자를 만나고, 함께 전시를 즐겨보세요.'
              : 'Meet art companions who match your aesthetic preferences and enjoy exhibitions together.'}
          </p>
        </motion.div>

        {/* User Profile Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20"
        >
          <div className="flex items-center gap-4">
            {userAnimal && (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl">
                {userAnimal.emoji}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-1">
                {user.nickname || 'Explorer'}
              </h2>
              <p className="text-gray-300">
                {language === 'ko' 
                  ? `${userAnimal?.animal_ko} (${userPersonalityType}) - ${personalityDescriptions[userPersonalityType]?.title_ko}`
                  : `${userAnimal?.animal} (${userPersonalityType}) - ${personalityDescriptions[userPersonalityType]?.title}`}
              </p>
              <div className="flex gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {language === 'ko' ? '관람 23회' : '23 visits'}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {language === 'ko' ? '작품 87개' : '87 artworks'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'matches', label: language === 'ko' ? '추천 동행자' : 'Recommended Companions', icon: Users },
            { id: 'exhibitions', label: language === 'ko' ? '전시 매칭' : 'Exhibition Matching', icon: Calendar },
            { id: 'forums', label: language === 'ko' ? '커뮤니티 포럼' : 'Community Forums', icon: MessageSquare }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'matches' && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              {/* User List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">
                  {language === 'ko' ? '추천 예술 동행자' : 'Recommended Art Companions'}
                </h3>
                
                {compatibleUsers.map((match) => {
                  const matchAnimal = getAnimalByType(match.personalityType);
                  const chemistry = getChemistryInfo(userPersonalityType, match.personalityType);
                  
                  return (
                    <motion.div
                      key={match.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedMatch(match)}
                      className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 cursor-pointer hover:bg-white/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl">
                            {matchAnimal?.emoji || '🎨'}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            match.compatibility === 'perfect' ? 'bg-green-500' :
                            match.compatibility === 'good' ? 'bg-blue-500' :
                            match.compatibility === 'challenging' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          } text-white`}>
                            {match.compatibilityScore}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white">{match.nickname}</h4>
                            <span className="text-xs text-gray-400">{match.lastActive}</span>
                          </div>
                          <p className="text-sm text-gray-300 mb-2">
                            {matchAnimal?.animal_ko} ({match.personalityType})
                            {chemistry && ` - ${language === 'ko' ? chemistry.title_ko : chemistry.title}`}
                          </p>
                          <div className="flex gap-4 text-xs text-gray-400">
                            <span>{language === 'ko' ? `전시 ${match.exhibitions}회` : `${match.exhibitions} exhibitions`}</span>
                            <span>{language === 'ko' ? `작품 ${match.artworks}개` : `${match.artworks} artworks`}</span>
                          </div>
                        </div>
                        
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Selected Match Detail */}
              <div className="lg:col-span-1">
                {selectedMatch ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 sticky top-4"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {language === 'ko' ? '호환성 분석' : 'Compatibility Analysis'}
                    </h3>
                    
                    {(() => {
                      const chemistry = getChemistryInfo(userPersonalityType, selectedMatch.personalityType);
                      const matchAnimal = getAnimalByType(selectedMatch.personalityType);
                      
                      return (
                        <>
                          <div className="text-center mb-6">
                            <div className="flex justify-center items-center gap-4 mb-4">
                              <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl mb-1">
                                  {userAnimal?.emoji}
                                </div>
                                <p className="text-xs text-gray-400">{language === 'ko' ? '나' : 'You'}</p>
                              </div>
                              <div className="text-3xl">💫</div>
                              <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-2xl mb-1">
                                  {matchAnimal?.emoji}
                                </div>
                                <p className="text-xs text-gray-400">{selectedMatch.nickname}</p>
                              </div>
                            </div>
                            
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                              selectedMatch.compatibility === 'perfect' ? 'bg-green-500/20 text-green-300' :
                              selectedMatch.compatibility === 'good' ? 'bg-blue-500/20 text-blue-300' :
                              selectedMatch.compatibility === 'challenging' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                              <Heart className="w-4 h-4" />
                              {selectedMatch.compatibilityScore}% {language === 'ko' ? '호환성' : 'Compatible'}
                            </div>
                          </div>

                          {chemistry && (
                            <>
                              <div className="mb-6">
                                <h4 className="text-sm font-semibold text-white mb-2">
                                  {language === 'ko' ? '시너지' : 'Synergy'}
                                </h4>
                                <p className="text-sm text-gray-300">
                                  {language === 'ko' ? chemistry.synergy.description_ko : chemistry.synergy.description}
                                </p>
                              </div>

                              <div className="mb-6">
                                <h4 className="text-sm font-semibold text-white mb-2">
                                  {language === 'ko' ? '추천 전시' : 'Recommended Exhibitions'}
                                </h4>
                                <div className="space-y-2">
                                  {(language === 'ko' ? chemistry.recommendedExhibitions_ko : chemistry.recommendedExhibitions).slice(0, 3).map((exhibition, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                                      <Palette className="w-4 h-4 text-purple-400" />
                                      {exhibition}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-purple-500/20 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                  <Info className="w-4 h-4 text-purple-300 mt-0.5" />
                                  <div className="text-sm">
                                    <p className="text-purple-300 font-medium mb-1">
                                      {language === 'ko' ? '관람 팁' : 'Viewing Tip'}
                                    </p>
                                    <p className="text-gray-300">
                                      {language === 'ko' ? chemistry.tips.for_type1_ko : chemistry.tips.for_type1}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          <button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 font-semibold transition-colors">
                            {language === 'ko' ? '메시지 보내기' : 'Send Message'}
                          </button>
                        </>
                      );
                    })()}
                  </motion.div>
                ) : (
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">
                      {language === 'ko' 
                        ? '동행자를 선택하여 자세한 호환성을 확인하세요'
                        : 'Select a companion to see detailed compatibility'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'exhibitions' && (
            <motion.div
              key="exhibitions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                {language === 'ko' ? '함께 가면 좋은 전시' : 'Exhibitions to Visit Together'}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {exhibitionMatches.map((exhibition) => (
                  <motion.div
                    key={exhibition.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20"
                  >
                    <div className="relative h-48">
                      <OptimizedImage
                        src={exhibition.image}
                        alt={exhibition.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="text-lg font-semibold text-white mb-1">{exhibition.title}</h4>
                        <p className="text-sm text-gray-300">{exhibition.museum}</p>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <MapPin className="w-4 h-4" />
                          {language === 'ko' ? `${exhibition.endDate}까지` : `Until ${exhibition.endDate}`}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-purple-300">
                          <Users className="w-4 h-4" />
                          {language === 'ko' ? `${exhibition.matchingUsers}명 관심` : `${exhibition.matchingUsers} interested`}
                        </div>
                      </div>
                      
                      <button className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg py-2 font-medium transition-colors">
                        {language === 'ko' ? '동행자 찾기' : 'Find Companions'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'forums' && (
            <motion.div
              key="forums"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {language === 'ko' ? '토론 포럼' : 'Discussion Forums'}
                  </h2>
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                    {language === 'ko' ? '주제 만들기' : 'Create Topic'}
                  </button>
                </div>
                
                <ForumList />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}