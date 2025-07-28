'use client';

import React from 'react';
import { ThreeDPhotoCarousel } from './3d-carousel';
import { Palette, Camera, Users, Heart, Star, Trophy, Sparkles, Crown, Zap, Eye } from 'lucide-react';

// 원본 데모
export function ThreeDPhotoCarouselDemo() {
  return (
    <div className="w-full max-w-4xl">
      <div className="min-h-[500px] flex flex-col justify-center border border-dashed rounded-lg space-y-4">
        <div className="p-2">
          <ThreeDPhotoCarousel />
        </div>
      </div>
    </div>
  );
}

// SAYU 갤러리 아트워크 쇼케이스
export const SayuGalleryArtworkShowcase = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 shadow-lg">
              <Palette className="w-12 h-12 text-purple-300" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white">
            SAYU 갤러리 컬렉션
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            세계적인 아티스트들의 작품을 3D 공간에서 생생하게 경험해보세요
          </p>
        </div>

        {/* Main Carousel */}
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Eye className="w-6 h-6 text-purple-300" />
                <h2 className="text-3xl font-semibold text-white">
                  인상주의 컬렉션
                </h2>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">14</div>
                  <div className="text-sm text-white/60">작품</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">4.9</div>
                  <div className="text-sm text-white/60">평점</div>
                </div>
              </div>
            </div>
            <p className="text-white/70 max-w-2xl">
              모네, 르누아르, 드가의 명작들을 360도 회전하는 3D 갤러리에서 감상하세요. 
              작품을 클릭하면 고해상도로 자세히 볼 수 있습니다.
            </p>
          </div>
          
          <ThreeDPhotoCarousel />
          
          <div className="mt-8 flex items-center justify-center space-x-6">
            <div className="text-white/60 text-sm">드래그하여 회전 • 클릭하여 확대</div>
          </div>
        </div>

        {/* Gallery Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <Camera className="w-12 h-12 text-blue-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">몰입형 감상</h3>
            <p className="text-white/70">
              3D 공간에서 작품을 자유롭게 회전시키며 다양한 각도에서 관찰
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <Heart className="w-12 h-12 text-pink-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">개인화된 경험</h3>
            <p className="text-white/70">
              APT 성격 유형에 맞춘 큐레이션으로 당신만의 예술 여행
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <Users className="w-12 h-12 text-green-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">공유와 소통</h3>
            <p className="text-white/70">
              친구들과 함께 감상하고 감상평을 나누는 소셜 갤러리
            </p>
          </div>
        </div>

        {/* Featured Collections */}
        <div className="space-y-8">
          <h2 className="text-4xl font-bold text-white text-center">추천 컬렉션</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "현대 추상화",
                count: "23작품",
                icon: "🎨",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                title: "동양화 걸작",
                count: "18작품", 
                icon: "🖼️",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                title: "조각 컬렉션",
                count: "31작품",
                icon: "🗿",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                title: "사진 예술",
                count: "45작품",
                icon: "📸",
                gradient: "from-orange-500 to-red-500"
              }
            ].map((collection, index) => (
              <div key={index} className={`bg-gradient-to-br ${collection.gradient} rounded-2xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-3">{collection.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{collection.title}</h3>
                  <p className="text-white/80 text-sm mb-4">{collection.count}</p>
                  <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors">
                    둘러보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// SAYU 아티스트 포트폴리오 3D 갤러리
export const SayuArtistPortfolio3D = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Artist Header */}
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 shadow-lg">
              <Star className="w-12 h-12 text-yellow-300" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-white">
              이창민 작가
            </h1>
            <p className="text-2xl text-white/80">
              Contemporary Abstract Artist
            </p>
            <div className="flex items-center justify-center space-x-8 text-white/60">
              <div className="text-center">
                <div className="text-xl font-bold text-white">2019</div>
                <div className="text-sm">데뷔</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">47</div>
                <div className="text-sm">개인전</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">156</div>
                <div className="text-sm">작품</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">4.8</div>
                <div className="text-sm">평점</div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Carousel */}
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Sparkles className="w-6 h-6 text-indigo-300" />
                <h2 className="text-3xl font-semibold text-white">
                  대표작 포트폴리오
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-4 py-2 bg-indigo-500/30 rounded-full text-indigo-200 text-sm">
                  추상화
                </span>
                <span className="px-4 py-2 bg-purple-500/30 rounded-full text-purple-200 text-sm">
                  2024년 작품
                </span>
              </div>
            </div>
            <p className="text-white/70 max-w-3xl">
              감정의 흐름을 색채로 표현하는 이창민 작가의 최신 작품들을 3D 공간에서 만나보세요. 
              각 작품은 서로 다른 감정적 깊이와 시각적 경험을 선사합니다.
            </p>
          </div>
          
          <ThreeDPhotoCarousel />
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-2">작품 스타일</h4>
              <p className="text-white/70 text-sm">
                추상 표현주의와 색채 심리학을 결합한 독창적 기법
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-2">주요 테마</h4>
              <p className="text-white/70 text-sm">
                인간의 내면 감정과 자연의 리듬을 시각화
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-2">영감의 원천</h4>
              <p className="text-white/70 text-sm">
                도시의 야경과 계절의 변화에서 받은 영감
              </p>
            </div>
          </div>
        </div>

        {/* Artist Journey */}
        <div className="space-y-8">
          <h2 className="text-4xl font-bold text-white text-center">작가의 여정</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                year: "2019",
                title: "첫 개인전",
                description: "서울 갤러리에서 데뷔 개인전 개최",
                icon: "🎨"
              },
              {
                year: "2021", 
                title: "국제 진출",
                description: "뉴욕 아트페어 참가 및 해외 컬렉터 주목",
                icon: "🌍"
              },
              {
                year: "2022",
                title: "대상 수상",
                description: "한국현대미술대상 젊은작가상 수상",
                icon: "🏆"
              },
              {
                year: "2024",
                title: "SAYU 입점",
                description: "SAYU 플랫폼을 통한 디지털 갤러리 오픈",
                icon: "💫"
              }
            ].map((milestone, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/15 transition-colors">
                <div className="text-4xl mb-4">{milestone.icon}</div>
                <div className="text-2xl font-bold text-white mb-2">{milestone.year}</div>
                <h3 className="text-lg font-semibold text-white mb-3">{milestone.title}</h3>
                <p className="text-white/70 text-sm">{milestone.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Follow */}
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">작가와 소통하기</h2>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            이창민 작가의 최신 소식과 작품 업데이트를 받아보고, 직접 소통해보세요
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
              작가 팔로우하기
            </button>
            <button className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20">
              작품 문의하기
            </button>
          </div>
          <div className="mt-6 flex items-center justify-center space-x-6 text-white/60">
            <span>팔로워 1,234명</span>
            <span>•</span>
            <span>평균 평점 4.8/5</span>
            <span>•</span>
            <span>작품 156개</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// SAYU VIP 컬렉터 전용 프라이빗 갤러리
export const SayuVipPrivateGallery = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* VIP Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full p-6 shadow-lg">
              <Crown className="w-12 h-12 text-black" />
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            VIP 프라이빗 갤러리
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            세계 최고 수준의 작품들을 VIP 회원만을 위한 독점 공간에서 감상하세요
          </p>
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">₩50억</div>
              <div className="text-sm text-white/60">총 컬렉션 가치</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">12</div>
              <div className="text-sm text-white/60">거장 작품</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">한정</div>
              <div className="text-sm text-white/60">VIP 전용</div>
            </div>
          </div>
        </div>

        {/* Exclusive Collection */}
        <div className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 rounded-3xl p-8 shadow-2xl border border-yellow-400/20">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h2 className="text-3xl font-semibold text-white">
                  거장 컬렉션
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-4 py-2 bg-yellow-400/20 rounded-full text-yellow-300 text-sm">
                  박물관 급
                </span>
                <span className="px-4 py-2 bg-red-500/20 rounded-full text-red-300 text-sm">
                  비공개
                </span>
              </div>
            </div>
            <p className="text-white/70 max-w-3xl">
              피카소, 반 고흐, 모네 등 세계적 거장들의 진품을 디지털 복원 기술로 완벽 재현. 
              일반 대중에게는 공개되지 않는 프라이빗 컬렉션을 VIP 회원만 감상할 수 있습니다.
            </p>
          </div>
          
          <ThreeDPhotoCarousel />
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/30 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">독점 혜택</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-white/80">8K 초고해상도 감상</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-yellow-400" />
                  <span className="text-white/80">AI 기반 작품 해설</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-yellow-400" />
                  <span className="text-white/80">전문 큐레이터 상담</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-yellow-400" />
                  <span className="text-white/80">컬렉션 투자 자문</span>
                </div>
              </div>
            </div>
            
            <div className="bg-black/30 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">현재 전시 중</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">피카소 '게르니카' 스터디</span>
                  <span className="text-yellow-400 text-sm">₹15억</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">반 고흐 '별이 빛나는 밤' 습작</span>
                  <span className="text-yellow-400 text-sm">₩8억</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">모네 '수련' 연작 중 하나</span>
                  <span className="text-yellow-400 text-sm">₩12억</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">레오나르도 다빈치 드로잉</span>
                  <span className="text-yellow-400 text-sm">₩25억</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VIP Services */}
        <div className="space-y-8">
          <h2 className="text-4xl font-bold text-white text-center">VIP 전용 서비스</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl p-8 text-center border border-yellow-400/30">
              <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-4">프라이빗 투어</h3>
              <p className="text-white/70 mb-6">
                전문 큐레이터와 함께하는 1:1 개인 투어
              </p>
              <div className="text-2xl font-bold text-yellow-400 mb-2">₩500,000</div>
              <div className="text-sm text-white/60">1회 2시간</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-8 text-center border border-purple-400/30">
              <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-4">컬렉션 자문</h3>
              <p className="text-white/70 mb-6">
                개인 컬렉션 구축을 위한 전문가 자문
              </p>
              <div className="text-2xl font-bold text-purple-400 mb-2">₩2,000,000</div>
              <div className="text-sm text-white/60">월 4회 상담</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-8 text-center border border-blue-400/30">
              <Star className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-4">독점 경매</h3>
              <p className="text-white/70 mb-6">
                VIP 회원만 참여 가능한 프라이빗 경매
              </p>
              <div className="text-2xl font-bold text-blue-400 mb-2">초대제</div>
              <div className="text-sm text-white/60">월 1회 개최</div>
            </div>
          </div>
        </div>

        {/* Membership */}
        <div className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 rounded-3xl p-12 text-center border border-yellow-400/20">
          <h2 className="text-4xl font-bold text-white mb-6">VIP 멤버십 가입</h2>
          <p className="text-white/70 mb-8 max-w-3xl mx-auto text-lg">
            세계 최고 수준의 아트 컬렉션과 독점 서비스를 경험하세요. 
            엄선된 VIP 회원만이 누릴 수 있는 특별한 혜택이 기다립니다.
          </p>
          <div className="space-y-6">
            <div className="text-5xl font-bold text-yellow-400">₩10,000,000</div>
            <div className="text-white/60">연간 멤버십</div>
            <button className="px-12 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition-colors text-lg">
              VIP 멤버십 신청하기
            </button>
            <p className="text-white/50 text-sm">
              *현재 전 세계 47명의 VIP 회원이 활동 중입니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 인터랙티브 데모
export const Interactive3DCarouselDemo = () => {
  const [currentDemo, setCurrentDemo] = React.useState('original');

  const demos = {
    original: <ThreeDPhotoCarouselDemo />,
    galleryShowcase: <SayuGalleryArtworkShowcase />,
    artistPortfolio: <SayuArtistPortfolio3D />,
    vipGallery: <SayuVipPrivateGallery />
  };

  const demoNames = {
    original: '원본 캐러셀',
    galleryShowcase: '갤러리 쇼케이스',
    artistPortfolio: '아티스트 포트폴리오',
    vipGallery: 'VIP 프라이빗 갤러리'
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
const ThreeDCarouselDemo = () => {
  return <Interactive3DCarouselDemo />;
};

export default ThreeDCarouselDemo;