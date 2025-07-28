"use client";
import React from "react";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

// SAYU-specific testimonials
const sayuTestimonials = [
  {
    quote: "SAYU의 APT 테스트를 통해 제가 몰랐던 예술적 취향을 발견했어요. 호랑이 유형으로 나온 결과가 정말 정확했고, 추천받은 전시들도 모두 제 마음에 들었습니다.",
    name: "김서현",
    designation: "디자이너, 27세",
    src: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=500&h=500&fit=crop&crop=face"
  },
  {
    quote: "예술에 관심은 있었지만 어디서부터 시작해야 할지 막막했는데, SAYU가 저에게 맞는 갤러리와 작품들을 추천해주니까 예술 감상이 훨씬 즐거워졌어요.",
    name: "박지민",
    designation: "마케터, 31세", 
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=face"
  },
  {
    quote: "전시 동행 기능이 정말 좋아요. 혼자 가기 부담스러웠던 미술관도 비슷한 취향의 사람들과 함께 가니까 더 깊이 있는 감상을 할 수 있었습니다.",
    name: "최유진",
    designation: "대학생, 23세",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&fit=crop&crop=face"
  },
  {
    quote: "AI가 생성한 아트 프로필이 놀라울 정도로 제 성격을 잘 반영했어요. 친구들과 서로의 프로필을 비교해보는 재미도 쏠쏠하고, SNS에 공유하기도 좋아요.",
    name: "이동현",
    designation: "개발자, 29세",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=500&fit=crop&crop=face"
  },
  {
    quote: "SAYU를 통해 같은 관심사를 가진 사람들과 만날 수 있어서 좋았어요. 감상 교환 기능으로 다양한 관점을 배우고, 예술에 대한 이해의 폭이 넓어졌습니다.",
    name: "정민아",
    designation: "회사원, 25세",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=500&fit=crop&crop=face"
  }
];

// APT 테스트 후기
const aptTestimonials = [
  {
    quote: "16가지 동물 유형으로 성격을 분석하는 방식이 독특하고 재미있어요. 제가 고양이 유형이라는 결과를 보고 정말 많이 공감했습니다.",
    name: "홍수아",
    designation: "그래픽 디자이너",
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=500&fit=crop&crop=face"
  },
  {
    quote: "APT 결과를 바탕으로 한 맞춤형 예술 추천이 정말 정확해요. 늑대 유형에 맞는 깊이 있는 작품들을 추천받아서 만족도가 높았습니다.",
    name: "강태우",
    designation: "건축가",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop&crop=face"
  },
  {
    quote: "친구들과 함께 APT 테스트를 해보니 각자의 성향이 어떻게 다른지 알 수 있어서 흥미로웠어요. 토끼 유형인 저에게 딱 맞는 추천을 받았습니다.",
    name: "윤채영",
    designation: "교사",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop&crop=face"
  }
];

// 원본 데모 데이터
const originalTestimonials = [
  {
    quote:
      "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
    name: "Sarah Chen",
    designation: "Product Manager at TechFlow",
    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
    name: "Michael Rodriguez",
    designation: "CTO at InnovateSphere",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
    name: "Emily Watson",
    designation: "Operations Director at CloudScale",
    src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
    name: "James Kim",
    designation: "Engineering Lead at DataPro",
    src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "The scalability and performance have been game-changing for our organization. Highly recommend to any growing business.",
    name: "Lisa Thompson",
    designation: "VP of Technology at FutureNet",
    src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

// SAYU 메인 후기
export const SayuTestimonialsDemo = () => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
      <div className="text-center py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-purple-800 dark:text-purple-200 mb-4">
          SAYU 사용자들의 생생한 후기
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          AI 기반 예술 추천으로 새로운 예술 경험을 만나보세요
        </p>
      </div>
      <AnimatedTestimonials testimonials={sayuTestimonials} autoplay={true} />
    </div>
  );
};

// APT 테스트 후기
export const AptTestimonialsDemo = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
      <div className="text-center py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-blue-800 dark:text-blue-200 mb-4">
          APT 테스트 체험 후기
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          16가지 동물 캐릭터로 발견하는 나만의 예술 성향
        </p>
      </div>
      <AnimatedTestimonials testimonials={aptTestimonials} autoplay={true} />
    </div>
  );
};

// 원본 데모
export const AnimatedTestimonialsDemo = () => {
  return <AnimatedTestimonials testimonials={originalTestimonials} />;
};

// 인터랙티브 데모 (여러 후기 전환)
export const InteractiveSayuTestimonials = () => {
  const [currentDemo, setCurrentDemo] = React.useState('sayu');

  const demos = {
    sayu: <SayuTestimonialsDemo />,
    apt: <AptTestimonialsDemo />,
    original: <AnimatedTestimonialsDemo />
  };

  const demoNames = {
    sayu: 'SAYU 후기',
    apt: 'APT 후기', 
    original: '원본 데모'
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
  return <InteractiveSayuTestimonials />;
};

export default Demo;