'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import Image from 'next/image';

// Cloudinary 유명 작품들 - URL 수정
const famousArtworks = [
  {
    id: 1,
    url: 'https://res.cloudinary.com/dkjlt4m5x/image/upload/v1735699413/sayu/artvee/Vincent_van_Gogh_-_The_Starry_Night.jpg',
    title: '별이 빛나는 밤',
    artist: '반 고흐',
    perceptions: [
      "소용돌이치는 불안감",
      "우주와의 교감",
      "고독한 영혼의 외침",
      "생명력 넘치는 밤하늘",
      "내면의 폭풍",
      "희망의 별빛"
    ]
  },
  {
    id: 2,
    url: 'https://res.cloudinary.com/dkjlt4m5x/image/upload/v1735699414/sayu/artvee/Claude_Monet_-_Water_Lilies.jpg',
    title: '수련',
    artist: '모네',
    perceptions: [
      "시간이 멈춘 연못",
      "빛의 춤",
      "명상의 순간",
      "자연과의 합일",
      "흐릿한 경계",
      "평온한 무의식"
    ]
  },
  {
    id: 3,
    url: 'https://res.cloudinary.com/dkjlt4m5x/image/upload/v1735699415/sayu/artvee/Gustav_Klimt_-_The_Kiss.jpg',
    title: '키스',
    artist: '클림트',
    perceptions: [
      "황금빛 영원",
      "순간의 절정",
      "관능적 신성함",
      "보호하는 포옹",
      "장식적 사랑",
      "벼랑 끝의 열정"
    ]
  },
  {
    id: 4,
    url: 'https://res.cloudinary.com/dkjlt4m5x/image/upload/v1735699416/sayu/artvee/Edvard_Munch_-_The_Scream.jpg',
    title: '절규',
    artist: '뭉크',
    perceptions: [
      "실존적 공포",
      "도시인의 고립",
      "침묵 속 비명",
      "현대의 불안",
      "자연의 경고",
      "내면의 메아리"
    ]
  },
  {
    id: 5,
    url: 'https://res.cloudinary.com/dkjlt4m5x/image/upload/v1735699417/sayu/artvee/Paul_Gauguin_-_Tahitian_Women.jpg',
    title: '타히티의 여인들',
    artist: '고갱',
    perceptions: [
      "원시의 순수",
      "문명의 탈출",
      "이국적 환상",
      "색채의 해방",
      "잃어버린 낙원",
      "타자의 시선"
    ]
  },
  {
    id: 6,
    url: 'https://res.cloudinary.com/dkjlt4m5x/image/upload/v1735699418/sayu/artvee/Johannes_Vermeer_-_Girl_with_a_Pearl_Earring.jpg',
    title: '진주 귀걸이 소녀',
    artist: '베르메르',
    perceptions: [
      "순간의 포착",
      "빛의 마법",
      "신비로운 미소",
      "일상의 신성함",
      "응시의 깊이",
      "시간을 초월한 아름다움"
    ]
  }
];

export default function JourneyHomePage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentArtwork, setCurrentArtwork] = useState(0);
  
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

  // Transform values based on scroll - 더 명확한 구간 분리
  const mazeOpacity = useTransform(scrollYProgress, [0, 0.2, 0.25], [1, 1, 0]);
  const artworksOpacity = useTransform(scrollYProgress, [0.2, 0.25, 0.45, 0.5], [0, 1, 1, 0]);
  const peopleOpacity = useTransform(scrollYProgress, [0.45, 0.5, 0.7, 0.75], [0, 1, 1, 0]);
  const gardenOpacity = useTransform(scrollYProgress, [0.7, 0.75, 1], [0, 1, 1]);
  
  const lightIntensity = useTransform(scrollYProgress, [0, 1], [0.2, 1]);
  const mazeScale = useTransform(scrollYProgress, [0, 0.25], [1, 1.2]);

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-black">
      {/* Fixed viewport container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* Scene 1: 미로 입구 */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: mazeOpacity }}
        >
          <div className="relative w-full h-full overflow-hidden">
            {/* 미로 배경 - 깊은 어둠과 절망감 */}
            <div className="absolute inset-0 bg-gradient-radial from-gray-900/40 via-gray-950 to-black" />
            
            {/* 어둠 오버레이 */}
            <div className="absolute inset-0 bg-black/60" />
            
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
            
            {/* 실제 미로 벽 패턴 */}
            <svg className="absolute inset-0 w-full h-full opacity-40">
              <defs>
                <pattern id="maze-walls" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  {/* 미로 벽들 - 더 복잡하고 실제 미로처럼 */}
                  <rect x="0" y="0" width="10" height="60" fill="rgba(100, 100, 100, 0.8)" />
                  <rect x="30" y="10" width="40" height="10" fill="rgba(100, 100, 100, 0.8)" />
                  <rect x="80" y="0" width="10" height="40" fill="rgba(100, 100, 100, 0.8)" />
                  <rect x="20" y="70" width="30" height="10" fill="rgba(100, 100, 100, 0.8)" />
                  <rect x="60" y="40" width="10" height="60" fill="rgba(100, 100, 100, 0.8)" />
                  <rect x="10" y="30" width="15" height="10" fill="rgba(100, 100, 100, 0.8)" />
                  <rect x="75" y="60" width="25" height="10" fill="rgba(100, 100, 100, 0.8)" />
                  
                  {/* 막다른 길 표시 */}
                  <circle cx="15" cy="85" r="3" fill="rgba(120, 120, 120, 0.5)" />
                  <circle cx="85" cy="25" r="3" fill="rgba(120, 120, 120, 0.5)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#maze-walls)" />
            </svg>
            
            {/* 미로 경로들 - 어두운 통로들 */}
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <div
                  key={`path-${i}`}
                  className="absolute bg-gray-900/60 rounded-sm"
                  style={{
                    left: `${10 + (i % 4) * 25}%`,
                    top: `${15 + Math.floor(i / 4) * 30}%`,
                    width: `${15 + Math.random() * 10}%`,
                    height: '8px',
                    transform: `rotate(${Math.random() * 90 - 45}deg)`,
                  }}
                />
              ))}
            </div>
            
            {/* 막다른 길들 */}
            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <div
                  key={`dead-end-${i}`}
                  className="absolute text-red-400/30 text-xs"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${25 + (i % 2) * 50}%`,
                  }}
                >
                  ✕
                </div>
              ))}
            </div>
            
            {/* 미로 바닥 그리드 - retro grid 스타일 */}
            <div className="absolute inset-0" style={{ perspective: '1000px' }}>
              <motion.div 
                className="absolute inset-0 maze-floor"
                style={{
                  scale: mazeScale,
                }}
              />
            </div>
            
            {/* 흐릿한 작품들 */}
            <div className="absolute inset-0">
              {famousArtworks.slice(0, 4).map((artwork, i) => {
                const positions = [
                  { x: '15%', y: '25%' },
                  { x: '75%', y: '20%' },
                  { x: '20%', y: '70%' },
                  { x: '80%', y: '65%' }
                ];
                return (
                  <motion.div
                    key={artwork.id}
                    className="absolute w-32 h-40"
                    style={{
                      left: positions[i].x,
                      top: positions[i].y,
                      transform: 'translate(-50%, -50%)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ delay: i * 0.3 + 1 }}
                  >
                    <div className="relative w-full h-full">
                      <img
                        src={artwork.url}
                        alt={artwork.title}
                        className="w-full h-full object-cover rounded-lg"
                        style={{
                          filter: 'blur(8px) brightness(0.3)',
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        whileHover={{ opacity: 1 }}
                        initial={{ opacity: 0 }}
                      >
                        <p className="text-white/60 text-sm text-center px-2">
                          이 작품이<br/>끌리는 이유는?
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <motion.h1 
                className="text-6xl font-bold text-white/90 mb-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                어둠 속에서<br/>길을 잃으셨나요?
              </motion.h1>
              <motion.p 
                className="text-xl text-white/70 mb-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                복잡한 감정의 미로에서 방황하고 계신가요?
              </motion.p>
              <motion.p 
                className="text-lg text-white/60 mb-16 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                예술이 당신만의 출구를 안내해드릴게요
              </motion.p>
              
              {/* 미로의 출구 - 희망의 빛 */}
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
                      <p className="text-white/90 font-bold text-xl mb-2">
                        미로의 출구
                      </p>
                      <p className="text-white/70 text-sm mb-3">
                        나를 알아가는 여정
                      </p>
                      <p className="text-white/60 text-xs">
                        Art Persona Type 테스트
                      </p>
                    </motion.div>
                  </div>
                  
                  {/* 문 손잡이 */}
                  <div className="absolute right-4 top-1/2 w-3 h-3 rounded-full bg-white/60 shadow-lg" />
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
                className="mt-12 text-white/40"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scene 2: 미로 속 작품들 */}
        <motion.div 
          className="absolute inset-0"
          style={{ opacity: artworksOpacity }}
        >
          <div className="relative w-full h-full">
            {/* 배경 - 좀 더 밝아진 미로 */}
            <div className="absolute inset-0 bg-gradient-to-b from-green-900/60 to-green-950/80" />
            
            {/* 작품 캐러셀 컨테이너 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* 메인 작품 영역 - 크기 축소 */}
              <div className="relative w-full max-w-4xl h-[45%] flex items-center justify-center">
                {/* 작품 이미지 */}
                <motion.div 
                  className="relative w-[400px] h-[500px]"
                  key={currentArtwork}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src={famousArtworks[currentArtwork].url}
                    alt={famousArtworks[currentArtwork].title}
                    width={400}
                    height={500}
                    className="w-full h-full object-cover rounded-lg shadow-2xl"
                    unoptimized
                  />
                  
                  {/* 작품 정보 */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                    <h3 className="text-white font-bold text-2xl mb-1">
                      {famousArtworks[currentArtwork].title}
                    </h3>
                    <p className="text-white/80">
                      {famousArtworks[currentArtwork].artist}
                    </p>
                  </div>
                </motion.div>
                
                {/* 다른 사람들의 감상 - 6각형 배치 */}
                <div className="absolute inset-0 pointer-events-none">
                  {famousArtworks[currentArtwork].perceptions.map((perception, i) => {
                    // 6각형 배치를 위한 각도 계산
                    const angle = (i * 60) * Math.PI / 180; // 60도씩 회전
                    const radius = 250; // 중심으로부터의 거리
                    const centerX = 200; // 작품 중심 x
                    const centerY = 250; // 작품 중심 y
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;
                    
                    return (
                      <motion.div
                        key={`${currentArtwork}-${i}`}
                        className="absolute text-white/70 text-sm bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full"
                        style={{
                          left: `${x}px`,
                          top: `${y}px`,
                          transform: 'translate(-50%, -50%)',
                          maxWidth: '150px'
                        }}
                        initial={{ 
                          opacity: 0,
                          scale: 0
                        }}
                        animate={{ 
                          opacity: [0, 1, 1, 0],
                          scale: [0.8, 1, 1, 0.8]
                        }}
                        transition={{
                          duration: 4,
                          delay: i * 0.3,
                          repeat: Infinity,
                          repeatDelay: 2
                        }}
                      >
                        "{perception}"
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* 네비게이션 버튼 */}
                <button
                  className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all z-10 group"
                  onClick={() => setCurrentArtwork((prev) => (prev - 1 + famousArtworks.length) % famousArtworks.length)}
                  type="button"
                >
                  <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all z-10 group"
                  onClick={() => setCurrentArtwork((prev) => (prev + 1) % famousArtworks.length)}
                  type="button"
                >
                  <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {/* 하단 메시지 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="text-center mt-8"
              >
                <p className="text-white/80 text-2xl font-light mb-2">
                  같은 작품, 다른 시선
                </p>
                <p className="text-white/60 text-lg">
                  당신만의 해석을 더해보세요
                </p>
              </motion.div>
              
              {/* 작품 인디케이터 */}
              <div className="flex gap-2 mt-6">
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
            </div>
            
            {/* 하단 기능 소개 카드들 */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 px-8 pb-12"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6">
                {/* 시선 공유 */}
                <motion.div 
                  className="bg-white/15 backdrop-blur-md rounded-xl p-6 border border-white/30 cursor-pointer hover:bg-white/25 transition-all shadow-lg"
                  whileHover={{ y: -6, scale: 1.02 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-xl">👁️</span>
                    </div>
                    <h4 className="text-white font-semibold text-lg">시선 공유</h4>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    같은 작품에 대한 다양한 해석을 공유하고 대화하세요
                  </p>
                </motion.div>
                
                {/* 전시 동행 */}
                <motion.div 
                  className="bg-white/15 backdrop-blur-md rounded-xl p-6 border border-white/30 cursor-pointer hover:bg-white/25 transition-all shadow-lg"
                  whileHover={{ y: -6, scale: 1.02 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-xl">🤝</span>
                    </div>
                    <h4 className="text-white font-semibold text-lg">전시 동행 매칭</h4>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    비슷한 취향의 사람과 안전하게 전시를 관람하세요
                  </p>
                </motion.div>
                
                {/* AI 큐레이터 */}
                <motion.div 
                  className="bg-white/15 backdrop-blur-md rounded-xl p-6 border border-white/30 cursor-pointer hover:bg-white/25 transition-all shadow-lg"
                  whileHover={{ y: -6, scale: 1.02 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-xl">🤖</span>
                    </div>
                    <h4 className="text-white font-semibold text-lg">AI 아트 큐레이터</h4>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    당신의 감정과 상황에 맞는 작품을 AI가 추천해드려요
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scene 3: 다른 사람들과의 만남 */}
        <motion.div 
          className="absolute inset-0"
          style={{ opacity: peopleOpacity }}
        >
          <div className="relative w-full h-full">
            {/* 배경 - 더 밝아진 공간 */}
            <div className="absolute inset-0 bg-gradient-to-b from-green-800/40 to-green-900/60" />
            
            {/* 베타 유저 testimonial */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
              <motion.h2 
                className="text-4xl font-bold text-white mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                혼자가 아닙니다
              </motion.h2>
              <motion.p 
                className="text-white/80 text-xl mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                이미 많은 사람들이 SAYU와 함께하고 있어요
              </motion.p>
              
              {/* 실제 사용자 후기들 */}
              <div className="grid grid-cols-3 gap-6 max-w-6xl w-full">
                {[
                  {
                    name: "민지",
                    aptType: "LAEF",
                    emoji: "🦊",
                    quote: "매일 아침 감정에 맞는 작품을 보며 하루를 시작해요. 예전엔 몰랐던 제 감정의 깊이를 이해하게 되었어요."
                  },
                  {
                    name: "준호",
                    aptType: "SREC",
                    emoji: "🦆",
                    quote: "전시 동행 매칭으로 만난 친구와 매주 미술관을 가요. 혼자서는 발견하지 못했을 작품들을 함께 감상하니 더 풍부해져요."
                  },
                  {
                    name: "서연",
                    aptType: "LAMF",
                    emoji: "🦉",
                    quote: "AI 상담사와 대화하면서 제가 왜 특정 작품에 끌리는지 알게 되었어요. 예술이 제 마음의 거울이 되어주고 있어요."
                  }
                ].map((testimonial, i) => (
                  <motion.div
                    key={i}
                    className="bg-white/15 backdrop-blur-md rounded-xl p-6 border border-white/30"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    <p className="text-white text-base mb-6 leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{testimonial.emoji}</div>
                      <div>
                        <p className="text-white/90 font-medium">
                          {testimonial.name}
                        </p>
                        <p className="text-white/60 text-sm">
                          APT: {testimonial.aptType}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* 첫 동행자 혜택 */}
              <motion.div 
                className="mt-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-lg p-8 border border-white/20 max-w-4xl w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
              >
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  🌟 첫 동행자가 되어주세요
                </h3>
                <p className="text-white/80 text-center mb-6">
                  SAYU의 첫 100명과 함께 특별한 여정을 시작하세요
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🌱</div>
                    <p className="text-white/90 font-medium">얼리버드 할인</p>
                    <p className="text-white/60 text-sm">1년간 50% 할인</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎖️</div>
                    <p className="text-white/90 font-medium">파이오니어 뱃지</p>
                    <p className="text-white/60 text-sm">프로필에 영구 표시</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🗣️</div>
                    <p className="text-white/90 font-medium">서비스 공동 개발</p>
                    <p className="text-white/60 text-sm">의견이 직접 반영</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scene 4: 밝은 정원 */}
        <motion.div 
          className="absolute inset-0"
          style={{ opacity: gardenOpacity }}
        >
          <div className="relative w-full h-full overflow-hidden">
            {/* 밝은 배경 */}
            <div className="absolute inset-0 bg-gradient-to-b from-green-300 via-green-100 to-white" />
            
            {/* 움직이는 정원 요소들 - 부드러운 빛 입자 */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`light-${i}`}
                className="absolute w-32 h-32 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
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
            ))}
            
            {/* 움직이는 정원 요소들 - 꽃잎 */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`petal-${i}`}
                className="absolute w-4 h-4 bg-pink-300/40 rounded-full blur-sm"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10%`,
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  x: [0, Math.random() * 100 - 50],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 10 + Math.random() * 5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.8,
                }}
              />
            ))}
            
            {/* 정원의 사람들 - 더 따뜻한 실루엣 */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`person-${i}`}
                  className="absolute bottom-0"
                  style={{
                    left: `${15 + i * 12}%`,
                  }}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="relative">
                    {/* 사람 실루엣 */}
                    <div className="w-20 h-32 bg-gradient-to-t from-green-600/40 to-transparent rounded-t-full" />
                    {/* 대화 풍선 */}
                    <motion.div
                      className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/90 rounded-lg px-3 py-1 text-xs text-green-700"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + i * 0.2 }}
                    >
                      {[
                        "아름다워요",
                        "감동적이에요",
                        "함께해요",
                        "좋아요",
                        "공감돼요",
                        "따뜻해요"
                      ][i]}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* 중앙 콘텐츠 */}
            <div className="absolute inset-0 flex items-center justify-center">
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
                  함께 만들어가는 예술의 정원
                </p>
                
                <motion.button
                  className="px-10 py-5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full text-xl font-bold shadow-2xl relative overflow-hidden group"
                  whileHover={{ scale: 1.05, boxShadow: "0 30px 60px rgba(0,0,0,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/quiz')}
                >
                  <span className="relative z-10">나의 Art Persona 발견하기</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-green-400"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
                
                {/* 현재 접속자 수 */}
                <motion.div
                  className="mt-8 text-green-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  <p className="text-sm">
                    지금 <span className="font-bold">23명</span>이 정원을 거닐고 있어요
                  </p>
                </motion.div>
                
                {/* 마지막 감동적인 메시지 */}
                <motion.div
                  className="mt-12 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 }}
                >
                  <p className="text-green-700 text-center leading-relaxed">
                    "예술은 당신이 누구인지 보여주는 거울이 아니라,<br/>
                    당신이 될 수 있는 모든 가능성을 보여주는 창문입니다."
                  </p>
                  <p className="text-green-600 text-sm mt-4 text-center">
                    - SAYU가 당신의 창문이 되어드릴게요
                  </p>
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
      </div>

      <style jsx>{`
        .maze-floor {
          background-image: 
            linear-gradient(to right, rgba(34, 197, 94, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34, 197, 94, 0.2) 1px, transparent 1px);
          background-size: 80px 80px;
          width: 200%;
          height: 200%;
          position: absolute;
          left: -50%;
          top: -50%;
          transform: rotateX(70deg) translateZ(-100px);
          transform-origin: center center;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
        }
        
        .preserve-3d {
          transform-style: preserve-3d;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-from) 0%, var(--tw-gradient-via) 50%, var(--tw-gradient-to) 100%);
        }
      `}</style>
    </div>
  );
}