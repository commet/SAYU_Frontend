'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useResponsive } from '@/lib/responsive';
import dynamic from 'next/dynamic';

// 모바일 홈페이지 컴포넌트 동적 로드 (Fixed 버전 사용)
const MobileHomePage = dynamic(() => import('./MobileHomePageFixed'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-white text-sm font-medium animate-pulse">SAYU</p>
      </div>
    </div>
  ),
});

// 작품 이미지 - 저작권 free 작품들 사용

// 저작권 free 유명 작품들 (Public Domain)
const famousArtworks = [
  {
    id: 1,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    title: '별이 빛나는 밤',
    title_en: 'Starry Night',
    artist: '빈센트 반 고흐',
    artist_en: 'Vincent van Gogh',
    perceptions: [
      "소용돌이치는 불안감",
      "우주와의 교감",
      "붓질의 역동적 리듬",
      "생명력 넘치는 밤하늘",
      "후기인상주의 기법",
      "희망의 별빛"
    ],
    perceptions_en: [
      "Swirling anxiety",
      "Cosmic connection",
      "Dynamic brush rhythm",
      "Vibrant night sky",
      "Post-impressionist technique",
      "Hopeful starlight"
    ]
  },
  {
    id: 2,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Monet_Water_Lilies_1916.jpg/1280px-Monet_Water_Lilies_1916.jpg',
    title: '수련',
    title_en: 'Water Lilies',
    artist: '클로드 모네',
    artist_en: 'Claude Monet',
    perceptions: [
      "시간이 멈춘 연못",
      "빛의 순간적 포착",
      "명상의 순간",
      "인상주의 색채론",
      "흐릿한 경계",
      "평온한 무의식"
    ],
    perceptions_en: [
      "Timeless pond",
      "Captured light",
      "Meditative moment",
      "Impressionist color theory",
      "Blurred boundaries",
      "Peaceful unconscious"
    ]
  },
  {
    id: 3,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gustav_Klimt_016.jpg/800px-Gustav_Klimt_016.jpg',
    title: '키스',
    title_en: 'The Kiss',
    artist: '구스타프 클림트',
    artist_en: 'Gustav Klimt',
    perceptions: [
      "황금빛 영원",
      "비잔틴 양식의 현대화",
      "관능적 신성함",
      "보호하는 포옹",
      "장식미술의 정수",
      "벼랑 끝의 열정"
    ],
    perceptions_en: [
      "Golden eternity",
      "Modernized Byzantine style",
      "Sensual divinity",
      "Protective embrace",
      "Essence of decorative art",
      "Passion on the edge"
    ]
  },
  {
    id: 4,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    title: '모나리자',
    title_en: 'Mona Lisa',
    artist: '레오나르도 다 빈치',
    artist_en: 'Leonardo da Vinci',
    perceptions: [
      "신비로운 미소",
      "스푸마토 기법의 극치",
      "내면의 비밀",
      "르네상스 초상화의 혁신",
      "침묵의 대화",
      "시간을 초월한 아름다움"
    ],
    perceptions_en: [
      "Enigmatic smile",
      "Sfumato technique perfected",
      "Inner secrets",
      "Renaissance portrait revolution",
      "Silent conversation",
      "Timeless beauty"
    ]
  },
  {
    id: 5,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/1280px-The_Great_Wave_off_Kanagawa.jpg',
    title: '가나가와 해변의 큰 파도',
    title_en: 'The Great Wave off Kanagawa',
    artist: '가쓰시카 호쿠사이',
    artist_en: 'Katsushika Hokusai',
    perceptions: [
      "자연의 위대함",
      "순간의 긴장감",
      "삶과 죽음의 경계",
      "역동적 평형",
      "우키요에 판화의 정점",
      "파도 속 후지산"
    ],
    perceptions_en: [
      "Nature's majesty",
      "Moment of tension",
      "Edge of life and death",
      "Dynamic equilibrium",
      "Ukiyo-e masterpiece",
      "Mount Fuji in waves"
    ]
  },
  {
    id: 6,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg',
    title: '절규',
    title_en: 'The Scream',
    artist: '에드바르 뭉크',
    artist_en: 'Edvard Munch',
    perceptions: [
      "실존적 공포",
      "표현주의의 선구",
      "침묵의 비명",
      "고립된 영혼",
      "불타는 하늘",
      "내면의 절규"
    ],
    perceptions_en: [
      "Existential terror",
      "Expressionist pioneer",
      "Silent scream",
      "Isolated soul",
      "Burning sky",
      "Inner anguish"
    ]
  }
];

export default function JourneyHomePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { isMobile } = useResponsive();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentArtwork, setCurrentArtwork] = useState(0);
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX - innerWidth / 2) / innerWidth * 20);
      mouseY.set((clientY - innerHeight / 2) / innerHeight * 20);
      setMousePosition({ x: clientX, y: clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Transform values based on scroll - 200vh 기준으로 더 빠른 전환
  const mazeOpacity = useTransform(scrollYProgress, [0, 0.18, 0.22], [1, 1, 0]);
  const artworksOpacity = useTransform(scrollYProgress, [0.18, 0.25, 0.45, 0.52], [0, 1, 1, 0]);
  const peopleOpacity = useTransform(scrollYProgress, [0.48, 0.55, 0.73, 0.8], [0, 1, 1, 0]);
  const gardenOpacity = useTransform(scrollYProgress, [0.75, 0.82, 1], [0, 1, 1]);
  
  const lightIntensity = useTransform(scrollYProgress, [0, 1], [0.2, 1]);
  const mazeScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.15]);

  // 클라이언트 사이드에서만 모바일 체크하고 렌더링
  if (mounted && isMobile) {
    return <MobileHomePage />;
  }

  // SSR 중이거나 데스크탑일 때는 기본 페이지 렌더링
  return (
    <div ref={containerRef} className="relative home-page-preserve">
        
        {/* Scene 1: 미로 입구 */}
        <motion.div 
          className="relative h-screen flex items-center justify-center"
        >
          <div className="relative w-full h-full overflow-hidden">
            {/* 부드러운 미로 배경 - 감성적인 어둠 */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-900" />
            
            {/* 부드러운 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
            
            {/* 손전등 효과 */}
            <motion.div
              className="absolute pointer-events-none"
              style={{
                width: '600px',
                height: '600px',
                left: smoothMouseX,
                top: smoothMouseY,
                x: '-50%',
                y: '-50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 50%)',
                filter: 'blur(40px)',
              }}
            />
            
            {/* 부드러운 미로 안개 효과 */}
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => {
                // Use deterministic values based on index
                const left = ((i * 12.5) + 6.25) % 100;
                const top = ((i * 25) + 12.5) % 100;
                const width = 100 + (i * 25);
                const height = 100 + ((i * 30) % 200);
                const xOffset = (i % 2 === 0 ? 30 : -30) + (i * 5);
                const yOffset = (i % 2 === 0 ? -40 : 40) + (i * 3);
                const duration = 15 + (i * 2.5);
                
                return (
                  <motion.div
                    key={`mist-${i}`}
                    className="absolute rounded-full opacity-20"
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      width: `${width}px`,
                      height: `${height}px`,
                      background: `radial-gradient(circle, rgba(100, 100, 120, 0.3) 0%, transparent 70%)`,
                      filter: 'blur(60px)',
                    }}
                    animate={{
                      x: [0, xOffset, 0],
                      y: [0, yOffset, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: duration,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 2,
                    }}
                  />
                );
              })}
            </div>
            
            {/* 은은한 미로 패턴 - 중앙에서 퍼지는 미로 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-full h-full max-w-6xl max-h-screen opacity-15" viewBox="0 0 1200 800">
                <defs>
                  <filter id="soft-glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <radialGradient id="fade-out">
                    <stop offset="0%" stopColor="white" stopOpacity="0.6"/>
                    <stop offset="70%" stopColor="white" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="white" stopOpacity="0"/>
                  </radialGradient>
                </defs>
                
                <g mask="url(#fade-mask)">
                  {/* 중앙에서 방사형으로 퍼지는 미로 경로들 */}
                  <circle cx="600" cy="400" r="80" fill="none" stroke="rgba(150, 150, 200, 0.5)" strokeWidth="1" filter="url(#soft-glow)" />
                  <circle cx="600" cy="400" r="160" fill="none" stroke="rgba(140, 140, 190, 0.4)" strokeWidth="1" strokeDasharray="20 10" filter="url(#soft-glow)" />
                  <circle cx="600" cy="400" r="240" fill="none" stroke="rgba(130, 130, 180, 0.3)" strokeWidth="1" strokeDasharray="30 15" filter="url(#soft-glow)" />
                  <circle cx="600" cy="400" r="320" fill="none" stroke="rgba(120, 120, 170, 0.2)" strokeWidth="1" strokeDasharray="40 20" filter="url(#soft-glow)" />
                  
                  {/* 연결 경로들 */}
                  <path d="M600,320 Q680,360 600,400 T520,440" fill="none" stroke="rgba(140, 140, 190, 0.3)" strokeWidth="1" filter="url(#soft-glow)" />
                  <path d="M520,400 Q560,320 600,400 T640,480" fill="none" stroke="rgba(130, 130, 180, 0.3)" strokeWidth="1" filter="url(#soft-glow)" />
                  <path d="M680,400 Q640,480 600,400 T560,320" fill="none" stroke="rgba(150, 150, 200, 0.3)" strokeWidth="1" filter="url(#soft-glow)" />
                  <path d="M600,480 Q520,440 600,400 T680,360" fill="none" stroke="rgba(140, 140, 190, 0.3)" strokeWidth="1" filter="url(#soft-glow)" />
                  
                  {/* 작은 노드들 */}
                  <circle cx="600" cy="320" r="4" fill="rgba(160, 160, 210, 0.4)" filter="url(#soft-glow)" />
                  <circle cx="680" cy="400" r="4" fill="rgba(150, 150, 200, 0.4)" filter="url(#soft-glow)" />
                  <circle cx="600" cy="480" r="4" fill="rgba(140, 140, 190, 0.4)" filter="url(#soft-glow)" />
                  <circle cx="520" cy="400" r="4" fill="rgba(130, 130, 180, 0.4)" filter="url(#soft-glow)" />
                </g>
                
                <mask id="fade-mask">
                  <rect width="1200" height="800" fill="url(#fade-out)" />
                </mask>
              </svg>
            </div>
            
            {/* 부드러운 바닥 효과 */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-32"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
                scale: mazeScale,
              }}
            />
            
            {/* 미로 속 숨겨진 작품들 - 추상적인 박스 형태 */}
            <div className="absolute inset-0">
              {[0, 1, 2].map((i) => {
                const positions = [
                  { x: '20%', y: '30%' },
                  { x: '70%', y: '25%' },
                  { x: '25%', y: '70%' }
                ];
                return (
                  <motion.div
                    key={`art-box-${i}`}
                    className="absolute w-24 h-32"
                    style={{
                      left: positions[i].x,
                      top: positions[i].y,
                      transform: 'translate(-50%, -50%)',
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: [0, 0.1, 0.08, 0.1],
                      scale: [0.8, 1, 0.95, 1],
                      y: [0, -10, 0, -5, 0]
                    }}
                    transition={{ 
                      delay: i * 0.5 + 2,
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="relative w-full h-full">
                      {/* 추상적인 박스 형태 */}
                      <div 
                        className="w-full h-full rounded-lg"
                        style={{
                          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(2px)',
                        }}
                      />
                      {/* 부드러운 글로우 효과 */}
                      <div className="absolute inset-0 rounded-lg shadow-xl" 
                        style={{
                          background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full pt-24">
              <motion.h1 
                className={`font-bold text-white/90 mb-4 text-center ${
                  language === 'ko' ? 'text-5xl' : 'text-[3.25rem]'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                {language === 'ko' 
                  ? '하루에도 몇 번씩 바뀌는 마음,'
                  : 'Your feelings shift like the tides,'}
              </motion.h1>
              <motion.p 
                className="text-xl text-white/70 mb-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                {language === 'ko'
                  ? '어떤 게 진짜 나인지 헷갈리시나요?'
                  : 'Wondering which one is the real you?'}
              </motion.p>
              <motion.p 
                className="text-lg text-white/60 mb-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                {language === 'ko'
                  ? '예술과 함께 진정한 나를 발견하는 여정을 시작하세요'
                  : "Begin your artistic journey to discover your true self"}
              </motion.p>
              
              {/* 서비스 가치 명확화 */}
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 mb-12 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1 }}
              >
                <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-lg md:text-2xl mb-1 md:mb-2">✨</span>
                    <p className="text-white/90 text-[10px] md:text-sm font-medium leading-tight">
                      {language === 'ko' ? '5분 만에 발견하는' : 'Discover in 5 minutes'}
                    </p>
                    <p className="text-white/70 text-[9px] md:text-sm mt-0.5">
                      {language === 'ko' ? '나의 예술 성향' : 'Your art personality'}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg md:text-2xl mb-1 md:mb-2">🤝</span>
                    <p className="text-white/90 text-[10px] md:text-sm font-medium leading-tight">
                      {language === 'ko' ? '나와 취향이 딱 맞는' : 'Find perfect match'}
                    </p>
                    <p className="text-white/70 text-[9px] md:text-sm mt-0.5">
                      {language === 'ko' ? '전시 동행 찾기' : 'Exhibition companions'}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg md:text-2xl mb-1 md:mb-2">🎨</span>
                    <p className="text-white/90 text-[10px] md:text-sm font-medium leading-tight">
                      {language === 'ko' ? 'AI가 맞춤형으로' : 'AI-powered'}
                    </p>
                    <p className="text-white/70 text-[9px] md:text-sm mt-0.5">
                      {language === 'ko' ? '추천하는 작품과 전시' : 'Art recommendations'}
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/* 시작점으로의 초대 */}
              <motion.div
                className="relative cursor-pointer group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 1 }}
                onClick={() => router.push('/quiz')}
              >
                {/* 출구에서 새어나오는 빛 */}
                <motion.div
                  className="absolute inset-0 -inset-12"
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-cyan-200/30 via-white/40 to-cyan-200/30 blur-2xl" />
                </motion.div>
                
                {/* 미로 출구 문 */}
                <div className="relative w-56 h-72 rounded-t-full bg-gradient-to-t from-gray-800/40 via-gray-600/30 to-white/60 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center overflow-hidden">
                  {/* 문틀 효과 */}
                  <div className="absolute inset-2 rounded-t-full border border-white/20" />
                  
                  {/* 밝은 빛이 새어나오는 효과 */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40"
                    animate={{
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  <div className="relative z-10 text-center px-6">
                    <motion.div
                      animate={{ y: [-2, 2, -2] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <p className="text-white/90 font-bold text-2xl mb-3 whitespace-nowrap">
                        {language === 'ko' ? '당신의 시작점' : 'Begin Here'}
                      </p>
                      <p className="text-white/80 text-lg mb-4 whitespace-nowrap">
                        {language === 'ko' ? '모든 나를 만나는 여정' : 'Discover Your Many Selves'}
                      </p>
                      <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
                        <p className="text-white/90 text-sm font-medium whitespace-nowrap">
                          {language === 'ko' ? '예술 MBTI (APT) 테스트' : 'Art MBTI (APT) Test'}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* 문 손잡이 */}
                  <div className="absolute right-6 top-1/2 w-4 h-4 rounded-full bg-white/60 shadow-lg" />
                </div>
                
                {/* 빛의 파문 효과 */}
                <motion.div
                  className="absolute inset-0 rounded-t-full border-2 border-white/30"
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.8, 0.3, 0.8],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              
              <motion.div
                className="mt-12 text-white/60"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scene 2: 미로 속 작품들 */}
        <motion.div 
          className="relative h-screen"
        >
          <div className="relative w-full h-full">
            {/* 배경 - 좀 더 밝아진 미로 */}
            <div className="absolute inset-0 bg-gradient-to-b from-green-900 to-green-950" />
            
            
            {/* 작품 캐러셀 컨테이너 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full max-w-6xl mx-auto px-8">
                {/* 중앙 작품 영역 - 아래로 이동 */}
                <div className="absolute top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <motion.div 
                    className="relative w-[300px] h-[380px]"
                    key={currentArtwork}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl relative bg-gray-200">
                      <img 
                        src={famousArtworks[currentArtwork].url}
                        alt={famousArtworks[currentArtwork].title}
                        className="w-full h-full object-cover"
                        style={{ display: 'block' }}
                      />
                    </div>
                    
                    {/* 작품 정보 */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent rounded-b-lg">
                      <h3 className="text-white font-bold text-xl mb-1">
                        {language === 'ko' 
                          ? famousArtworks[currentArtwork].title
                          : famousArtworks[currentArtwork].title_en || famousArtworks[currentArtwork].title}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {language === 'ko'
                          ? famousArtworks[currentArtwork].artist
                          : famousArtworks[currentArtwork].artist_en || famousArtworks[currentArtwork].artist}
                      </p>
                    </div>
                  </motion.div>
                </div>
                
                {/* 6개의 감상 텍스트 - 작품 주변 분산 배치 */}
                {famousArtworks[currentArtwork].perceptions.map((perception, i) => {
                  // 각 텍스트의 위치를 작품 주변에 배치 (화살표 버튼 피하기)
                  const positions = [
                    { left: '20%', top: '30%' },     // 좌상단
                    { left: '70%', top: '30%' },     // 우상단
                    { left: '15%', top: '50%' },     // 좌중앙 - 화살표 버튼 왼쪽
                    { left: '73%', top: '50%' },     // 우중앙 - 화살표 버튼 오른쪽
                    { left: '20%', top: '70%' },     // 좌하단
                    { left: '70%', top: '70%' }      // 우하단
                  ];
                  
                  return (
                    <motion.div
                      key={`${currentArtwork}-${i}`}
                      className="absolute"
                      style={{
                        left: positions[i].left,
                        top: positions[i].top,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 20
                      }}
                      initial={{ 
                        opacity: 0,
                        scale: 0,
                      }}
                      animate={{ 
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{
                        duration: 0.5,
                        delay: i * 0.1,
                        ease: "backOut"
                      }}
                    >
                      <motion.div
                        className="backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg hover:scale-105 transition-all cursor-pointer"
                        style={{
                          backgroundColor: `rgba(255, 255, 255, ${0.7 + (i * 0.05)})`,
                          borderColor: `rgba(${100 + i * 20}, ${150 + i * 10}, ${200 - i * 15}, 0.5)`,
                          borderWidth: '1px',
                          borderStyle: 'solid'
                        }}
                        whileHover={{ scale: 1.05 }}
                        animate={{
                          y: [0, -5, 0],
                        }}
                        transition={{
                          duration: 4,
                          delay: i * 0.2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <p className="text-gray-800 text-sm font-medium whitespace-nowrap">
                          "{language === 'ko' ? perception : (famousArtworks[currentArtwork].perceptions_en?.[i] || perception)}"
                        </p>
                      </motion.div>
                    </motion.div>
                  );
                })}
                
                {/* 네비게이션 버튼 - 작품 양옆에 배치 */}
                <button
                  className="absolute left-[calc(50%-250px)] top-[50%] -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all z-10 group"
                  onClick={() => setCurrentArtwork((prev) => (prev - 1 + famousArtworks.length) % famousArtworks.length)}
                  type="button"
                >
                  <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  className="absolute right-[calc(50%-250px)] top-[50%] -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all z-10 group"
                  onClick={() => setCurrentArtwork((prev) => (prev + 1) % famousArtworks.length)}
                  type="button"
                >
                  <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* 상단 메시지 - 더 아래로 조정 */}
            <div className="absolute top-36 left-0 right-0 text-center z-30">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-white text-2xl font-bold mb-1 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                  {language === 'ko' ? '같은 작품, 다른 시선' : 'Same Art, Different Eyes'}
                </p>
                <p className="text-white/90 text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  {language === 'ko' 
                    ? '16가지 예술 MBTI가 바라보는 각자의 예술 세계'
                    : '16 Art MBTI types, each with their own art world'}
                </p>
              </motion.div>
            </div>
            
            {/* 작품 인디케이터 */}
            <div className="absolute bottom-[22%] left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
              {famousArtworks.map((_, i) => (
                <button
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentArtwork 
                      ? 'w-8 bg-white/80' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  onClick={() => setCurrentArtwork(i)}
                />
              ))}
            </div>
            
            {/* 하단 기능 소개 카드들 */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 px-8 pb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6">
                {/* 시선 공유 */}
                <motion.div 
                  className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 cursor-pointer hover:bg-white/30 transition-all shadow-xl"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center">
                      <span className="text-2xl">👁️</span>
                    </div>
                    <h4 className="text-white font-bold text-lg">{language === 'ko' ? '시선 공유' : 'Share Perspectives'}</h4>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {language === 'ko'
                      ? '작품에 대한 나만의 해석을 공유하고, 다른 사람들의 시선도 발견해보세요'
                      : 'Share your unique interpretation and discover others\' perspectives'}
                  </p>
                </motion.div>
                
                {/* 전시 동행 */}
                <motion.div 
                  className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 cursor-pointer hover:bg-white/30 transition-all shadow-xl"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center">
                      <span className="text-2xl">🤝</span>
                    </div>
                    <h4 className="text-white font-bold text-lg">{language === 'ko' ? '전시 동행 매칭' : 'Exhibition Companions'}</h4>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {language === 'ko' 
                      ? '나와 잘 맞는, 또는 나와 다른 Art Persona를 만나 함께 전시회를 즐겨보세요'
                      : 'Meet Art Personas similar or different from you, and enjoy exhibitions together'}
                  </p>
                </motion.div>
                
                {/* AI 큐레이터 */}
                <motion.div 
                  className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 cursor-pointer hover:bg-white/30 transition-all shadow-xl"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <h4 className="text-white font-bold text-lg">{language === 'ko' ? 'AI 아트 큐레이터' : 'AI Art Curator'}</h4>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {language === 'ko'
                      ? '시시각각 변하는 당신을 위한, 매일 새로운 큐레이션'
                      : 'Daily curation for the ever-changing you'}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Scene 3: 다른 사람들과의 만남 */}
        <motion.div 
          className="relative h-screen"
        >
          <div className="relative w-full h-full">
            {/* 배경 - 더 밝아진 공간 */}
            <div className="absolute inset-0 bg-gradient-to-b from-green-800 to-green-900" />
            
            {/* 베타 유저 testimonial */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8" style={{ paddingTop: '80px' }}>
              <motion.h2 
                className="text-5xl font-bold text-white mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {language === 'ko' ? '혼자가 아닙니다' : 'You Are Not Alone'}
              </motion.h2>
              <motion.p 
                className="text-white/80 text-xl mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {language === 'ko' 
                  ? '이미 많은 사람들이 SAYU와 함께하고 있어요'
                  : 'Many people are already joining the SAYU journey'}
              </motion.p>
              
              {/* 실제 사용자 후기들 */}
              <div className="grid grid-cols-3 gap-6 max-w-6xl w-full">
                {[
                  {
                    name: "민지",
                    name_en: "Emily",
                    aptType: "LAEF",
                    emoji: "🦊",
                    quote: <>매일 아침 <strong className="text-lime-300">감정에 맞는 작품</strong>을 보며 하루를 시작해요. 예전엔 몰랐던 제 감정의 깊이를 이해하게 되었어요.</>,
                    quote_en: "I start each day by viewing artworks that match my emotions. I've come to understand the depth of my feelings that I never knew before."
                  },
                  {
                    name: "준호",
                    name_en: "James",
                    aptType: "SREC",
                    emoji: "🦆",
                    quote: <><strong className="text-lime-300">전시 동행 매칭</strong>으로 만난 친구와 매주 미술관을 가요. 혼자서는 발견하지 못했을 작품들을 함께 감상하니 더 풍부해져요.</>,
                    quote_en: "Weekly museum visits with my exhibition companion opened my eyes to artworks I'd never have discovered alone."
                  },
                  {
                    name: "서연",
                    name_en: "Sarah",
                    aptType: "LAMF",
                    emoji: "🦉",
                    quote: <><strong className="text-lime-300">AI 상담사와 대화</strong>하면서 제가 왜 특정 작품에 끌리는지 알게 되었어요. 예술이 제 마음의 거울이 되어주고 있어요.</>,
                    quote_en: "Through conversations with the AI counselor, I learned why I'm drawn to certain artworks. Art has become a mirror to my heart."
                  }
                ].map((testimonial, i) => (
                  <motion.div
                    key={i}
                    className="bg-white/15 backdrop-blur-md rounded-xl p-6 border border-white/30"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    <p className="text-white text-base md:text-base text-lg mb-6 leading-relaxed">
                      {language === 'ko' ? testimonial.quote : testimonial.quote_en}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{testimonial.emoji}</div>
                      <div>
                        <p className="text-white/90 font-medium">
                          {language === 'ko' ? testimonial.name : testimonial.name_en}
                        </p>
                        <p className="text-white/60 text-sm">
                          예술 성향: {testimonial.aptType}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* 첫 동행자 혜택 */}
              <motion.div 
                className="mt-8 md:mt-8 mt-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-lg p-6 border border-white/20 max-w-4xl w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold text-white">
                    {language === 'ko' ? '첫 동행자를 위한 특별 혜택' : 'Special Benefits for Early Companions'}
                  </h3>
                  <span className="text-4xl">🎁</span>
                </div>
                <p className="text-white/80 text-center mb-4 text-sm">
                  {language === 'ko' 
                    ? 'SAYU의 첫 100명과 함께 특별한 여정을 시작하세요'
                    : 'Start a special journey with the first 100 members of SAYU'}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🌱</div>
                    <p className="text-white/90 font-medium">
                      {language === 'ko' ? '신규 기능 우선 공개' : 'Early Access to New Features'}
                    </p>
                    <p className="text-white/60 text-sm">
                      {language === 'ko' ? '개발 중인 기능 미리 체험' : 'Preview features in development'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎖️</div>
                    <p className="text-white/90 font-medium">
                      {language === 'ko' ? '창립 멤버 배지' : 'Founding Member Badge'}
                    </p>
                    <p className="text-white/60 text-sm">
                      {language === 'ko' ? '프로필에 영구 표시' : 'Permanent display on profile'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🗣️</div>
                    <p className="text-white/90 font-medium">
                      {language === 'ko' ? '함께 만드는 서비스' : 'Co-create the Service'}
                    </p>
                    <p className="text-white/60 text-sm">
                      {language === 'ko' ? '당신의 아이디어가 현실로' : 'Your ideas become reality'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scene 4: 밝은 정원 */}
        <motion.div 
          className="relative h-screen"
        >
          <div className="relative w-full h-full overflow-hidden">
            {/* 밝은 배경 */}
            <div className="absolute inset-0 bg-gradient-to-b from-green-300 via-green-100 to-white" />
            
            {/* 움직이는 정원 요소들 - 부드러운 빛 입자 */}
            {[...Array(6)].map((_, i) => {
              const left = ((i * 16.67) + 8.33) % 100;
              const top = ((i * 20) + 10) % 100;
              
              return (
                <motion.div
                  key={`light-${i}`}
                  className="absolute w-32 h-32 rounded-full"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    background: `radial-gradient(circle, rgba(255,255,255,0.${i+2}) 0%, transparent 70%)`,
                    filter: 'blur(40px)',
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 8 + i * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 1.5,
                  }}
                />
              );
            })}
            
            {/* 움직이는 정원 요소들 - 꽃잎 */}
            {[...Array(12)].map((_, i) => {
              const left = ((i * 8.33) + 4.17) % 100;
              const xOffset = (i % 3 === 0 ? -20 : i % 3 === 1 ? 0 : 20) + (i * 3);
              const duration = 10 + ((i * 0.42) % 5);
              
              return (
                <motion.div
                  key={`petal-${i}`}
                  className="absolute w-4 h-4 bg-pink-300/40 rounded-full blur-sm"
                  style={{
                    left: `${left}%`,
                    top: `-10%`,
                  }}
                  animate={{
                    y: ['0vh', '110vh'],
                    x: [0, xOffset],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.8,
                  }}
                />
              );
            })}
            
            {/* 하단 서사의 완성 - 표현하고자 하는 내용 */}
            <div className="absolute bottom-0 left-0 right-0">
              {/* 바닥의 부드러운 그라데이션 */}
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-green-50/80 via-transparent to-transparent" />
              
              {/* SAYU 커뮤니티 및 매칭 활동 소개 */}
              <motion.div
                className="relative z-10 pb-12 text-center px-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5, duration: 1 }}
              >
                {/* 커뮤니티 활동 소개 */}
                <div className="max-w-5xl mx-auto mb-12">
                  <motion.p 
                    className="text-green-800 text-xl font-bold mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.8 }}
                    style={{ marginTop: '120px' }}
                  >
                    {language === 'ko' ? 'SAYU에서 만나는 특별한 경험들' : 'Special Experiences at SAYU'}
                  </motion.p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div 
                      className="text-left"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 3.0 }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl">🎨</span>
                        <div>
                          <h4 className="text-green-800 font-semibold mb-1">
                            {language === 'ko' ? '작품 감상 공유' : 'Share Art Impressions'}
                          </h4>
                          <p className="text-green-700/80 text-sm leading-relaxed">
                            {language === 'ko' ? (
                              <>같은 작품을 보고 느낀 감정을 나누며<br/>새로운 시각을 발견해보세요</>
                            ) : (
                              <>Share emotions from viewing artworks<br/>and discover new perspectives</>
                            )}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="text-left"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 3.1 }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl">👥</span>
                        <div>
                          <h4 className="text-green-800 font-semibold mb-1">
                            {language === 'ko' ? '예술 MBTI 매칭' : 'Art MBTI Matching'}
                          </h4>
                          <p className="text-green-700/80 text-sm leading-relaxed">
                            {language === 'ko' ? (
                              <>나와 비슷한 감성을 가진 사람들과<br/>함께 전시를 둘러보세요</>
                            ) : (
                              <>Explore exhibitions with people<br/>who share your aesthetic sensibility</>
                            )}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="text-left"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 3.2 }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl">🌱</span>
                        <div>
                          <h4 className="text-green-800 font-semibold mb-1">
                            {language === 'ko' ? '함께 성장하는 커뮤니티' : 'Growing Together Community'}
                          </h4>
                          <p className="text-green-700/80 text-sm leading-relaxed">
                            {language === 'ko' ? (
                              <>다양한 배경의 예술 애호가들과<br/>함께 성장하는 경험</>
                            ) : (
                              <>Grow together with art lovers<br/>from diverse backgrounds</>
                            )}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
                
                {/* 16가지 APT 타입 아이콘들 */}
                <div className="flex justify-center gap-3 mb-4">
                  {['🦊', '🐱', '🦉', '🦔', '🐶', '🦆', '🐘', '🦅'].map((emoji, i) => (
                    <motion.div
                      key={i}
                      className="text-3xl"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 0.8, scale: 1 }}
                      transition={{ delay: 3.5 + i * 0.1, type: 'spring', stiffness: 200 }}
                    >
                      {emoji}
                    </motion.div>
                  ))}
                </div>
                <p className="text-green-600/70 text-sm">
                  {language === 'ko' 
                    ? '16가지 Art Persona가 당신을 기다리고 있습니다'
                    : '16 Art Personas are waiting for you'
                  }
                </p>
              </motion.div>
            </div>
            
            {/* 중앙 콘텐츠 - 위치 조정 */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: '-180px' }}>
              <motion.div 
                className="text-center z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.h2 
                  className="text-6xl font-bold text-green-800 mb-4"
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  SAYU
                </motion.h2>
                <p className="text-2xl text-green-700 mb-8">
                  {language === 'ko' ? '함께 만들어가는 예술의 정원' : 'A Garden of Art We Create Together'}
                </p>
                
                <motion.button
                  className="px-10 py-5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full text-xl font-bold shadow-2xl relative overflow-hidden group"
                  whileHover={{ scale: 1.05, boxShadow: "0 30px 60px rgba(0,0,0,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push('/quiz');
                  }}
                >
                  <span className="relative z-10">
                    {language === 'ko' ? '나의 Art Persona 발견하기' : 'Discover My Art Persona'}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-green-400"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
                
                {/* 여정 진행 상황 */}
                <motion.div
                  className="mt-6 text-green-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-sm">
                      {language === 'ko' 
                        ? <>오늘 <span className="font-bold">47명</span>이 자신의 예술 MBTI를 발견했어요</>
                        : <>Today <span className="font-bold">47 people</span> discovered their Art MBTI</>
                      }
                    </p>
                  </div>
                </motion.div>
                
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* 전체 조명 효과 */}
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          style={{ 
            opacity: lightIntensity,
            background: 'radial-gradient(circle at center, transparent 0%, rgba(255,255,255,0.1) 100%)'
          }}
        />

      <style jsx>{`        
        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-from) 0%, var(--tw-gradient-via) 50%, var(--tw-gradient-to) 100%);
        }
      `}</style>
    </div>
  );
}