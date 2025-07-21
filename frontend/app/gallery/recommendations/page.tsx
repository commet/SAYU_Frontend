'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, Palette, Brain, Shuffle, Filter, Info, ExternalLink, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import databaseRecommendationService, { 
  DatabaseArtwork, 
  RecommendationResponse, 
  RecommendationStats 
} from '@/lib/databaseRecommendations';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

const personalityTypes = [
  { value: 'LAEF', label: '몽상가 (LAEF)', description: '감성적이고 자유로운 예술 애호가' },
  { value: 'LAEC', label: '직관적 분석가 (LAEC)', description: '감성적이고 체계적인 예술 애호가' },
  { value: 'LREF', label: '감정적 순수주의자 (LREF)', description: '현실적이고 감성적인 예술 애호가' },
  { value: 'LREC', label: '체계적 감정가 (LREC)', description: '현실적이고 체계적인 예술 애호가' },
  { value: 'SAEF', label: '사회적 몽상가 (SAEF)', description: '사교적이고 감성적인 예술 탐험가' },
  { value: 'SREF', label: '진정한 연결자 (SREF)', description: '사교적이고 현실적인 예술 탐험가' },
  { value: 'SRMC', label: '체계적 강연자 (SRMC)', description: '사교적이고 체계적인 예술 탐험가' }
];

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<DatabaseArtwork[]>([]);
  const [stats, setStats] = useState<RecommendationStats | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendationReason, setRecommendationReason] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 페이지 로드 시 자동으로 추천 불러오기
  useEffect(() => {
    loadAutoRecommendations();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await databaseRecommendationService.getRecommendationStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadAutoRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await databaseRecommendationService.getAutoRecommendations(12);
      setRecommendations(response.recommendations);
      setRecommendationReason(response.recommendationReason);
      setSelectedPersonality(response.personalityType);
      
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setError('추천 작품을 불러오는데 실패했습니다.');
      toast.error('추천 작품을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalityRecommendations = async (personalityType: string) => {
    if (!personalityType) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await databaseRecommendationService.getPersonalityRecommendations(personalityType, 12);
      setRecommendations(response.recommendations);
      setRecommendationReason(response.recommendationReason);
      
    } catch (error) {
      console.error('Failed to load personality recommendations:', error);
      setError('성격 유형별 추천을 불러오는데 실패했습니다.');
      toast.error('성격 유형별 추천을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalityChange = (personalityType: string) => {
    setSelectedPersonality(personalityType);
    if (personalityType === 'auto') {
      loadAutoRecommendations();
    } else {
      loadPersonalityRecommendations(personalityType);
    }
  };

  const shuffleRecommendations = () => {
    if (selectedPersonality && selectedPersonality !== 'auto') {
      loadPersonalityRecommendations(selectedPersonality);
    } else {
      loadAutoRecommendations();
    }
    toast.success('새로운 추천 작품을 불러왔습니다!');
  };

  const formatArtwork = (artwork: DatabaseArtwork) => {
    return databaseRecommendationService.formatArtworkForDisplay(artwork);
  };

  const getPersonalityInfo = (type: string) => {
    return personalityTypes.find(p => p.value === type) || { label: type, description: '자동 감지된 성격 유형' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🎨 맞춤 작품 추천
          </h1>
          <p className="text-xl text-white/80">
            당신의 성격 유형에 맞는 특별한 작품들을 만나보세요
          </p>
        </motion.div>

        {/* Stats Card */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  컬렉션 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats.stats.total_artworks.toLocaleString()}</div>
                    <div className="text-white/70 text-sm">총 작품 수</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats.stats.unique_artists.toLocaleString()}</div>
                    <div className="text-white/70 text-sm">작가 수</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats.stats.unique_institutions.toLocaleString()}</div>
                    <div className="text-white/70 text-sm">기관 수</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats.stats.unique_styles.toLocaleString()}</div>
                    <div className="text-white/70 text-sm">스타일 수</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5" />
                추천 설정
              </CardTitle>
              {recommendationReason && (
                <CardDescription className="text-white/80">
                  {recommendationReason}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <Select value={selectedPersonality} onValueChange={handlePersonalityChange}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue placeholder="성격 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">🎯 자동 감지</SelectItem>
                      {personalityTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  onClick={shuffleRecommendations}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  새로운 추천
                </Button>

                <div className="flex bg-white/20 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="bg-transparent"
                  >
                    격자
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="bg-transparent"
                  >
                    목록
                  </Button>
                </div>
              </div>

              {selectedPersonality && selectedPersonality !== 'auto' && (
                <div className="mt-4 p-4 bg-white/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-purple-300" />
                    <span className="text-purple-300 font-medium">선택된 성격 유형</span>
                  </div>
                  <div className="text-white">
                    <div className="font-semibold">{getPersonalityInfo(selectedPersonality).label}</div>
                    <div className="text-white/80 text-sm">{getPersonalityInfo(selectedPersonality).description}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">맞춤 추천을 준비하고 있습니다...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">오류가 발생했습니다</h2>
            <p className="text-white/80 mb-8">{error}</p>
            <Button onClick={loadAutoRecommendations} className="bg-purple-600 hover:bg-purple-700">
              다시 시도
            </Button>
          </div>
        )}

        {/* Recommendations Grid */}
        {!loading && !error && recommendations.length > 0 && (
          <AnimatePresence>
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {recommendations.map((artwork, index) => {
                const formattedArtwork = formatArtwork(artwork);
                return (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: viewMode === 'grid' ? 1.03 : 1.01 }}
                  >
                    <Card className="bg-white/10 backdrop-blur-sm border-white/20 overflow-hidden group">
                      {viewMode === 'grid' ? (
                        <>
                          {/* Image */}
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={formattedArtwork.imageUrl}
                              alt={formattedArtwork.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-artwork.jpg';
                              }}
                            />
                            {artwork.recommendationScore && (
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-purple-600 text-white flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  {artwork.recommendationScore.toFixed(1)}
                                </Badge>
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <CardContent className="p-4">
                            <h3 className="text-white font-semibold mb-1 line-clamp-2">
                              {formattedArtwork.title}
                            </h3>
                            <p className="text-white/70 text-sm mb-2">
                              {formattedArtwork.artist}
                            </p>
                            {formattedArtwork.year && (
                              <p className="text-white/60 text-xs mb-2">
                                {formattedArtwork.year}
                              </p>
                            )}
                            
                            {/* Matching Factors */}
                            {artwork.matchingFactors && artwork.matchingFactors.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {artwork.matchingFactors.slice(0, 2).map((factor, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs bg-white/20 text-white/80">
                                    {factor}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Stats */}
                            <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {formattedArtwork.stats.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {formattedArtwork.stats.likes}
                              </span>
                            </div>

                            {/* Source Link */}
                            {formattedArtwork.sourceUrl && (
                              <Button
                                asChild
                                size="sm"
                                className="w-full bg-purple-600 hover:bg-purple-700"
                              >
                                <Link href={formattedArtwork.sourceUrl} target="_blank">
                                  <ExternalLink className="w-3 h-3 mr-2" />
                                  원본 보기
                                </Link>
                              </Button>
                            )}
                          </CardContent>
                        </>
                      ) : (
                        // List view
                        <div className="flex gap-4 p-4">
                          <div className="relative w-20 h-20 flex-shrink-0">
                            <Image
                              src={formattedArtwork.thumbnailUrl}
                              alt={formattedArtwork.title}
                              fill
                              className="object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-artwork.jpg';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold mb-1">{formattedArtwork.title}</h3>
                            <p className="text-white/70 text-sm mb-1">{formattedArtwork.artist}</p>
                            <p className="text-white/60 text-xs mb-2">{formattedArtwork.institution}</p>
                            
                            {artwork.matchingFactors && artwork.matchingFactors.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {artwork.matchingFactors.slice(0, 3).map((factor, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs bg-white/20 text-white/80">
                                    {factor}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {artwork.recommendationScore && (
                              <Badge className="bg-purple-600 text-white">
                                {artwork.recommendationScore.toFixed(1)}
                              </Badge>
                            )}
                            {formattedArtwork.sourceUrl && (
                              <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
                                <Link href={formattedArtwork.sourceUrl} target="_blank">
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}

        {/* Empty State */}
        {!loading && !error && recommendations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-bold text-white mb-4">추천 작품을 준비중입니다</h2>
            <p className="text-white/80 mb-8">잠시 후 다시 시도해보세요</p>
            <Button onClick={loadAutoRecommendations} className="bg-purple-600 hover:bg-purple-700">
              추천 불러오기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}