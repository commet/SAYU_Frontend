"use client";
import * as React from "react";
import { GooeyText } from "@/components/ui/gooey-text-morphing";

// SAYU-specific gooey text implementations
export const SayuBrandMorphing = () => {
  const brandTexts = ["SAYU", "예술", "AI", "개성", "연결"];
  
  return (
    <div className="h-[400px] flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
      <GooeyText
        texts={brandTexts}
        morphTime={1.2}
        cooldownTime={0.5}
        className="font-bold mb-8"
        textClassName="text-purple-600 dark:text-purple-400"
      />
      <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-md">
        AI 기반 예술 추천으로 당신만의 개성을 발견하세요
      </p>
    </div>
  );
};

// APT 캐릭터 모핑
export const AptCharacterMorphing = () => {
  const animalTexts = ["호랑이", "고양이", "늑대", "토끼", "사자"];
  
  return (
    <div className="h-[400px] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
      <GooeyText
        texts={animalTexts}
        morphTime={1.5}
        cooldownTime={0.8}
        className="font-bold mb-8"
        textClassName="text-blue-600 dark:text-blue-400"
      />
      <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-md">
        16가지 동물 캐릭터 중 당신은 어떤 유형인가요?
      </p>
    </div>
  );
};

// 감정 표현 모핑
export const EmotionMorphing = () => {
  const emotionTexts = ["기쁨", "평온", "영감", "설렘", "감동"];
  
  return (
    <div className="h-[400px] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
      <GooeyText
        texts={emotionTexts}
        morphTime={1.0}
        cooldownTime={0.3}
        className="font-bold mb-8"
        textClassName="text-emerald-600 dark:text-emerald-400"
      />
      <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-md">
        예술을 통해 느끼는 다양한 감정들을 표현해보세요
      </p>
    </div>
  );
};

// 기술 키워드 모핑
export const TechMorphing = () => {
  const techTexts = ["AI", "머신러닝", "개인화", "추천", "큐레이션"];
  
  return (
    <div className="h-[400px] flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
      <GooeyText
        texts={techTexts}
        morphTime={0.8}
        cooldownTime={0.4}
        className="font-bold mb-8"
        textClassName="text-violet-600 dark:text-violet-400"
      />
      <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-md">
        최첨단 AI 기술로 구현되는 개인화된 예술 경험
      </p>
    </div>
  );
};

// 예술 장르 모핑
export const ArtGenreMorphing = () => {
  const genreTexts = ["회화", "조각", "사진", "설치", "미디어"];
  
  return (
    <div className="h-[400px] flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20">
      <GooeyText
        texts={genreTexts}
        morphTime={1.3}
        cooldownTime={0.6}
        className="font-bold mb-8"
        textClassName="text-rose-600 dark:text-rose-400"
      />
      <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-md">
        다양한 예술 장르를 통해 새로운 시각을 경험하세요
      </p>
    </div>
  );
};

// 원본 데모
export const GooeyTextDemo = () => {
  return (
    <div className="h-[200px] flex items-center justify-center">
      <GooeyText
        texts={["Design", "Engineering", "Is", "Awesome"]}
        morphTime={1}
        cooldownTime={0.25}
        className="font-bold"
      />
    </div>
  );
};

// 인터랙티브 데모 (여러 테마 전환)
export const InteractiveSayuGooeyText = () => {
  const [currentDemo, setCurrentDemo] = React.useState('brand');

  const demos = {
    brand: <SayuBrandMorphing />,
    character: <AptCharacterMorphing />,
    emotion: <EmotionMorphing />,
    tech: <TechMorphing />,
    genre: <ArtGenreMorphing />,
    original: <GooeyTextDemo />
  };

  const demoNames = {
    brand: '브랜드',
    character: '캐릭터',
    emotion: '감정',
    tech: '기술',
    genre: '장르',
    original: '원본'
  };

  return (
    <div className="relative min-h-screen">
      {/* 데모 전환 버튼 */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {Object.keys(demos).map((key) => (
          <button
            key={key}
            onClick={() => setCurrentDemo(key)}
            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
              currentDemo === key
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white/80 text-black border border-gray-300 hover:bg-gray-100'
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
  return <InteractiveSayuGooeyText />;
};

export default Demo;