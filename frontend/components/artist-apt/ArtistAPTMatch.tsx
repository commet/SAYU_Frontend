'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { artistAPTApi } from '@/lib/api/artist-apt';
import { APT_TYPES } from '@/types/artist-apt';
import type { APTMatchResult } from '@/types/artist-apt';
import { Heart, Sparkles, TrendingUp, Users } from 'lucide-react';

export function ArtistAPTMatch() {
  const [matches, setMatches] = useState<APTMatchResult[]>([]);
  const [userAPT, setUserAPT] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [compatibility, setCompatibility] = useState<any>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await artistAPTApi.getMatches(12);
      setMatches(data.matches);
      setUserAPT(data.userAPT);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCompatibility = async (artistId: string) => {
    try {
      setSelectedArtist(artistId);
      const result = await artistAPTApi.calculateCompatibility(artistId);
      setCompatibility(result);
    } catch (error) {
      console.error('Failed to check compatibility:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 사용자 APT 정보 */}
      {userAPT && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{userAPT.animal}</span>
              나의 APT 유형: {userAPT.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              당신과 예술적 성향이 비슷한 작가들을 찾았어요!
            </p>
          </CardContent>
        </Card>
      )}

      {/* 매칭된 작가들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {matches.map((artist, index) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => checkCompatibility(artist.id)}
              >
                {artist.imageUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={artist.imageUrl}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                      style={{
                        background: `linear-gradient(to top, ${artist.apt.color}80, transparent)`
                      }}
                    />
                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="text-white font-bold text-lg">{artist.name}</h3>
                      <p className="text-white/80 text-sm">
                        {artist.nationality} · {artist.era}
                      </p>
                    </div>
                  </div>
                )}
                
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge 
                      variant="secondary"
                      style={{ backgroundColor: `${artist.apt.color}20`, color: artist.apt.color }}
                    >
                      {artist.apt.animal} · {artist.apt.title}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">{artist.apt.matchScore}%</span>
                    </div>
                  </div>

                  {/* 차원별 점수 시각화 */}
                  <div className="space-y-2">
                    <DimensionBar 
                      label="작업 방식" 
                      left="독립적" 
                      right="사회적" 
                      value={artist.apt.dimensions.S} 
                    />
                    <DimensionBar 
                      label="표현 방식" 
                      left="추상적" 
                      right="구상적" 
                      value={artist.apt.dimensions.R} 
                    />
                  </div>

                  <Button 
                    className="w-full mt-4"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      checkCompatibility(artist.id);
                    }}
                  >
                    호환성 확인하기
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 호환성 모달 */}
      <AnimatePresence>
        {selectedArtist && compatibility && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setSelectedArtist(null);
              setCompatibility(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">호환성 분석 결과</h3>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {compatibility.overall}%
                </div>
                <p className="text-gray-600">{compatibility.recommendation}</p>
              </div>

              <div className="space-y-3">
                {Object.entries(compatibility.dimensions).map(([key, value]: [string, any]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{getDimensionLabel(key)}</span>
                      <span className="text-purple-600">{value.compatibility}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value.compatibility}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500">{value.interpretation}</p>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full mt-6"
                onClick={() => {
                  setSelectedArtist(null);
                  setCompatibility(null);
                }}
              >
                닫기
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 차원 표시 바 컴포넌트
function DimensionBar({ 
  label, 
  left, 
  right, 
  value 
}: { 
  label: string; 
  left: string; 
  right: string; 
  value: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="relative h-2 bg-gray-200 rounded-full">
        <div 
          className="absolute h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
          style={{ width: `${value}%` }}
        />
        <div className="flex justify-between text-xs mt-1">
          <span className="text-gray-400">{left}</span>
          <span className="text-gray-400">{right}</span>
        </div>
      </div>
    </div>
  );
}

// 차원 라벨 변환
function getDimensionLabel(key: string): string {
  const labels: Record<string, string> = {
    'L_S': '작업 방식',
    'A_R': '표현 방식',
    'E_M': '창작 동기',
    'F_C': '창작 과정'
  };
  return labels[key] || key;
}