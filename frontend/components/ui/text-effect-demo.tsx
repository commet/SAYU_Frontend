'use client';

import React, { useState, useEffect } from "react";
import { TextEffect } from "@/components/ui/text-effect";

// SAYU-specific text effects
export const SayuWelcomeEffect = () => {
  return (
    <div className="h-[300px] flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8">
      <TextEffect 
        per='char' 
        preset='scale'
        className="text-4xl md:text-6xl font-bold text-purple-600 dark:text-purple-400 text-center"
      >
        SAYU에 오신 것을 환영합니다
      </TextEffect>
    </div>
  );
};

// APT 테스트 결과 발표 효과
export const AptResultEffect = () => {
  const [currentAnimal, setCurrentAnimal] = useState("호랑이");
  const animals = ["호랑이", "고양이", "늑대", "토끼", "사자", "독수리"];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnimal(prev => {
        const currentIndex = animals.indexOf(prev);
        return animals[(currentIndex + 1) % animals.length];
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[300px] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-8">
      <TextEffect 
        per='word' 
        preset='slide'
        className="text-2xl text-gray-600 dark:text-gray-300 mb-4 text-center"
      >
        당신의 예술 성향은
      </TextEffect>
      <TextEffect 
        key={currentAnimal}
        per='char' 
        preset='blur'
        className="text-5xl md:text-7xl font-bold text-blue-600 dark:text-blue-400 text-center"
      >
        {currentAnimal} 유형
      </TextEffect>
    </div>
  );
};

// 감정 표현 애니메이션
export const EmotionEffect = () => {
  const getRandomColor = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const emotionVariants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
        },
      },
    },
    item: {
      hidden: () => ({
        opacity: 0,
        y: Math.random() * 50 - 25,
        scale: 0.5,
      }),
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        color: getRandomColor(),
        transition: {
          type: 'spring',
          damping: 12,
          stiffness: 200,
        },
      },
    },
  };

  return (
    <div className="h-[300px] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-8">
      <TextEffect 
        per='word' 
        variants={emotionVariants}
        className="text-3xl md:text-5xl font-bold text-center"
      >
        예술로 표현하는 감정의 스펙트럼
      </TextEffect>
    </div>
  );
};

// 기능 소개 시차 효과
export const FeatureIntroEffect = () => {
  return (
    <div className="h-[400px] flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 p-8 space-y-4">
      <TextEffect
        per='char'
        delay={0.5}
        preset='fade'
        className="text-2xl md:text-3xl font-bold text-violet-600 dark:text-violet-400 text-center"
      >
        AI 기반 개인화 추천
      </TextEffect>
      <TextEffect 
        per='word' 
        delay={1.5}
        preset='slide'
        className="text-lg text-gray-600 dark:text-gray-300 text-center"
      >
        머신러닝으로 분석하는 당신만의 예술 취향
      </TextEffect>
      <TextEffect
        per='char'
        delay={2.5}
        className='text-sm text-gray-500 dark:text-gray-400 text-center'
        preset='blur'
      >
        (개성을 존중하는 맞춤형 큐레이션)
      </TextEffect>
    </div>
  );
};

// 갤러리 소개 라인별 효과
export const GalleryIntroEffect = () => {
  return (
    <div className="h-[400px] flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 p-8">
      <TextEffect
        per='line'
        as='div'
        segmentWrapperClassName='overflow-hidden block'
        className="text-xl md:text-2xl text-center text-rose-600 dark:text-rose-400 font-medium leading-relaxed"
        variants={{
          container: {
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.3 },
            },
          },
          item: {
            hidden: {
              opacity: 0,
              y: 40,
            },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.6,
                ease: "easeOut",
              },
            },
          },
        }}
      >
        {`SAYU 갤러리에서 만나는 특별한 예술 경험
AI가 큐레이션한 개인 맞춤 작품들
당신의 감성을 자극하는 새로운 발견`}
      </TextEffect>
    </div>
  );
};

// 동적 텍스트 전환 효과
export const DynamicTextEffect = () => {
  const [trigger, setTrigger] = useState(true);
  const [textIndex, setTextIndex] = useState(0);
  
  const texts = [
    "예술을 통한 자아 발견",
    "AI와 함께하는 큐레이션",
    "개성을 존중하는 추천"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTrigger(false);
      setTimeout(() => {
        setTextIndex(prev => (prev + 1) % texts.length);
        setTrigger(true);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const dynamicVariants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
      },
      exit: {
        transition: { staggerChildren: 0.02, staggerDirection: 1 },
      },
    },
    item: {
      hidden: {
        opacity: 0,
        filter: 'blur(10px)',
        y: 20,
      },
      visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
          duration: 0.4,
        },
      },
      exit: {
        opacity: 0,
        y: -20,
        filter: 'blur(10px)',
        transition: {
          duration: 0.3,
        },
      },
    },
  };

  return (
    <div className="h-[300px] flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-8">
      <TextEffect
        key={textIndex}
        className='text-3xl md:text-5xl font-bold text-indigo-600 dark:text-indigo-400 text-center'
        per='char'
        variants={dynamicVariants}
        trigger={trigger}
      >
        {texts[textIndex]}
      </TextEffect>
    </div>
  );
};

// 원본 데모들
export function TextEffectPerChar() {
  return (
    <TextEffect per='char' preset='fade'>
      Animate your ideas with motion-primitives
    </TextEffect>
  );
}

export function TextEffectWithPreset() {
  return (
    <TextEffect per='word' as='h3' preset='slide'>
      Animate your ideas with motion-primitives
    </TextEffect>
  );
}

export function TextEffectWithCustomVariants() {
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const fancyVariants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05,
        },
      },
    },
    item: {
      hidden: () => ({
        opacity: 0,
        y: Math.random() * 100 - 50,
        rotate: Math.random() * 90 - 45,
        scale: 0.3,
        color: getRandomColor(),
      }),
      visible: {
        opacity: 1,
        y: 0,
        rotate: 0,
        scale: 1,
        color: getRandomColor(),
        transition: {
          type: 'spring',
          damping: 12,
          stiffness: 200,
        },
      },
    },
  };

  return (
    <TextEffect per='word' variants={fancyVariants}>
      Animate your ideas with motion-primitives
    </TextEffect>
  );
}

export function TextEffectWithCustomDelay() {
  return (
    <div className='flex flex-col space-y-0'>
      <TextEffect
        per='char'
        delay={0.5}
        variants={{
          container: {
            hidden: {
              opacity: 0,
            },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
              },
            },
          },
          item: {
            hidden: {
              opacity: 0,
              rotateX: 90,
              y: 10,
            },
            visible: {
              opacity: 1,
              rotateX: 0,
              y: 0,
              transition: {
                duration: 0.2,
              },
            },
          },
        }}
      >
        Animate your ideas
      </TextEffect>
      <TextEffect per='char' delay={1.5}>
        with motion-primitives
      </TextEffect>
      <TextEffect
        per='char'
        delay={2.5}
        className='pt-12 text-xs'
        preset='blur'
      >
        (and delay!)
      </TextEffect>
    </div>
  );
}

export function TextEffectPerLine() {
  return (
    <TextEffect
      per='line'
      as='p'
      segmentWrapperClassName='overflow-hidden block'
      variants={{
        container: {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 },
          },
        },
        item: {
          hidden: {
            opacity: 0,
            y: 40,
          },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.4,
            },
          },
        },
      }}
    >
      {`now live on motion-primitives!
now live on motion-primitives!
now live on motion-primitives!`}
    </TextEffect>
  );
}

export function TextEffectWithExit() {
  const [trigger, setTrigger] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrigger((prev) => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);
  
  const blurSlideVariants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.01 },
      },
      exit: {
        transition: { staggerChildren: 0.01, staggerDirection: 1 },
      },
    },
    item: {
      hidden: {
        opacity: 0,
        filter: 'blur(10px) brightness(0%)',
        y: 0,
      },
      visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px) brightness(100%)',
        transition: {
          duration: 0.4,
        },
      },
      exit: {
        opacity: 0,
        y: -30,
        filter: 'blur(10px) brightness(0%)',
        transition: {
          duration: 0.4,
        },
      },
    },
  };

  return (
    <TextEffect
      className='inline-flex'
      per='char'
      variants={blurSlideVariants}
      trigger={trigger}
    >
      Animate your ideas with motion-primitives
    </TextEffect>
  );
}

// 인터랙티브 데모 (여러 효과 전환)
export const InteractiveSayuTextEffect = () => {
  const [currentDemo, setCurrentDemo] = useState('welcome');

  const demos = {
    welcome: <SayuWelcomeEffect />,
    aptResult: <AptResultEffect />,
    emotion: <EmotionEffect />,
    feature: <FeatureIntroEffect />,
    gallery: <GalleryIntroEffect />,
    dynamic: <DynamicTextEffect />
  };

  const demoNames = {
    welcome: '환영',
    aptResult: 'APT 결과',
    emotion: '감정',
    feature: '기능 소개',
    gallery: '갤러리',
    dynamic: '동적 전환'
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
  return <InteractiveSayuTextEffect />;
};

export default Demo;