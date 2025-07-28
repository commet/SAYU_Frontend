'use client';

import { Component } from "@/components/ui/etheral-shadow";

// SAYU-specific ethereal shadow implementations
export const SayuEtheralShadow = () => {
  return (
    <div className="flex w-full h-screen justify-center items-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
      <Component
        color="rgba(147, 51, 234, 0.8)" // Purple theme for SAYU
        animation={{ scale: 100, speed: 90 }}
        noise={{ opacity: 1, scale: 1.2 }}
        sizing="fill"
        className="w-4/5 h-4/5 rounded-2xl shadow-2xl"
      />
    </div>
  );
};

// APT 성격 테스트용 버전
export const AptEtheralShadow = () => {
  return (
    <div className="flex w-full h-screen justify-center items-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
      <div className="w-4/5 h-4/5 rounded-2xl shadow-2xl relative overflow-hidden">
        <Component
          color="rgba(59, 130, 246, 0.7)" // Blue theme for APT
          animation={{ scale: 80, speed: 70 }}
          noise={{ opacity: 0.8, scale: 1.5 }}
          sizing="stretch"
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-30">
          <h1 className="md:text-7xl text-6xl lg:text-8xl font-bold text-white relative z-20 mb-4">
            APT 테스트
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            당신의 예술적 성향을 발견하세요
          </p>
        </div>
      </div>
    </div>
  );
};

// 갤러리용 버전
export const GalleryEtheralShadow = () => {
  return (
    <div className="flex w-full h-screen justify-center items-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
      <div className="w-4/5 h-4/5 rounded-2xl shadow-2xl relative overflow-hidden">
        <Component
          color="rgba(16, 185, 129, 0.6)" // Emerald theme for gallery
          animation={{ scale: 60, speed: 50 }}
          noise={{ opacity: 0.6, scale: 1.0 }}
          sizing="fill"
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-30">
          <h1 className="md:text-7xl text-6xl lg:text-8xl font-bold text-white relative z-20 mb-4">
            SAYU 갤러리
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            AI가 큐레이션한 맞춤 예술 작품
          </p>
        </div>
      </div>
    </div>
  );
};

// 감정 표현용 버전 (다양한 컬러)
export const EmotionEtheralShadow = ({ emotion = "joy" }: { emotion?: string }) => {
  const emotionColors = {
    joy: "rgba(251, 191, 36, 0.8)", // Yellow
    calm: "rgba(147, 197, 253, 0.8)", // Light blue
    excited: "rgba(239, 68, 68, 0.8)", // Red
    melancholy: "rgba(139, 92, 246, 0.8)", // Purple
    inspired: "rgba(34, 197, 94, 0.8)", // Green
    nostalgic: "rgba(236, 72, 153, 0.8)" // Pink
  };

  const emotionNames = {
    joy: "기쁨",
    calm: "평온",
    excited: "흥분",
    melancholy: "우울",
    inspired: "영감",
    nostalgic: "향수"
  };

  return (
    <div className="flex w-full h-screen justify-center items-center bg-black">
      <div className="w-4/5 h-4/5 rounded-2xl shadow-2xl relative overflow-hidden">
        <Component
          color={emotionColors[emotion as keyof typeof emotionColors] || emotionColors.joy}
          animation={{ scale: 90, speed: 80 }}
          noise={{ opacity: 0.7, scale: 1.3 }}
          sizing="fill"
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-30">
          <h1 className="md:text-7xl text-6xl lg:text-8xl font-bold text-white relative z-20 mb-4">
            {emotionNames[emotion as keyof typeof emotionNames] || "감정"}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            예술로 표현하는 내면의 세계
          </p>
        </div>
      </div>
    </div>
  );
};

// 원본 데모
export const DemoOne = () => {
  return (
    <div className="flex w-full h-screen justify-center items-center">
      <Component
        color="rgba(128, 128, 128, 1)"
        animation={{ scale: 100, speed: 90 }}
        noise={{ opacity: 1, scale: 1.2 }}
        sizing="fill"
      />
    </div>
  );
};

// 인터랙티브 데모 (여러 감정 전환)
export const InteractiveEmotionDemo = () => {
  const [currentEmotion, setCurrentEmotion] = React.useState("joy");
  
  const emotions = ["joy", "calm", "excited", "melancholy", "inspired", "nostalgic"];
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmotion(prev => {
        const currentIndex = emotions.indexOf(prev);
        return emotions[(currentIndex + 1) % emotions.length];
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return <EmotionEtheralShadow emotion={currentEmotion} />;
};

const Demo = () => {
  const [currentDemo, setCurrentDemo] = React.useState('sayu');

  return (
    <div className="min-h-screen relative">
      {/* 데모 전환 버튼 */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={() => setCurrentDemo('sayu')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentDemo === 'sayu'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
          }`}
        >
          SAYU
        </button>
        <button
          onClick={() => setCurrentDemo('apt')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentDemo === 'apt'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
          }`}
        >
          APT
        </button>
        <button
          onClick={() => setCurrentDemo('gallery')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentDemo === 'gallery'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
          }`}
        >
          갤러리
        </button>
        <button
          onClick={() => setCurrentDemo('emotion')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentDemo === 'emotion'
              ? 'bg-pink-600 text-white shadow-lg'
              : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
          }`}
        >
          감정
        </button>
      </div>

      {/* 데모 콘텐츠 */}
      {currentDemo === 'sayu' && <SayuEtheralShadow />}
      {currentDemo === 'apt' && <AptEtheralShadow />}
      {currentDemo === 'gallery' && <GalleryEtheralShadow />}
      {currentDemo === 'emotion' && <InteractiveEmotionDemo />}
    </div>
  );
};

export default Demo;