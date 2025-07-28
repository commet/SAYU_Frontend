'use client';

import React from 'react';
import { RainbowButton } from './rainbow-button-v2';
import { Zap, Crown, Sparkles, Palette, Heart, Star, Wand2, Gem, Gift, Trophy } from 'lucide-react';

// 원본 데모
export function Demo() {
  return <RainbowButton>Get Unlimited Access</RainbowButton>;
}

// SAYU 예술 창작 도구
export const SayuArtCreationTools = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 flex items-center justify-center p-8">
      <div className="max-w-5xl mx-auto text-center space-y-16">
        <div className="space-y-8">
          <div className="flex justify-center">
            <Wand2 className="w-20 h-20 text-purple-300" />
          </div>
          <h1 className="text-6xl font-bold text-white">
            AI 예술 창작 스튜디오
          </h1>
          <p className="text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            첨단 AI 기술로 당신의 창작 아이디어를 현실로 만들어보세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-6 hover:bg-white/15 transition-all">
            <Palette className="w-12 h-12 text-purple-300 mx-auto" />
            <h3 className="text-2xl font-semibold text-white">스타일 변환</h3>
            <p className="text-white/70">
              클래식부터 현대까지, 다양한 화풍으로 작품을 변환
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-6 hover:bg-white/15 transition-all">
            <Sparkles className="w-12 h-12 text-pink-300 mx-auto" />
            <h3 className="text-2xl font-semibold text-white">감정 표현</h3>
            <p className="text-white/70">
              당신의 감정을 시각적 언어로 표현하는 AI
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-6 hover:bg-white/15 transition-all">
            <Gem className="w-12 h-12 text-cyan-300 mx-auto" />
            <h3 className="text-2xl font-semibold text-white">작품 복원</h3>
            <p className="text-white/70">
              손상된 작품을 AI가 완벽하게 복원
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <RainbowButton className="text-xl px-16 py-5 h-16">
            <Wand2 className="w-6 h-6 mr-3" />
            창작 스튜디오 시작하기
          </RainbowButton>
          <p className="text-white/60">무료 체험 • 프로 도구 • 무제한 창작</p>
        </div>
      </div>
    </div>
  );
};

// SAYU VIP 갤러리 투어
export const SayuVipGalleryTour = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 flex items-center justify-center p-8">
      <div className="max-w-5xl mx-auto text-center space-y-16">
        <div className="space-y-8">
          <div className="flex justify-center">
            <Crown className="w-20 h-20 text-amber-300" />
          </div>
          <h1 className="text-6xl font-bold text-white">
            VIP 갤러리 투어
          </h1>
          <p className="text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            세계 최고의 미술관과 갤러리를 전문 큐레이터와 함께 탐험하세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 space-y-8">
            <h3 className="text-3xl font-semibold text-white">독점 액세스</h3>
            <div className="space-y-4 text-left">
              <div className="flex items-center space-x-4">
                <Star className="w-6 h-6 text-yellow-400" />
                <span className="text-white/80">비공개 컬렉션 관람</span>
              </div>
              <div className="flex items-center space-x-4">
                <Star className="w-6 h-6 text-yellow-400" />
                <span className="text-white/80">작가와의 직접 만남</span>
              </div>
              <div className="flex items-center space-x-4">
                <Star className="w-6 h-6 text-yellow-400" />
                <span className="text-white/80">전문 큐레이터 가이드</span>
              </div>
              <div className="flex items-center space-x-4">
                <Star className="w-6 h-6 text-yellow-400" />
                <span className="text-white/80">소규모 그룹 (최대 8명)</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 space-y-8">
            <h3 className="text-3xl font-semibold text-white">특별 혜택</h3>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-amber-300">5성급</div>
                <div className="text-white/80">럭셔리 숙박</div>
              </div>
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-orange-300">미슐랭</div>
                <div className="text-white/80">파인다이닝</div>
              </div>
              <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-red-300">전용차</div>
                <div className="text-white/80">프라이빗 교통</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <RainbowButton className="text-xl px-16 py-5 h-16">
            <Crown className="w-6 h-6 mr-3" />
            VIP 투어 예약하기
          </RainbowButton>
          <p className="text-white/60">완전 맞춤형 • 전 세계 • 평생 잊지 못할 경험</p>
        </div>
      </div>
    </div>
  );
};

// SAYU 아트 컬렉터 클럽
export const SayuArtCollectorClub = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 flex items-center justify-center p-8">
      <div className="max-w-5xl mx-auto text-center space-y-16">
        <div className="space-y-8">
          <div className="flex justify-center">
            <Trophy className="w-20 h-20 text-emerald-300" />
          </div>
          <h1 className="text-6xl font-bold text-white">
            아트 컬렉터 클럽
          </h1>
          <p className="text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            진정한 예술품 수집가를 위한 독점적인 멤버십 프로그램
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-6 border border-emerald-500/30">
            <div className="text-emerald-300 text-2xl font-bold">스타터</div>
            <div className="text-4xl font-bold text-white">₩50만/월</div>
            <div className="space-y-3 text-left">
              <div className="text-white/80">• 신진 작가 작품 우선 구매</div>
              <div className="text-white/80">• 월간 큐레이션 리포트</div>
              <div className="text-white/80">• 컬렉터 네트워킹 이벤트</div>
              <div className="text-white/80">• 투자 가치 분석</div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 space-y-6 border-2 border-teal-400 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-teal-400 text-black px-6 py-2 rounded-full text-sm font-bold">
              인기
            </div>
            <div className="text-teal-300 text-2xl font-bold">프로</div>
            <div className="text-4xl font-bold text-white">₩200만/월</div>
            <div className="space-y-3 text-left">
              <div className="text-white/80">• 중견 작가 작품 독점 액세스</div>
              <div className="text-white/80">• 개인 아트 어드바이저</div>
              <div className="text-white/80">• VIP 갤러리 오프닝</div>
              <div className="text-white/80">• 작품 인증 및 감정</div>
              <div className="text-white/80">• 국제 아트페어 초대</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-6 border border-cyan-500/30">
            <div className="text-cyan-300 text-2xl font-bold">마스터</div>
            <div className="text-4xl font-bold text-white">₩500만/월</div>
            <div className="space-y-3 text-left">
              <div className="text-white/80">• 거장급 작품 우선 매칭</div>
              <div className="text-white/80">• 전담 큐레이터 배정</div>
              <div className="text-white/80">• 프라이빗 전시 기획</div>
              <div className="text-white/80">• 글로벌 경매 대리 입찰</div>
              <div className="text-white/80">• 작품 보관 및 관리</div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <RainbowButton className="text-xl px-16 py-5 h-16">
            <Trophy className="w-6 h-6 mr-3" />
            컬렉터 클럽 가입하기
          </RainbowButton>
          <p className="text-white/60">전 세계 500명의 컬렉터가 함께합니다</p>
        </div>
      </div>
    </div>
  );
};

// 버튼 컬렉션 쇼케이스
export const RainbowButtonV2Showcase = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black flex items-center justify-center p-8">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-bold text-white">
            Rainbow Button V2
          </h2>
          <p className="text-xl text-white/70">
            새로운 버전의 레인보우 그라디언트 버튼 컴포넌트
          </p>
        </div>

        {/* 크기별 변형 */}
        <section className="space-y-8">
          <h3 className="text-3xl font-semibold text-white text-center">다양한 크기</h3>
          <div className="flex flex-wrap justify-center items-center gap-8">
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
            <RainbowButton className="h-20 px-16 text-2xl">
              XXL
            </RainbowButton>
          </div>
        </section>

        {/* 아이콘과 함께 */}
        <section className="space-y-8">
          <h3 className="text-3xl font-semibold text-white text-center">프리미엄 액션</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RainbowButton className="w-full">
              <Crown className="w-5 h-5 mr-2" />
              VIP 멤버십
            </RainbowButton>
            <RainbowButton className="w-full">
              <Wand2 className="w-5 h-5 mr-2" />
              AI 창작 시작
            </RainbowButton>
            <RainbowButton className="w-full">
              <Trophy className="w-5 h-5 mr-2" />
              컬렉터 클럽
            </RainbowButton>
            <RainbowButton className="w-full">
              <Gem className="w-5 h-5 mr-2" />
              프리미엄 도구
            </RainbowButton>
            <RainbowButton className="w-full">
              <Gift className="w-5 h-5 mr-2" />
              특별 혜택
            </RainbowButton>
            <RainbowButton className="w-full">
              <Star className="w-5 h-5 mr-2" />
              독점 액세스
            </RainbowButton>
          </div>
        </section>

        {/* 특별 용도 */}
        <section className="space-y-8">
          <h3 className="text-3xl font-semibold text-white text-center">SAYU 특별 기능</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 space-y-6">
              <h4 className="text-2xl font-semibold text-white">창작 도구</h4>
              <div className="space-y-4">
                <RainbowButton className="w-full">
                  <Palette className="w-4 h-4 mr-2" />
                  스타일 변환 시작
                </RainbowButton>
                <RainbowButton className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  감정 표현 AI
                </RainbowButton>
                <RainbowButton className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  즉시 창작하기
                </RainbowButton>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 space-y-6">
              <h4 className="text-2xl font-semibold text-white">프리미엄 서비스</h4>
              <div className="space-y-4">
                <RainbowButton className="w-full">
                  <Crown className="w-4 h-4 mr-2" />
                  VIP 갤러리 투어
                </RainbowButton>
                <RainbowButton className="w-full">
                  <Heart className="w-4 h-4 mr-2" />
                  개인 큐레이터
                </RainbowButton>
                <RainbowButton className="w-full">
                  <Gift className="w-4 h-4 mr-2" />
                  독점 컬렉션
                </RainbowButton>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center">
          <p className="text-white/50">
            V2 버전: 향상된 그라디언트 효과와 성능 최적화
          </p>
        </div>
      </div>
    </div>
  );
};

// 인터랙티브 데모
export const InteractiveRainbowButtonV2Demo = () => {
  const [currentDemo, setCurrentDemo] = React.useState('original');

  const demos = {
    original: <Demo />,
    artCreation: <SayuArtCreationTools />,
    vipTour: <SayuVipGalleryTour />,
    collectorClub: <SayuArtCollectorClub />,
    showcase: <RainbowButtonV2Showcase />
  };

  const demoNames = {
    original: '원본 데모',
    artCreation: '창작 스튜디오',
    vipTour: 'VIP 투어',
    collectorClub: '컬렉터 클럽',
    showcase: 'V2 쇼케이스'
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
const RainbowButtonV2Demo = () => {
  return <InteractiveRainbowButtonV2Demo />;
};

export default RainbowButtonV2Demo;