'use client';

import React from 'react';
import { LinkPreview } from "./link-preview";
import { ExternalLink, Camera, Globe, Star, Heart, Trophy, BookOpen, Users, Palette, Crown } from "lucide-react";

// 원본 데모
export function LinkPreviewDemoSecond() {
  return (
    <div className="flex justify-center items-start h-[40rem] flex-col px-4">
      <p className="text-neutral-500 dark:text-neutral-400 text-xl md:text-3xl max-w-3xl  text-left mb-10">
        Visit{" "}
        <LinkPreview
          url="https://ui.aceternity.com"
          className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-500 to-pink-500"
        >
          Aceternity UI
        </LinkPreview>{" "}
        and for amazing Tailwind and Framer Motion components.
      </p>

      <p className="text-neutral-500 dark:text-neutral-400 text-xl md:text-3xl max-w-3xl  text-left ">
        I listen to{" "}
        <LinkPreview
          url="https://www.youtube.com/watch?v=S-z6vyR89Ig&list=RDMM&index=3"
          imageSrc="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=3540&auto=format&fit=crop"
          isStatic
          className="font-bold"
        >
          this guy
        </LinkPreview>{" "}
        and I watch{" "}
        <LinkPreview
          url="/templates"
          imageSrc="https://images.unsplash.com/photo-1489599904131-11c8ca89fc6b?q=80&w=3540&auto=format&fit=crop"
          isStatic
          className="font-bold"
        >
          this movie
        </LinkPreview>{" "}
        twice a day
      </p>
    </div>
  );
}

// SAYU 아트 추천 시스템 소개
export const SayuArtRecommendationPreview = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center p-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 shadow-lg">
              <Palette className="w-12 h-12 text-purple-300" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
            SAYU AI 아트 큐레이션
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            개인의 성향과 감정에 맞춘 지능형 예술 추천 시스템
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
          <div className="space-y-8">
            <p className="text-gray-700 dark:text-gray-300 text-xl md:text-2xl leading-relaxed">
              SAYU는{" "}
              <LinkPreview
                url="https://sayu.art/apt-test"
                imageSrc="https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=3540&auto=format&fit=crop"
                isStatic
                className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                16가지 성격 유형 기반 APT 테스트
              </LinkPreview>
              를 통해 개인의 예술적 취향을 분석합니다.
            </p>

            <p className="text-gray-700 dark:text-gray-300 text-xl md:text-2xl leading-relaxed">
              우리의{" "}
              <LinkPreview
                url="https://sayu.art/ai-curator"
                imageSrc="https://images.unsplash.com/photo-1547036967-23d11aacaee0?q=80&w=3540&auto=format&fit=crop"
                isStatic
                className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-purple-600"
              >
                AI 큐레이터 시스템
              </LinkPreview>
              은 감정 상태와 환경을 고려하여 최적의 작품을 제안합니다.
            </p>

            <p className="text-gray-700 dark:text-gray-300 text-xl md:text-2xl leading-relaxed">
              또한{" "}
              <LinkPreview
                url="https://sayu.art/community"
                imageSrc="https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=3540&auto=format&fit=crop"
                isStatic
                className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-emerald-600 to-teal-600"
              >
                커뮤니티 기반 협업 필터링
              </LinkPreview>
              을 통해 비슷한 성향의 사람들이 좋아하는 작품을 발견할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-purple-600 dark:text-purple-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              개인화된 추천
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              성격 유형과 감정 상태를 분석한 맞춤형 작품 추천
            </p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              글로벌 아트 데이터
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              세계 유명 미술관과 갤러리의 방대한 작품 데이터베이스
            </p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-pink-100 dark:bg-pink-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-pink-600 dark:text-pink-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              감정 기반 매칭
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              현재 감정과 무드에 맞는 작품과 전시회 제안
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// SAYU 갤러리 투어 소개
export const SayuGalleryTourPreview = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-100 dark:from-indigo-900 dark:to-cyan-900 flex items-center justify-center p-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 shadow-lg">
              <Camera className="w-12 h-12 text-indigo-300" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
            SAYU 갤러리 투어
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            전 세계 유명 갤러리를 집에서 체험하는 혁신적인 가상 투어
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
          <div className="space-y-8">
            <p className="text-gray-700 dark:text-gray-300 text-xl md:text-2xl leading-relaxed">
              <LinkPreview
                url="https://sayu.art/virtual-tours/louvre"
                imageSrc="https://images.unsplash.com/photo-1566306353477-58bf5ff8a94e?q=80&w=3540&auto=format&fit=crop"
                isStatic
                className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-blue-600"
              >
                루브르 박물관
              </LinkPreview>
              부터{" "}
              <LinkPreview
                url="https://sayu.art/virtual-tours/moma"
                imageSrc="https://images.unsplash.com/photo-1544967881-6ba31c3b8b04?q=80&w=3540&auto=format&fit=crop"
                isStatic
                className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-600 to-pink-600"
              >
                뉴욕 현대미술관
              </LinkPreview>
              까지, 세계적인 미술관을 실시간으로 탐험하세요.
            </p>

            <p className="text-gray-700 dark:text-gray-300 text-xl md:text-2xl leading-relaxed">
              <LinkPreview
                url="https://sayu.art/ar-gallery"
                imageSrc="https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=3540&auto=format&fit=crop"
                isStatic
                className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-emerald-600 to-teal-600"
              >
                AR 기술을 활용한 몰입형 갤러리
              </LinkPreview>
              에서 작품의 �숨은 디테일과 역사적 배경을 깊이 있게 이해할 수 있습니다.
            </p>

            <p className="text-gray-700 dark:text-gray-300 text-xl md:text-2xl leading-relaxed">
              <LinkPreview
                url="https://sayu.art/live-curator"
                imageSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3540&auto=format&fit=crop"
                isStatic
                className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-orange-600 to-red-600"
              >
                실시간 큐레이터 가이드
              </LinkPreview>
              와 함께하는 프라이빗 투어로 더욱 특별한 경험을 만들어보세요.
            </p>
          </div>
        </div>

        {/* Tour Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: "클래식 투어",
              icon: BookOpen,
              gradient: "from-blue-500 to-cyan-500",
              description: "전통적인 미술사 중심"
            },
            {
              title: "현대 아트",
              icon: Star,
              gradient: "from-purple-500 to-pink-500",
              description: "현대미술과 설치 작품"
            },
            {
              title: "VIP 프라이빗",
              icon: Crown,
              gradient: "from-yellow-500 to-orange-500",
              description: "1대1 전문가 가이드"
            },
            {
              title: "그룹 투어",
              icon: Users,
              gradient: "from-green-500 to-emerald-500",
              description: "친구들과 함께하는 체험"
            }
          ].map((tour, index) => (
            <div key={index} className={`bg-gradient-to-br ${tour.gradient} rounded-2xl p-8 text-white text-center hover:scale-105 transition-transform cursor-pointer`}>
              <tour.icon className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{tour.title}</h3>
              <p className="text-white/80 text-sm">{tour.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// SAYU 커뮤니티 기능 소개
export const SayuCommunityFeaturesPreview = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-900 flex items-center justify-center p-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 shadow-lg">
              <Users className="w-12 h-12 text-emerald-300" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
            SAYU 커뮤니티
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            예술을 사랑하는 사람들이 만나는 특별한 공간
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
          <div className="space-y-8">
            <p className="text-gray-700 dark:text-gray-300 text-xl md:text-2xl leading-relaxed">
              <LinkPreview
                url="https://sayu.art/community/perception-exchange"
                imageSrc="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=3540&auto=format&fit=crop"
                isStatic
                className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-emerald-600 to-teal-600"
              >
                퍼셉션 익스체인지
              </LinkPreview>
              를 통해 같은 작품에 대한 다양한 시각과 해석을 나누며 새로운 관점을 발견하세요.
            </p>

            <p className="text-gray-700 dark:text-gray-300 text-xl md:text-2xl leading-relaxed">
              <LinkPreview
                url="https://sayu.art/community/exhibition-companion"
                imageSrc="https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=3540&auto=format&fit=crop"
                isStatic
                className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-indigo-600"
              >
                전시 동행 매칭 시스템
              </LinkPreview>
              으로 비슷한 관심사를 가진 사람들과 함께 전시회를 관람할 동반자를 찾아보세요.
            </p>

            <p className="text-gray-700 dark:text-gray-300 text-xl md:text-2xl leading-relaxed">
              <LinkPreview
                url="https://sayu.art/community/art-pulse"
                imageSrc="https://images.unsplash.com/photo-1578321272176-b7bbc0679853?q=80&w=3540&auto=format&fit=crop"
                isStatic
                className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-600 to-pink-600"
              >
                아트 펄스 세션
              </LinkPreview>
              에서 실시간으로 감정을 공유하며 더 깊이 있는 예술적 소통을 경험해보세요.
            </p>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-300" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">15.2K</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">활성 멤버</p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">89.4K</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">공유된 감상</p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-purple-600 dark:text-purple-300" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">432</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">월간 이벤트</p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-teal-600 dark:text-teal-300" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">4.9</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">평균 만족도</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 인터랙티브 데모
export const InteractiveLinkPreviewDemo = () => {
  const [currentDemo, setCurrentDemo] = React.useState('original');

  const demos = {
    original: <LinkPreviewDemoSecond />,
    artRecommendation: <SayuArtRecommendationPreview />,
    galleryTour: <SayuGalleryTourPreview />,
    community: <SayuCommunityFeaturesPreview />
  };

  const demoNames = {
    original: '원본 데모',
    artRecommendation: 'AI 아트 추천',
    galleryTour: '갤러리 투어',
    community: '커뮤니티 기능'
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
const LinkPreviewDemo = () => {
  return <InteractiveLinkPreviewDemo />;
};

export default LinkPreviewDemo;

export { LinkPreviewDemoSecond };