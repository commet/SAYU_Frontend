'use client';

import React, { useState } from 'react';
import { NavbarHero } from "@/components/ui/hero-with-video";

// New demo based on provided requirements
export const DemoOne = () => {
  return (
    <NavbarHero
      brandName="TechFlow"
      heroTitle="Innovation Meets Simplicity"
      heroSubtitle="Early Access Available"
      heroDescription="Discover cutting-edge solutions designed for the modern digital landscape."
      emailPlaceholder="enter@email.com"
      backgroundImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80"
      videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
    />
  );
};

// SAYU-specific hero variants
export const SayuMainHero = () => {
  return (
    <NavbarHero
      brandName="SAYU"
      heroTitle="당신만의 예술 여정을 시작하세요"
      heroSubtitle="AI가 분석하는 개인 맞춤 예술 큐레이션"
      heroDescription="16가지 성격 유형으로 발견하는 나만의 예술 취향과 감성. 매일 새로운 작품들과의 만남을 경험해보세요."
      emailPlaceholder="이메일을 입력하세요"
      backgroundImage="https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80"
      videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    />
  );
};

export const AptTestHero = () => {
  return (
    <NavbarHero
      brandName="SAYU"
      heroTitle="당신은 어떤 동물 유형인가요?"
      heroSubtitle="16가지 동물 캐릭터로 알아보는 예술 성향"
      heroDescription="AI가 분석하는 성격 테스트로 나만의 예술적 감성과 취향을 발견해보세요. 소요시간 약 5분."
      emailPlaceholder="결과를 받을 이메일"
      backgroundImage="https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80"
      videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    />
  );
};

export const GalleryHero = () => {
  return (
    <NavbarHero
      brandName="SAYU"
      heroTitle="AI가 큐레이션한 개인 맞춤 갤러리"
      heroSubtitle="당신의 감성에 맞는 작품들을 만나보세요"
      heroDescription="성향과 감정 상태에 맞춰 매일 새롭게 추천되는 50,000여 점의 예술 작품들을 탐험하세요."
      emailPlaceholder="갤러리 알림 받기"
      backgroundImage="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80"
      videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
    />
  );
};

export const CommunityHero = () => {
  return (
    <NavbarHero
      brandName="SAYU"
      heroTitle="예술로 연결되는 커뮤니티"
      heroSubtitle="같은 취향의 사람들과 함께하는 특별한 경험"
      heroDescription="전시 동행, 감상 교환, 실시간 갤러리 탐험까지. 예술을 사랑하는 사람들과의 깊이 있는 만남."
      emailPlaceholder="커뮤니티 참여하기"
      backgroundImage="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80"
      videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4"
    />
  );
};

// Original demo component
export const OriginalDemo = () => {
  return (
    <NavbarHero
      brandName="nexus"
      heroTitle="Innovation Meets Simplicity"
      heroSubtitle="Join the community"
      heroDescription="Discover cutting-edge solutions designed for the modern digital landscape."
      emailPlaceholder="enter@email.com"
      backgroundImage="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80"
      videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    />
  );
};

// Interactive demo component
export const InteractiveHeroWithVideoDemo = () => {
  const [currentDemo, setCurrentDemo] = useState('demoOne');

  const demos = {
    demoOne: <DemoOne />,
    sayuMain: <SayuMainHero />,
    aptTest: <AptTestHero />,
    gallery: <GalleryHero />,
    community: <CommunityHero />,
    original: <OriginalDemo />
  };

  const demoNames = {
    demoOne: 'TechFlow',
    sayuMain: 'SAYU 메인',
    aptTest: 'APT 테스트',
    gallery: '갤러리',
    community: '커뮤니티',
    original: '원본 데모'
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
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white/90 text-gray-800 border border-gray-200 hover:bg-gray-100 backdrop-blur-sm'
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
const Demo = () => {
  return <InteractiveHeroWithVideoDemo />;
};

export default Demo;