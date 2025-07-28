"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Image from "next/image";

// SAYU-specific container scroll implementations
export const SayuGalleryScroll = () => {
  return (
    <div className="flex flex-col overflow-hidden pb-[500px] pt-[1000px]">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              SAYU에서 만나는 <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-purple-600 dark:text-purple-400">
                예술의 세계
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
              AI가 큐레이션한 맞춤형 갤러리에서 당신만의 예술 여정을 시작하세요
            </p>
          </>
        }
      >
        <Image
          src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1400&h=720&fit=crop&crop=center"
          alt="SAYU 갤러리 - 현대 미술관 내부"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-center"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
};

// APT 성격 테스트용 버전
export const AptTestScroll = () => {
  return (
    <div className="flex flex-col overflow-hidden pb-[500px] pt-[1000px]">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              당신의 예술적 DNA를 <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-blue-600 dark:text-blue-400">
                발견하세요
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
              16가지 동물 캐릭터로 분석하는 나만의 예술 성향 테스트
            </p>
          </>
        }
      >
        <Image
          src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1400&h=720&fit=crop&crop=center"
          alt="APT 테스트 - 다양한 예술작품 콜라주"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-center"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
};

// 전시 동행 기능용 버전
export const ExhibitionCompanionScroll = () => {
  return (
    <div className="flex flex-col overflow-hidden pb-[500px] pt-[1000px]">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              함께 나누는 <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-emerald-600 dark:text-emerald-400">
                예술 감상
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
              비슷한 취향의 사람들과 전시회를 함께 관람하고 감상을 나누세요
            </p>
          </>
        }
      >
        <Image
          src="https://images.unsplash.com/photo-1544967882-0d1ba7b8b6b7?w=1400&h=720&fit=crop&crop=center"
          alt="전시 동행 - 사람들이 함께 미술관을 관람하는 모습"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-center"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
};

// AI 아트 프로필용 버전
export const ArtProfileScroll = () => {
  return (
    <div className="flex flex-col overflow-hidden pb-[500px] pt-[1000px]">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              AI가 만든 <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-pink-600 dark:text-pink-400">
                당신의 아트 프로필
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
              개성과 취향을 반영한 나만의 예술 아바타를 생성해보세요
            </p>
          </>
        }
      >
        <Image
          src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1400&h=720&fit=crop&crop=center"
          alt="AI 아트 프로필 - 디지털 아트 작품"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-center"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
};

// 원본 데모
export const HeroScrollDemo = () => {
  return (
    <div className="flex flex-col overflow-hidden pb-[500px] pt-[1000px]">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              Unleash the power of <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                Scroll Animations
              </span>
            </h1>
          </>
        }
      >
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=720&fit=crop&crop=center"
          alt="hero"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
};

// 인터랙티브 데모 (여러 테마 전환)
export const InteractiveSayuScrollDemo = () => {
  const [currentDemo, setCurrentDemo] = React.useState('gallery');

  const demos = {
    gallery: <SayuGalleryScroll />,
    apt: <AptTestScroll />,
    companion: <ExhibitionCompanionScroll />,
    profile: <ArtProfileScroll />
  };

  return (
    <div className="relative">
      {/* 데모 전환 버튼 */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={() => setCurrentDemo('gallery')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentDemo === 'gallery'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white/20 text-black dark:text-white border border-gray-300 dark:border-white/30 hover:bg-gray-100 dark:hover:bg-white/30'
          }`}
        >
          갤러리
        </button>
        <button
          onClick={() => setCurrentDemo('apt')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentDemo === 'apt'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white/20 text-black dark:text-white border border-gray-300 dark:border-white/30 hover:bg-gray-100 dark:hover:bg-white/30'
          }`}
        >
          APT
        </button>
        <button
          onClick={() => setCurrentDemo('companion')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentDemo === 'companion'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-white/20 text-black dark:text-white border border-gray-300 dark:border-white/30 hover:bg-gray-100 dark:hover:bg-white/30'
          }`}
        >
          동행
        </button>
        <button
          onClick={() => setCurrentDemo('profile')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentDemo === 'profile'
              ? 'bg-pink-600 text-white shadow-lg'
              : 'bg-white/20 text-black dark:text-white border border-gray-300 dark:border-white/30 hover:bg-gray-100 dark:hover:bg-white/30'
          }`}
        >
          프로필
        </button>
      </div>

      {/* 데모 콘텐츠 */}
      {demos[currentDemo as keyof typeof demos]}
    </div>
  );
};

const Demo = () => {
  return <InteractiveSayuScrollDemo />;
};

export default Demo;