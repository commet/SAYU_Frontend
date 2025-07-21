'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette,
  Sparkles,
  Heart,
  Info,
  Zap,
  Circle,
  Square,
  Triangle,
  Hexagon
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PersonalityType } from '@/shared/SAYUTypeDefinitions';
import { APT_TO_ART_MOVEMENT, APTCompatibilityScore } from '@/types/art-persona-matching';
import { ART_MOVEMENT_PROFILES } from '@/lib/art-movement-profiles';

interface APTCompatibilityVisualizationProps {
  user1: {
    aptType: PersonalityType;
    name: string;
  };
  user2: {
    aptType: PersonalityType;
    name: string;
  };
  compatibilityScore?: APTCompatibilityScore;
  showDetails?: boolean;
}

export function APTCompatibilityVisualization({
  user1,
  user2,
  compatibilityScore,
  showDetails = true
}: APTCompatibilityVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null);
  
  const movement1 = APT_TO_ART_MOVEMENT[user1.aptType];
  const movement2 = APT_TO_ART_MOVEMENT[user2.aptType];
  const profile1 = ART_MOVEMENT_PROFILES[movement1];
  const profile2 = ART_MOVEMENT_PROFILES[movement2];

  // 색상 팔레트 시각화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // 캔버스 초기화
    ctx.clearRect(0, 0, width, height);
    
    // 두 프로필의 색상을 블렌딩하여 그라데이션 생성
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    
    // 첫 번째 프로필 색상
    profile1.colorPalette.forEach((color, i) => {
      gradient.addColorStop(i / (profile1.colorPalette.length * 2), color);
    });
    
    // 중간 블렌딩 영역
    gradient.addColorStop(0.5, '#ffffff');
    
    // 두 번째 프로필 색상
    profile2.colorPalette.forEach((color, i) => {
      gradient.addColorStop(0.5 + (i + 1) / (profile2.colorPalette.length * 2), color);
    });
    
    // 그라데이션 그리기
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 웨이브 효과 추가
    ctx.globalCompositeOperation = 'multiply';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = 0; x <= width; x += 5) {
      const y = height / 2 + Math.sin(x * 0.02) * 20;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }, [profile1, profile2]);

  // 호환성 점수 계산 (실제 점수가 없을 경우)
  const calculateCompatibility = (): APTCompatibilityScore => {
    if (compatibilityScore) return compatibilityScore;
    
    const traits1 = profile1.matchingTraits;
    const traits2 = profile2.matchingTraits;
    
    // 각 차원별 호환성 계산
    const socialCompat = 100 - Math.abs(traits1.social - traits2.social) * 0.5;
    const artisticCompat = 100 - Math.abs(traits1.abstract - traits2.abstract) * 0.5;
    const emotionalCompat = 100 - Math.abs(traits1.emotional - traits2.emotional);
    const structuralCompat = 100 - Math.abs(traits1.structured - traits2.structured);
    
    const overall = (socialCompat + artisticCompat + emotionalCompat + structuralCompat) / 4;
    
    return {
      overall: Math.round(overall),
      dimensions: {
        social: Math.round(socialCompat),
        artistic: Math.round(artisticCompat),
        emotional: Math.round(emotionalCompat),
        structural: Math.round(structuralCompat)
      },
      sharedInterests: findSharedInterests(),
      complementaryTraits: findComplementaryTraits()
    };
  };

  const findSharedInterests = () => {
    const shared = [];
    
    // 키워드 비교
    profile1.keywords.forEach(keyword => {
      if (profile2.keywords.includes(keyword)) {
        shared.push(keyword);
      }
    });
    
    return shared;
  };

  const findComplementaryTraits = () => {
    const complementary = [];
    
    if (Math.abs(profile1.matchingTraits.social - profile2.matchingTraits.social) > 50) {
      complementary.push('사회성 균형');
    }
    if (Math.abs(profile1.matchingTraits.abstract - profile2.matchingTraits.abstract) > 40) {
      complementary.push('예술적 다양성');
    }
    
    return complementary;
  };

  const compatibility = calculateCompatibility();

  // 차원별 아이콘과 설명
  const dimensions = [
    {
      key: 'social',
      label: '사회적 호환성',
      icon: Heart,
      description: '혼자/함께 관람 스타일의 조화'
    },
    {
      key: 'artistic',
      label: '예술적 호환성',
      icon: Palette,
      description: '추상/구상 작품 선호의 균형'
    },
    {
      key: 'emotional',
      label: '감정적 호환성',
      icon: Sparkles,
      description: '작품을 대하는 감정적 접근'
    },
    {
      key: 'structural',
      label: '구조적 호환성',
      icon: Square,
      description: '자유로운/체계적 관람 방식'
    }
  ];

  return (
    <Card className="p-6 glass-panel">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">APT 호환성 분석</h3>
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-sm font-medium">{user1.name}</p>
            <p className="text-xs text-muted-foreground">{profile1.koreanName}</p>
          </div>
          <div className="text-2xl font-bold text-primary">
            {compatibility.overall}%
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">{user2.name}</p>
            <p className="text-xs text-muted-foreground">{profile2.koreanName}</p>
          </div>
        </div>
      </div>

      {/* 색상 하모니 시각화 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          색상 하모니
        </h4>
        <div className="relative rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={400}
            height={80}
            className="w-full h-20"
          />
          <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
            <div className="bg-white/90 backdrop-blur rounded px-2 py-1">
              <p className="text-xs font-medium">{profile1.koreanName}</p>
            </div>
            <div className="bg-white/90 backdrop-blur rounded px-2 py-1">
              <p className="text-xs font-medium">{profile2.koreanName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 차원별 호환성 */}
      {showDetails && (
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-medium">차원별 호환성</h4>
          {dimensions.map((dim) => {
            const Icon = dim.icon;
            const score = compatibility.dimensions[dim.key as keyof typeof compatibility.dimensions];
            const isHovered = hoveredDimension === dim.key;
            
            return (
              <motion.div
                key={dim.key}
                onHoverStart={() => setHoveredDimension(dim.key)}
                onHoverEnd={() => setHoveredDimension(null)}
                className="relative"
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    isHovered ? "text-primary" : "text-muted-foreground"
                  )} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{dim.label}</p>
                      <p className={cn(
                        "text-sm font-medium",
                        score >= 80 ? "text-green-600" :
                        score >= 60 ? "text-blue-600" :
                        score >= 40 ? "text-yellow-600" :
                        "text-gray-600"
                      )}>
                        {score}%
                      </p>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn(
                          "h-full",
                          score >= 80 ? "bg-green-500" :
                          score >= 60 ? "bg-blue-500" :
                          score >= 40 ? "bg-yellow-500" :
                          "bg-gray-500"
                        )}
                      />
                    </div>
                    {isHovered && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-muted-foreground mt-1"
                      >
                        {dim.description}
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 공통점과 보완점 */}
      <div className="grid grid-cols-2 gap-4">
        {compatibility.sharedInterests.length > 0 && (
          <div>
            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Circle className="w-4 h-4" />
              공통 관심사
            </h5>
            <div className="flex flex-wrap gap-1">
              {compatibility.sharedInterests.map((interest) => (
                <span
                  key={interest}
                  className="px-2 py-1 bg-primary/10 rounded-full text-xs"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {compatibility.complementaryTraits.length > 0 && (
          <div>
            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              보완적 특성
            </h5>
            <div className="flex flex-wrap gap-1">
              {compatibility.complementaryTraits.map((trait) => (
                <span
                  key={trait}
                  className="px-2 py-1 bg-secondary rounded-full text-xs"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 호환성 설명 */}
      <div className="mt-6 p-4 bg-primary/5 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">
              {compatibility.overall >= 70 ? '높은 호환성' :
               compatibility.overall >= 50 ? '중간 호환성' :
               '탐험적 호환성'}
            </p>
            <p className="text-muted-foreground">
              {compatibility.overall >= 70 
                ? '서로의 예술적 성향이 조화롭게 어우러집니다. 편안하고 즐거운 관람이 예상됩니다.'
                : compatibility.overall >= 50
                ? '적절한 공통점과 차이점이 있어 서로에게 새로운 시각을 제공할 수 있습니다.'
                : '다른 관점이 많아 서로에게 신선한 자극과 발견의 기회가 될 수 있습니다.'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}