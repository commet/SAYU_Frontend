"use client";
import React from "react";
import { TextRevealByWord } from "@/components/ui/text-reveal";
import { cn } from "@/lib/utils";

// SAYU-specific text reveal implementations
export const SayuMissionReveal = () => {
  return (
    <div className="min-h-[200vh] w-full relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
      <TextRevealByWord text="SAYU는 AI 기반 성격 분석을 통해 당신에게 맞는 예술 작품과 전시를 추천합니다. 각 사용자의 독특한 취향을 반영한 개인화된 예술 여정을 만들어가며, 예술을 통한 깊이 있는 소통과 연결을 지원합니다." />
    </div>
  );
};

// APT 철학 소개용
export const AptPhilosophyReveal = () => {
  return (
    <div className="min-h-[200vh] w-full relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
      <TextRevealByWord text="16가지 동물 캐릭터로 표현되는 APT 성격 유형은 단순한 분류가 아닌 당신의 예술적 DNA를 발견하는 여정입니다. 호랑이의 열정, 고양이의 섬세함, 늑대의 깊이 있는 사고까지 각 유형별 고유한 예술 취향을 탐구하세요." />
    </div>
  );
};

// 커뮤니티 가치 소개용
export const CommunityValueReveal = () => {
  return (
    <div className="min-h-[200vh] w-full relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
      <TextRevealByWord text="SAYU 커뮤니티에서는 예술에 대한 다양한 관점을 나누며 함께 성장합니다. 전시 동행부터 감상 교환까지, 비슷한 취향의 사람들과 만나 더욱 풍부한 예술 경험을 만들어가세요." />
    </div>
  );
};

// AI 기술 철학 소개용
export const AiTechReveal = () => {
  return (
    <div className="min-h-[200vh] w-full relative bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
      <TextRevealByWord text="SAYU의 AI 기술은 단순한 알고리즘을 넘어 인간의 감성과 예술적 직관을 이해합니다. 머신러닝을 통해 학습한 수천 개의 작품 데이터와 사용자 선호도를 결합하여 진정으로 개인화된 추천을 제공합니다." />
    </div>
  );
};

// 예술의 힘 메시지용
export const ArtPowerReveal = () => {
  return (
    <div className="min-h-[200vh] w-full relative bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20">
      <TextRevealByWord text="예술은 우리의 내면을 깊이 있게 들여다보게 하고 새로운 관점으로 세상을 바라보게 합니다. SAYU와 함께 당신만의 예술 이야기를 써내려가며 일상 속에서 아름다움과 영감을 발견하세요." />
    </div>
  );
};

// 원본 데모
export const TextRevealDemo = () => {
  return (
    <div className="min-h-[200vh] w-full relative">
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-5xl mx-auto p-4">
          <div
            className={cn(
              "rounded-lg w-full h-[500px]",
              "border border-neutral-200 dark:border-neutral-800",
              "bg-white/50 dark:bg-black/50 backdrop-blur-sm",
              "flex items-center justify-center",
              "pointer-events-auto"
            )}
          >
            <TextRevealByWord text="Magic UI will change the way you design." />
          </div>
        </div>
      </div>

      <div className="h-[200vh]" aria-hidden="true" />
    </div>
  );
};

// 인터랙티브 데모 (여러 메시지 전환)
export const InteractiveSayuTextReveal = () => {
  const [currentDemo, setCurrentDemo] = React.useState('mission');

  const demos = {
    mission: <SayuMissionReveal />,
    apt: <AptPhilosophyReveal />,
    community: <CommunityValueReveal />,
    ai: <AiTechReveal />,
    art: <ArtPowerReveal />
  };

  const demoNames = {
    mission: 'SAYU 미션',
    apt: 'APT 철학',
    community: '커뮤니티',
    ai: 'AI 기술',
    art: '예술의 힘'
  };

  return (
    <div className="relative">
      {/* 데모 전환 버튼 */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {Object.keys(demos).map((key) => (
          <button
            key={key}
            onClick={() => setCurrentDemo(key)}
            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
              currentDemo === key
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white/20 text-black dark:text-white border border-gray-300 dark:border-white/30 hover:bg-gray-100 dark:hover:bg-white/30'
            }`}
          >
            {demoNames[key as keyof typeof demoNames]}
          </button>
        ))}
      </div>

      {/* 데모 콘텐츠 */}
      {demos[currentDemo as keyof typeof demos]}
    </div>
  );
};

const Demo = () => {
  return <InteractiveSayuTextReveal />;
};

export default Demo;