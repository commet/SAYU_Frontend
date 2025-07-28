'use client';

import React from 'react';
import { Badge } from './badge-new';
import { 
  Star, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Heart, 
  Crown,
  Zap,
  Users,
  Award,
  Sparkles
} from 'lucide-react';

// 원본 데모
export function Demo() {
  return (
    <div className="flex flex-col space-y-8 p-8 bg-white dark:bg-gray-950">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Badge Variants
        </h3>
        
        <div className="flex flex-wrap gap-3">
          <Badge variant="gray">Gray</Badge>
          <Badge variant="blue">Blue</Badge>
          <Badge variant="purple">Purple</Badge>
          <Badge variant="amber">Amber</Badge>
          <Badge variant="red">Red</Badge>
          <Badge variant="pink">Pink</Badge>
          <Badge variant="green">Green</Badge>
          <Badge variant="teal">Teal</Badge>
          <Badge variant="inverted">Inverted</Badge>
          <Badge variant="trial">Trial</Badge>
          <Badge variant="turbo">Turbo</Badge>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Badge Sizes
        </h3>
        
        <div className="flex items-center gap-4">
          <Badge size="sm" variant="blue">Small</Badge>
          <Badge size="md" variant="blue">Medium</Badge>
          <Badge size="lg" variant="blue">Large</Badge>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Badges with Icons
        </h3>
        
        <div className="flex flex-wrap gap-3">
          <Badge variant="green" icon={<CheckCircle />}>Verified</Badge>
          <Badge variant="amber" icon={<AlertTriangle />}>Warning</Badge>
          <Badge variant="blue" icon={<Info />}>Info</Badge>
          <Badge variant="pink" icon={<Heart />}>Liked</Badge>
          <Badge variant="purple" icon={<Crown />}>Premium</Badge>
        </div>
      </div>
    </div>
  );
}

// SAYU APT 성격 유형 배지
export const SayuAptBadges = () => {
  const aptTypes = [
    { code: 'INFP', animal: '🐯', name: '호랑이', variant: 'purple' as const, description: '창의적이고 이상주의적' },
    { code: 'ENFJ', animal: '🐱', name: '고양이', variant: 'pink' as const, description: '사교적이고 온화한' },
    { code: 'ISTP', animal: '🦅', name: '독수리', variant: 'blue' as const, description: '논리적이고 실용적' },
    { code: 'ESFP', animal: '🦋', name: '나비', variant: 'amber' as const, description: '자유롭고 활발한' },
    { code: 'INTJ', animal: '🐺', name: '늑대', variant: 'gray' as const, description: '독립적이고 전략적' },
    { code: 'ENFP', animal: '🐰', name: '토끼', variant: 'green' as const, description: '열정적이고 영감을 주는' },
  ];

  return (
    <div className="flex flex-col space-y-8 p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-purple-800 dark:text-purple-200">
          SAYU APT 성격 유형
        </h2>
        <p className="text-purple-600 dark:text-purple-300">
          16가지 동물 캐릭터로 표현하는 나만의 예술 성향
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {aptTypes.map((type) => (
          <div key={type.code} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 space-y-3">
            <div className="text-center">
              <div className="text-4xl mb-2">{type.animal}</div>
              <Badge variant={type.variant} size="lg" className="mb-2">
                {type.code} {type.name}
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {type.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Badge variant="turbo" size="lg" icon={<Sparkles />}>
          내 성격 유형 찾기
        </Badge>
      </div>
    </div>
  );
};

// SAYU 전시회 상태 배지
export const SayuExhibitionBadges = () => {
  return (
    <div className="flex flex-col space-y-8 p-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-200">
          전시회 현황
        </h2>
        <p className="text-blue-600 dark:text-blue-300">
          실시간 전시회 정보와 참여 현황을 확인하세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">현재 진행 중</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">모네 특별전</span>
              <Badge variant="green" icon={<Users />}>진행중</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">현대 미술 컬렉션</span>
              <Badge variant="blue" icon={<Info />}>새로운</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">한국화 명작전</span>
              <Badge variant="amber" icon={<Star />}>인기</Badge>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">참여 현황</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">전시 관람</span>
              <Badge variant="purple" size="sm">12회</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">작품 좋아요</span>
              <Badge variant="pink" size="sm" icon={<Heart />}>247</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">커뮤니티 참여</span>
              <Badge variant="teal" size="sm">활발</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Badge variant="trial" size="lg" icon={<Award />}>
          프리미엄 멤버십
        </Badge>
        <Badge variant="turbo" size="lg" icon={<Zap />}>
          AI 큐레이션 활성화
        </Badge>
      </div>
    </div>
  );
};

// SAYU 작품 태그 시스템
export const SayuArtworkTags = () => {
  const artworkTags = [
    { name: '인상주의', variant: 'blue' as const, count: 156 },
    { name: '추상화', variant: 'purple' as const, count: 89 },
    { name: '풍경화', variant: 'green' as const, count: 234 },
    { name: '초상화', variant: 'pink' as const, count: 67 },
    { name: '정물화', variant: 'amber' as const, count: 123 },
    { name: '현대미술', variant: 'teal' as const, count: 345 },
    { name: '조각', variant: 'gray' as const, count: 78 },
    { name: '사진', variant: 'red' as const, count: 201 },
  ];

  return (
    <div className="flex flex-col space-y-8 p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-green-800 dark:text-green-200">
          작품 태그 시스템
        </h2>
        <p className="text-green-600 dark:text-green-300">
          장르별 작품을 쉽게 찾아보세요
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {artworkTags.map((tag) => (
          <div key={tag.name} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 text-center space-y-2">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {tag.count}
            </div>
            <Badge variant={tag.variant} className="w-full justify-center">
              {tag.name}
            </Badge>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Badge variant="inverted" size="sm">전체</Badge>
        <Badge variant="blue" size="sm">추천</Badge>
        <Badge variant="purple" size="sm">인기</Badge>
        <Badge variant="green" size="sm">최신</Badge>
        <Badge variant="amber" size="sm">클래식</Badge>
      </div>
    </div>
  );
};

// 인터랙티브 데모
export const InteractiveBadgeDemo = () => {
  const [currentDemo, setCurrentDemo] = React.useState('original');

  const demos = {
    original: <Demo />,
    aptTypes: <SayuAptBadges />,
    exhibitions: <SayuExhibitionBadges />,
    artworkTags: <SayuArtworkTags />
  };

  const demoNames = {
    original: '원본 배지',
    aptTypes: 'APT 성격 유형',
    exhibitions: '전시회 현황',
    artworkTags: '작품 태그'
  };

  return (
    <div className="relative min-h-screen">
      {/* Demo toggle buttons */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {Object.keys(demos).map((key) => (
          <button
            key={key}
            onClick={() => setCurrentDemo(key)}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              currentDemo === key
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white/90 text-gray-800 border border-gray-200 hover:bg-gray-100 backdrop-blur-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700'
            }`}
          >
            {demoNames[key as keyof typeof demoNames]}
          </button>
        ))}
      </div>

      {/* Demo content */}
      <div className="w-full h-full">
        {demos[currentDemo as keyof typeof demos]}
      </div>
    </div>
  );
};

// Default export
const BadgeNewDemo = () => {
  return <InteractiveBadgeDemo />;
};

export default BadgeNewDemo;