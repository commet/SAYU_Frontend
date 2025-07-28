'use client';

import React from 'react';
import { PerspectiveCarousel } from './perspective-carousel';
import { Palette, Users, Calendar, Star, Trophy, Crown, Eye, Heart, Sparkles, Camera } from 'lucide-react';

// 원본 데모
export function PerspectiveCarouselDemo() {
  const slideData = [
    {
      title: "Mystic Mountains",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1494806812796-244fe51b774d?q=80&w=3534&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Urban Dreams",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Neon Nights",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1590041794748-2d8eb73a571c?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Desert Whispers",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1679420437432-80cfbf88986c?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  return (
    <div className="relative overflow-hidden w-full h-full py-20">
      <PerspectiveCarousel slides={slideData} />
    </div>
  );
}

// SAYU 특별 전시회 하이라이트
export const SayuFeaturedExhibitions = () => {
  const exhibitionSlides = [
    {
      title: "모네: 빛의 인상",
      button: "전시 예약하기",
      src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "한국 현대미술의 새로운 물결",
      button: "작품 둘러보기",
      src: "https://images.unsplash.com/photo-1544967882-4d64e1b07dff?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "디지털 아트 페스티벌 2025",
      button: "VR 체험하기",
      src: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "조각 공원: 자연과 예술의 만남",
      button: "야외 투어 신청",
      src: "https://images.unsplash.com/photo-1544967881-6ba31c3b8b04?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 shadow-lg">
              <Star className="w-12 h-12 text-yellow-300" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white">
            SAYU 특별 전시회
          </h1>
          <p className="text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            세계적인 명작부터 신진 작가의 실험적 작품까지, 
            SAYU에서만 만날 수 있는 특별한 전시 경험을 제공합니다
          </p>
        </div>

        {/* Main Carousel */}
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Palette className="w-8 h-8 text-purple-300" />
                <h2 className="text-4xl font-semibold text-white">
                  이번 달 주목할 전시
                </h2>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">4</div>
                  <div className="text-sm text-white/60">특별 전시</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">25,847</div>
                  <div className="text-sm text-white/60">총 관람객</div>
                </div>
              </div>
            </div>
            <p className="text-white/70 text-lg max-w-3xl">
              마우스를 움직이면 3D 효과와 함께 전시 상세 정보를 확인할 수 있습니다. 
              클릭하여 전시별 세부 내용과 예약 정보를 살펴보세요.
            </p>
          </div>
          
          <PerspectiveCarousel slides={exhibitionSlides} />
          
          <div className="mt-12 text-center">
            <p className="text-white/60">마우스로 상호작용 • 클릭하여 전시 선택</p>
          </div>
        </div>

        {/* Exhibition Stats & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h3 className="text-2xl font-semibold text-white mb-8 flex items-center">
              <Trophy className="w-6 h-6 text-yellow-400 mr-3" />
              전시회 하이라이트
            </h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">VR 갤러리 투어</h4>
                  <p className="text-white/70 text-sm">
                    최신 VR 기술로 구현된 몰입형 전시 관람 경험
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">큐레이터 가이드 투어</h4>
                  <p className="text-white/70 text-sm">
                    전문 큐레이터와 함께하는 깊이 있는 작품 해설
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-500/30 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">APT 기반 추천</h4>
                  <p className="text-white/70 text-sm">
                    당신의 성격 유형에 맞는 맞춤형 작품 추천
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h3 className="text-2xl font-semibold text-white mb-8 flex items-center">
              <Calendar className="w-6 h-6 text-blue-400 mr-3" />
              upcoming 전시 일정
            </h3>
            <div className="space-y-4">
              {[
                {
                  date: "2월 15일",
                  title: "바스키아 회고전",
                  location: "국립현대미술관",
                  status: "예매 오픈"
                },
                {
                  date: "3월 2일",
                  title: "한국의 색: 오방색 특별전",
                  location: "서울시립미술관",
                  status: "사전 등록"
                },
                {
                  date: "3월 20일",
                  title: "AI와 예술의 만남",
                  location: "SAYU 전용관",
                  status: "VIP 프리뷰"
                },
                {
                  date: "4월 10일",
                  title: "젊은 작가들의 실험실",
                  location: "갤러리 현대",
                  status: "큐레이터 투어"
                }
              ].map((event, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm font-bold text-blue-300">{event.date}</div>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{event.title}</h4>
                      <p className="text-white/60 text-sm">{event.location}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-xs">
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-3xl p-12 text-center border border-purple-400/20">
          <Sparkles className="w-16 h-16 text-purple-300 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-6">
            SAYU 프리미엄 멤버십
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-3xl mx-auto">
            모든 특별 전시회 무료 관람, VIP 프리뷰 초대, 큐레이터 개인 투어 등 
            독점 혜택을 누리세요
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors text-lg">
              멤버십 가입하기
            </button>
            <button className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors border border-white/20 text-lg">
              혜택 자세히 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// SAYU 추천 아티스트 스포트라이트
export const SayuArtistSpotlight = () => {
  const artistSlides = [
    {
      title: "김예진 작가",
      button: "포트폴리오 보기",
      src: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "박현수 작가",
      button: "작품 컬렉션",
      src: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "이지아 작가",
      button: "인터뷰 영상",
      src: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "최민호 작가",
      button: "개인전 정보",
      src: "https://images.unsplash.com/photo-1576087637862-1d2e5d9f5e65?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-900 p-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 shadow-lg">
              <Crown className="w-12 h-12 text-emerald-300" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white">
            이달의 추천 아티스트
          </h1>
          <p className="text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            SAYU가 엄선한 국내외 주목받는 신진 작가들의 작품 세계를 
            3D 인터랙티브 환경에서 탐험해보세요
          </p>
        </div>

        {/* Artist Spotlight Carousel */}
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Camera className="w-8 h-8 text-emerald-300" />
                <h2 className="text-4xl font-semibold text-white">
                  Artist Spotlight
                </h2>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">47</div>
                  <div className="text-sm text-white/60">신진 작가</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">1,234</div>
                  <div className="text-sm text-white/60">작품 수</div>
                </div>
              </div>
            </div>
            <p className="text-white/70 text-lg max-w-3xl">
              각 작가의 독특한 예술 세계와 창작 철학을 심도 있게 탐구할 수 있습니다.
              마우스 인터랙션으로 작가의 대표작과 스토리를 발견해보세요.
            </p>
          </div>
          
          <PerspectiveCarousel slides={artistSlides} />
          
          <div className="mt-12 text-center">
            <p className="text-white/60">마우스 호버로 3D 효과 • 클릭하여 작가 정보 탐색</p>
          </div>
        </div>

        {/* Artist Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              category: "페인팅",
              count: "23명",
              icon: "🎨",
              gradient: "from-red-500 to-pink-500"
            },
            {
              category: "조각",
              count: "15명",
              icon: "🗿",
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              category: "디지털 아트",
              count: "31명",
              icon: "💻",
              gradient: "from-purple-500 to-violet-500"
            },
            {
              category: "미디어 아트",
              count: "19명",
              icon: "📱",
              gradient: "from-green-500 to-emerald-500"
            }
          ].map((category, index) => (
            <div key={index} className={`bg-gradient-to-br ${category.gradient} rounded-2xl p-8 text-white text-center hover:scale-105 transition-transform cursor-pointer`}>
              <div className="text-5xl mb-4">{category.icon}</div>
              <h3 className="text-2xl font-semibold mb-2">{category.category}</h3>
              <p className="text-white/80 mb-4">{category.count}</p>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors">
                둘러보기
              </button>
            </div>
          ))}
        </div>

        {/* Monthly Features */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            이달의 특집
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-10 h-10 text-emerald-300" />
              </div>
              <h3 className="text-xl font-semibold text-white">Rising Star Award</h3>
              <p className="text-white/70">
                가장 주목받는 신진 작가 선정
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-10 h-10 text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold text-white">Community Choice</h3>
              <p className="text-white/70">
                커뮤니티가 선택한 인기 작가
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-purple-500/30 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-10 h-10 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-white">Editor's Pick</h3>
              <p className="text-white/70">
                큐레이터가 추천하는 작가
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// SAYU 커뮤니티 피처드 콘텐츠
export const SayuCommunityFeatured = () => {
  const communitySlides = [
    {
      title: "APT 테스트 체험기 모음",
      button: "후기 읽어보기",
      src: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "갤러리 동시 관람 이벤트",
      button: "참여 신청하기",
      src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "아트 컬렉터 네트워킹",
      button: "모임 정보 보기",
      src: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "월간 아트 북클럽",
      button: "도서 목록 확인",
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-900 via-pink-900 to-rose-900 p-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 shadow-lg">
              <Users className="w-12 h-12 text-rose-300" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white">
            SAYU 커뮤니티 하이라이트
          </h1>
          <p className="text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            예술을 사랑하는 사람들이 모여 나누는 특별한 경험들을 
            함께 발견하고 참여해보세요
          </p>
        </div>

        {/* Community Carousel */}
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Heart className="w-8 h-8 text-rose-300" />
                <h2 className="text-4xl font-semibold text-white">
                  이번 주 인기 활동
                </h2>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">2,847</div>
                  <div className="text-sm text-white/60">활성 멤버</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">156</div>
                  <div className="text-sm text-white/60">진행 중 활동</div>
                </div>
              </div>
            </div>
            <p className="text-white/70 text-lg max-w-3xl">
              매주 업데이트되는 커뮤니티 활동들을 확인하고 
              관심 있는 모임에 참여해보세요.
            </p>
          </div>
          
          <PerspectiveCarousel slides={communitySlides} />
          
          <div className="mt-12 text-center">
            <p className="text-white/60">인터랙티브 탐색 • 클릭하여 활동 상세 정보</p>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-rose-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-rose-300" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">15,280</h3>
            <p className="text-white/70">총 커뮤니티 멤버</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-pink-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-pink-300" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">432</h3>
            <p className="text-white/70">이번 달 이벤트</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-purple-300" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">4.9</h3>
            <p className="text-white/70">평균 만족도</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-orange-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-orange-300" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">89</h3>
            <p className="text-white/70">진행된 워크샵</p>
          </div>
        </div>

        {/* Join Community CTA */}
        <div className="bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-3xl p-12 text-center border border-rose-400/20">
          <Sparkles className="w-16 h-16 text-rose-300 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-6">
            SAYU 커뮤니티에 참여하세요
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-3xl mx-auto">
            예술을 사랑하는 사람들과 함께 특별한 경험을 나누고, 
            새로운 관점과 영감을 발견해보세요
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-10 py-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors text-lg">
              커뮤니티 가입하기
            </button>
            <button className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors border border-white/20 text-lg">
              활동 둘러보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 인터랙티브 데모
export const InteractivePerspectiveCarouselDemo = () => {
  const [currentDemo, setCurrentDemo] = React.useState('original');

  const demos = {
    original: <PerspectiveCarouselDemo />,
    exhibitions: <SayuFeaturedExhibitions />,
    artists: <SayuArtistSpotlight />,
    community: <SayuCommunityFeatured />
  };

  const demoNames = {
    original: '원본 캐러셀',
    exhibitions: '특별 전시회',
    artists: '추천 아티스트',
    community: '커뮤니티 활동'
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
const PerspectiveCarouselDemo = () => {
  return <InteractivePerspectiveCarouselDemo />;
};

export default PerspectiveCarouselDemo;