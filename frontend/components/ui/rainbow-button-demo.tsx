'use client';

import React from 'react';
import { RainbowButton } from './rainbow-button';
import { Crown, Sparkles, Star, Zap, Heart, Palette } from 'lucide-react';

// 원본 데모
export function Demo() {
  return <RainbowButton>Get Unlimited Access</RainbowButton>;
}

// SAYU 프리미엄 멤버십
export const SayuPremiumMembership = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-6">
          <div className="flex justify-center">
            <Crown className="w-16 h-16 text-yellow-400" />
          </div>
          <h1 className="text-5xl font-bold text-white">
            SAYU Premium
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            무제한 AI 큐레이션, 프리미엄 전시회 액세스, 개인 맞춤 아트 프로필까지
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
          <div className="space-y-4">
            <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
            <h3 className="text-xl font-semibold">AI 큐레이션</h3>
            <p className="text-white/70">무제한 개인 맞춤 작품 추천</p>
          </div>
          <div className="space-y-4">
            <Star className="w-8 h-8 text-yellow-400 mx-auto" />
            <h3 className="text-xl font-semibold">프리미엄 전시</h3>
            <p className="text-white/70">독점 전시회 우선 예약</p>
          </div>
          <div className="space-y-4">
            <Palette className="w-8 h-8 text-pink-400 mx-auto" />
            <h3 className="text-xl font-semibold">아트 프로필</h3>
            <p className="text-white/70">전문가급 작품 분석</p>
          </div>
        </div>

        <div className="space-y-6">
          <RainbowButton className="text-lg px-12 py-4 h-14">
            <Crown className="w-5 h-5 mr-2" />
            프리미엄 시작하기
          </RainbowButton>
          <p className="text-white/60 text-sm">30일 무료 체험 • 언제든 취소 가능</p>
        </div>
      </div>
    </div>
  );
};

// SAYU AI 아트 프로필 생성
export const SayuArtProfileGenerator = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-6">
          <div className="flex justify-center">
            <Zap className="w-16 h-16 text-cyan-400" />
          </div>
          <h1 className="text-5xl font-bold text-white">
            AI 아트 프로필
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            당신만의 독특한 예술적 취향을 AI가 분석하여 나만의 아트 프로필을 생성합니다
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-3">
            <div className="text-3xl font-bold text-cyan-400">16</div>
            <div className="text-sm">성격 유형</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-3">
            <div className="text-3xl font-bold text-emerald-400">1000+</div>
            <div className="text-sm">분석 데이터</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-3">
            <div className="text-3xl font-bold text-teal-400">95%</div>
            <div className="text-sm">정확도</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-3">
            <div className="text-3xl font-bold text-cyan-300">AI</div>
            <div className="text-sm">최신 기술</div>
          </div>
        </div>

        <div className="space-y-6">
          <RainbowButton className="text-lg px-12 py-4 h-14">
            <Sparkles className="w-5 h-5 mr-2" />
            나만의 아트 프로필 생성
          </RainbowButton>
          <p className="text-white/60 text-sm">5분 만에 완성 • 완전 개인 맞춤</p>
        </div>
      </div>
    </div>
  );
};

// SAYU 커뮤니티 참여
export const SayuCommunityJoin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-6">
          <div className="flex justify-center">
            <Heart className="w-16 h-16 text-pink-400" />
          </div>
          <h1 className="text-5xl font-bold text-white">
            예술 애호가 커뮤니티
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            같은 취향의 사람들과 만나고, 전시회를 함께 관람하며, 예술에 대한 깊은 대화를 나누세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 space-y-4">
            <h3 className="text-2xl font-semibold">전시 동행</h3>
            <p className="text-white/70">
              APT 성격 유형을 바탕으로 매칭된 동행자와 함께 전시회를 관람하고 새로운 시각을 발견하세요
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 space-y-4">
            <h3 className="text-2xl font-semibold">감상 교환</h3>
            <p className="text-white/70">
              같은 작품에 대한 다양한 관점을 공유하고, 예술 작품의 숨겨진 의미를 함께 탐구해보세요
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="flex -space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-4 border-white"></div>
            <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full border-4 border-white"></div>
            <div className="w-12 h-12 bg-gradient-to-r from-rose-400 to-orange-400 rounded-full border-4 border-white"></div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full border-4 border-white flex items-center justify-center text-white font-bold">
              +12K
            </div>
          </div>
          <p className="text-white/70 text-sm">이미 12,000명의 예술 애호가가 함께하고 있습니다</p>
        </div>

        <div className="space-y-6">
          <RainbowButton className="text-lg px-12 py-4 h-14">
            <Heart className="w-5 h-5 mr-2" />
            커뮤니티 참여하기
          </RainbowButton>
          <p className="text-white/60 text-sm">무료 가입 • 즉시 매칭 시작</p>
        </div>
      </div>
    </div>
  );
};

// 다양한 크기 및 변형 쇼케이스
export const RainbowButtonShowcase = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-8">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-white">
            Rainbow Button 컬렉션
          </h2>
          <p className="text-white/70">
            다양한 크기와 용도별 레인보우 버튼 컴포넌트
          </p>
        </div>

        {/* Size Variants */}
        <section className="space-y-8">
          <h3 className="text-2xl font-semibold text-white text-center">크기 변형</h3>
          <div className="flex flex-wrap justify-center items-center gap-6">
            <RainbowButton className="h-8 px-4 text-sm">
              Small
            </RainbowButton>
            <RainbowButton className="h-10 px-6">
              Medium
            </RainbowButton>
            <RainbowButton className="h-12 px-8 text-lg">
              Large
            </RainbowButton>
            <RainbowButton className="h-16 px-12 text-xl">
              Extra Large
            </RainbowButton>
          </div>
        </section>

        {/* With Icons */}
        <section className="space-y-8">
          <h3 className="text-2xl font-semibold text-white text-center">아이콘 포함</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <RainbowButton>
              <Crown className="w-4 h-4 mr-2" />
              프리미엄 업그레이드
            </RainbowButton>
            <RainbowButton>
              <Sparkles className="w-4 h-4 mr-2" />
              AI 분석 시작
            </RainbowButton>
            <RainbowButton>
              <Star className="w-4 h-4 mr-2" />
              즐겨찾기 추가
            </RainbowButton>
            <RainbowButton>
              <Zap className="w-4 h-4 mr-2" />
              빠른 매칭
            </RainbowButton>
            <RainbowButton>
              <Heart className="w-4 h-4 mr-2" />
              좋아요
            </RainbowButton>
            <RainbowButton>
              <Palette className="w-4 h-4 mr-2" />
              아트 생성
            </RainbowButton>
          </div>
        </section>

        {/* SAYU Specific Use Cases */}
        <section className="space-y-8">
          <h3 className="text-2xl font-semibold text-white text-center">SAYU 활용 예시</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 space-y-6">
              <h4 className="text-xl font-semibold text-white">메인 액션</h4>
              <div className="space-y-4">
                <RainbowButton className="w-full">
                  APT 성격 테스트 시작
                </RainbowButton>
                <RainbowButton className="w-full">
                  AI 큐레이션 체험
                </RainbowButton>
                <RainbowButton className="w-full">
                  프리미엄 멤버십
                </RainbowButton>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 space-y-6">
              <h4 className="text-xl font-semibold text-white">특별 기능</h4>
              <div className="space-y-4">
                <RainbowButton className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  감정 기반 작품 찾기
                </RainbowButton>
                <RainbowButton className="w-full">
                  <Heart className="w-4 h-4 mr-2" />
                  전시 동행 매칭
                </RainbowButton>
                <RainbowButton className="w-full">
                  <Crown className="w-4 h-4 mr-2" />
                  VIP 갤러리 투어
                </RainbowButton>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center">
          <p className="text-white/50 text-sm">
            무지개 그라디언트 애니메이션으로 사용자의 시선을 사로잡는 프리미엄 버튼
          </p>
        </div>
      </div>
    </div>
  );
};

// 인터랙티브 데모
export const InteractiveRainbowButtonDemo = () => {
  const [currentDemo, setCurrentDemo] = React.useState('original');

  const demos = {
    original: <Demo />,
    premium: <SayuPremiumMembership />,
    artProfile: <SayuArtProfileGenerator />,
    community: <SayuCommunityJoin />,
    showcase: <RainbowButtonShowcase />
  };

  const demoNames = {
    original: '원본 데모',
    premium: '프리미엄 멤버십',
    artProfile: 'AI 아트 프로필',
    community: '커뮤니티 참여',
    showcase: '전체 쇼케이스'
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
const RainbowButtonDemo = () => {
  return <InteractiveRainbowButtonDemo />;
};

export default RainbowButtonDemo;