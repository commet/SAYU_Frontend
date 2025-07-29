'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle,
  Heart,
  Eye,
  Palette,
  Clock,
  Users,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PersonalityType } from '@sayu/shared';
import { APT_TO_ART_MOVEMENT } from '@/types/art-persona-matching';
import { ART_MOVEMENT_PROFILES, calculateMovementCompatibility } from '@/lib/art-movement-profiles';
import { InteractionPrompt } from '@/types/art-persona-matching';

interface MatchedUser {
  id: string;
  name: string;
  aptType: PersonalityType;
  avatar?: string;
  privacyLevel: number;
}

interface MatchedInteractionViewProps {
  user1: MatchedUser;
  user2: MatchedUser;
  sharedArtwork?: {
    id: string;
    title: string;
    artist: string;
    image: string;
  };
  interactions: InteractionPrompt[];
}

export function MatchedInteractionView({
  user1,
  user2,
  sharedArtwork,
  interactions
}: MatchedInteractionViewProps) {
  const [compatibilityScore, setCompatibilityScore] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  
  // 두 사용자의 예술 사조
  const movement1 = APT_TO_ART_MOVEMENT[user1.aptType];
  const movement2 = APT_TO_ART_MOVEMENT[user2.aptType];
  const profile1 = ART_MOVEMENT_PROFILES[movement1];
  const profile2 = ART_MOVEMENT_PROFILES[movement2];
  
  // 호환성 점수 계산
  useEffect(() => {
    const score = calculateMovementCompatibility(movement1, movement2);
    setCompatibilityScore(Math.round(score));
  }, [movement1, movement2]);

  // 호환성 색상 결정
  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  // 공통 색상 팔레트 찾기
  const findSharedColors = () => {
    const colors1 = new Set(profile1.colorPalette);
    const colors2 = new Set(profile2.colorPalette);
    const shared: string[] = [];
    
    // 유사한 색상 찾기 (간단한 구현)
    profile1.colorPalette.forEach(color1 => {
      profile2.colorPalette.forEach(color2 => {
        if (color1 === color2 || areSimilarColors(color1, color2)) {
          shared.push(color1);
        }
      });
    });
    
    return shared.slice(0, 3);
  };

  // 색상 유사도 체크 (간단한 구현)
  const areSimilarColors = (color1: string, color2: string) => {
    // 실제로는 더 정교한 색상 비교 알고리즘 필요
    return false;
  };

  const sharedColors = findSharedColors();

  return (
    <Card className="p-6 glass-panel max-w-2xl mx-auto">
      {/* 매칭 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* 사용자 1 */}
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${profile1.colorPalette[0]}, ${profile1.colorPalette[1]})` 
              }}
            >
              {user1.avatar || '🎨'}
            </div>
            <p className="text-xs mt-1 font-medium">{profile1.koreanName}</p>
          </div>
          
          {/* 연결 표시 */}
          <div className="flex flex-col items-center gap-1">
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowRight className="w-6 h-6 text-primary" />
            </motion.div>
            <Badge 
              variant="secondary" 
              className={cn("text-xs", getCompatibilityColor(compatibilityScore))}
            >
              {compatibilityScore}% 매칭
            </Badge>
          </div>
          
          {/* 사용자 2 */}
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${profile2.colorPalette[0]}, ${profile2.colorPalette[1]})` 
              }}
            >
              {user2.avatar || '🎭'}
            </div>
            <p className="text-xs mt-1 font-medium">{profile2.koreanName}</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          <Eye className="w-4 h-4 mr-1" />
          상세보기
        </Button>
      </div>

      {/* 호환성 상세 정보 */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t">
              <div>
                <h4 className="text-sm font-medium mb-2">보완적 특성</h4>
                <div className="space-y-1">
                  {Math.abs(profile1.matchingTraits.social - profile2.matchingTraits.social) > 50 && (
                    <p className="text-xs text-muted-foreground">
                      • 혼자/함께 관람 스타일의 균형
                    </p>
                  )}
                  {Math.abs(profile1.matchingTraits.abstract - profile2.matchingTraits.abstract) > 40 && (
                    <p className="text-xs text-muted-foreground">
                      • 추상/구상 작품 선호의 다양성
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">공통 특성</h4>
                <div className="space-y-1">
                  {Math.abs(profile1.matchingTraits.emotional - profile2.matchingTraits.emotional) < 30 && (
                    <p className="text-xs text-muted-foreground">
                      • 비슷한 감정적 접근 방식
                    </p>
                  )}
                  {Math.abs(profile1.matchingTraits.structured - profile2.matchingTraits.structured) < 30 && (
                    <p className="text-xs text-muted-foreground">
                      • 유사한 관람 스타일
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 공유된 작품 */}
      {sharedArtwork && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            함께 감상한 작품
          </h4>
          <div className="flex gap-3 p-3 bg-secondary/20 rounded-lg">
            <img 
              src={sharedArtwork.image} 
              alt={sharedArtwork.title}
              className="w-20 h-20 object-cover rounded"
            />
            <div>
              <p className="font-medium text-sm">{sharedArtwork.title}</p>
              <p className="text-xs text-muted-foreground">{sharedArtwork.artist}</p>
            </div>
          </div>
        </div>
      )}

      {/* 최근 상호작용 */}
      {interactions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            나눈 대화
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {interactions.slice(-3).map((interaction, i) => (
              <motion.div
                key={interaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 bg-secondary/10 rounded-lg"
              >
                <p className="text-xs font-medium mb-1">{interaction.prompt}</p>
                <p className="text-sm text-muted-foreground">
                  {interaction.metadata?.response}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {new Date(interaction.createdAt).toLocaleTimeString('ko-KR')}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 색상 호환성 시각화 */}
      {sharedColors.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            색상 하모니
          </h4>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {profile1.colorPalette.slice(0, 3).map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="text-xs text-muted-foreground">×</div>
            <div className="flex gap-1">
              {profile2.colorPalette.slice(0, 3).map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}