'use client';

import React from 'react';
import { Awards } from './award';
import { Crown, Star, Trophy, Medal, Award } from 'lucide-react';

// 원본 데모
export function Demo() {
  return (
    <div className="p-8 space-y-8">
      <Awards
        variant="award"
        title="WINNER"
        subtitle="A Design Award & Competition"
        recipient="Ali Imam"
        date="June 2025"
        level="gold"
      />
    </div>
  );
}

// SAYU APT 성과 인증서
export const SayuAptAchievements = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-purple-800 dark:text-purple-200">
            SAYU 성격 테스트 성과
          </h2>
          <p className="text-purple-600 dark:text-purple-300">
            당신의 예술적 성향 발견을 축하합니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Certificate */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6">
            <Awards
              variant="certificate"
              title="APT 분석 완료"
              subtitle="16가지 동물 캐릭터 성격 유형 분석을 성공적으로 완료하였습니다"
              recipient="김예술"
              date="2025년 1월 28일"
            />
          </div>

          {/* Badge */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6">
            <Awards
              variant="badge"
              title="호랑이형"
              subtitle="창의적이고 독립적인 예술 감상 스타일"
              recipient="INFP 성격"
              date="2025.01"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stamps */}
          <Awards
            variant="stamp"
            title="성격 분석"
            subtitle="완료"
            recipient="김예술"
            date="2025.01.28"
          />
          <Awards
            variant="stamp"
            title="취향 매칭"
            subtitle="100% 완료"
            recipient="호랑이형"
            date="2025.01.28"
          />
          <Awards
            variant="stamp"
            title="AI 추천"
            subtitle="활성화"
            recipient="맞춤형"
            date="2025.01.28"
          />
        </div>
      </div>
    </div>
  );
};

// SAYU 전시회 참여 인증
export const SayuExhibitionAwards = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-emerald-800 dark:text-emerald-200">
            전시회 참여 성과
          </h2>
          <p className="text-emerald-600 dark:text-emerald-300">
            예술 작품 감상과 커뮤니티 참여를 인정합니다
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gold Award */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6">
            <Awards
              variant="award"
              title="갤러리 마스터"
              subtitle="50개 이상의 전시회 관람 완료"
              recipient="김예술"
              date="2025년 1월"
              level="gold"
            />
          </div>

          {/* Silver Award */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6">
            <Awards
              variant="award"
              title="커뮤니티 리더"
              subtitle="100명 이상의 팔로워와 활발한 소통"
              recipient="김예술"
              date="2025년 1월"
              level="silver"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ID Cards for different achievements */}
          <Awards
            variant="id-card"
            title="프리미엄"
            subtitle="멤버십"
            description="PREMIUM"
            date="2025"
          />
          <Awards
            variant="id-card"
            title="큐레이터"
            subtitle="레벨"
            description="CURATOR"
            date="2025"
          />
          <Awards
            variant="id-card"
            title="아트러버"
            subtitle="등급"
            description="ART LOVER"
            date="2025"
          />
          <Awards
            variant="id-card"
            title="비평가"
            subtitle="자격"
            description="CRITIC"
            date="2025"
          />
        </div>
      </div>
    </div>
  );
};

// SAYU 특별 성과 스티커
export const SayuStickerCollection = () => {
  const achievements = [
    { title: '첫관람', color: 'text-purple-500' },
    { title: '열정가', color: 'text-pink-500' },
    { title: '비평가', color: 'text-blue-500' },
    { title: '수집가', color: 'text-green-500' },
    { title: '탐험가', color: 'text-yellow-500' },
    { title: '리더', color: 'text-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-orange-800 dark:text-orange-200">
            SAYU 성과 스티커 컬렉션
          </h2>
          <p className="text-orange-600 dark:text-orange-300">
            특별한 순간들을 기념하는 디지털 스티커
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {achievements.map((achievement, index) => (
            <div key={index} className="flex justify-center">
              <Awards
                variant="sticker"
                title={achievement.title}
                className={achievement.color}
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-orange-100 dark:bg-orange-900 rounded-full border border-orange-200 dark:border-orange-800">
            <Trophy className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-orange-800 dark:text-orange-200 font-medium">
              6개의 스티커 수집 완료!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 모든 변형 보여주는 쇼케이스
export const AwardShowcase = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
            Award 컴포넌트 전체 변형
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            6가지 다양한 스타일의 성과 인증 컴포넌트
          </p>
        </div>

        {/* Award Variant */}
        <section className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Award (상장)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Awards variant="award" title="GOLD" subtitle="Excellence Award" recipient="김예술" date="2025" level="gold" />
            <Awards variant="award" title="SILVER" subtitle="Achievement Award" recipient="이작가" date="2025" level="silver" />
            <Awards variant="award" title="BRONZE" subtitle="Participation Award" recipient="박감상" date="2025" level="bronze" />
            <Awards variant="award" title="PLATINUM" subtitle="Master Award" recipient="최큐레이터" date="2025" level="platinum" />
          </div>
        </section>

        {/* Certificate Variant */}
        <section className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Certificate (인증서)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Awards variant="certificate" title="APT 완료" subtitle="성격 유형 분석 완료" recipient="김예술" date="2025-01-28" />
            <Awards variant="certificate" title="갤러리 마스터" subtitle="50회 전시 관람 완료" recipient="이감상" date="2025-01-28" />
          </div>
        </section>

        {/* Badge Variant */}
        <section className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Badge (배지)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Awards variant="badge" title="호랑이형" subtitle="창의적 독립형" recipient="INFP" date="2025.01" />
            <Awards variant="badge" title="나비형" subtitle="자유로운 탐험가" recipient="ESFP" date="2025.01" />
            <Awards variant="badge" title="독수리형" subtitle="분석적 사고형" recipient="INTJ" date="2025.01" />
          </div>
        </section>

        {/* Stamp Variant */}
        <section className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Stamp (도장)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Awards variant="stamp" title="관람완료" subtitle="First Visit" recipient="김예술" date="2025.01.28" />
            <Awards variant="stamp" title="리뷰작성" subtitle="Review Master" recipient="이비평" date="2025.01.28" />
            <Awards variant="stamp" title="팔로우" subtitle="Follower" recipient="박소셜" date="2025.01.28" />
            <Awards variant="stamp" title="추천완료" subtitle="Recommender" recipient="최큐레이터" date="2025.01.28" />
          </div>
        </section>

        {/* ID Card Variant */}
        <section className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">ID Card (멤버십 카드)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Awards variant="id-card" title="PREMIUM" subtitle="멤버십" description="VIP" date="2025" />
            <Awards variant="id-card" title="CURATOR" subtitle="큐레이터" description="PRO" date="2025" />
            <Awards variant="id-card" title="CRITIC" subtitle="비평가" description="EXPERT" date="2025" />
            <Awards variant="id-card" title="ARTIST" subtitle="아티스트" description="CREATOR" date="2025" />
          </div>
        </section>

        {/* Sticker Variant */}
        <section className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Sticker (스티커)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            <Awards variant="sticker" title="신규" className="text-green-500" />
            <Awards variant="sticker" title="열정" className="text-red-500" />
            <Awards variant="sticker" title="탐험" className="text-blue-500" />
            <Awards variant="sticker" title="소통" className="text-purple-500" />
            <Awards variant="sticker" title="수집" className="text-yellow-500" />
            <Awards variant="sticker" title="마스터" className="text-pink-500" />
          </div>
        </section>
      </div>
    </div>
  );
};

// 인터랙티브 데모
export const InteractiveAwardDemo = () => {
  const [currentDemo, setCurrentDemo] = React.useState('original');

  const demos = {
    original: <Demo />,
    aptAchievements: <SayuAptAchievements />,
    exhibitionAwards: <SayuExhibitionAwards />,
    stickerCollection: <SayuStickerCollection />,
    showcase: <AwardShowcase />
  };

  const demoNames = {
    original: '원본 데모',
    aptAchievements: 'APT 성과',
    exhibitionAwards: '전시 성과',
    stickerCollection: '스티커 컬렉션',
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
const AwardDemo = () => {
  return <InteractiveAwardDemo />;
};

export default AwardDemo;