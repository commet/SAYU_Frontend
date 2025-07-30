'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

// Cloudinary 유명 작품들
const famousArtworks = [
  {
    id: 1,
    url: 'https://res.cloudinary.com/dsxhxqfz8/image/upload/v1706168043/artvee/Vincent_van_Gogh_-_The_Starry_Night_q6gvkq.jpg',
    title: '별이 빛나는 밤',
    artist: '반 고흐'
  },
  {
    id: 2,
    url: 'https://res.cloudinary.com/dsxhxqfz8/image/upload/v1706168037/artvee/Claude_Monet_-_Water_Lilies_yvkqjx.jpg',
    title: '수련',
    artist: '모네'
  },
  {
    id: 3,
    url: 'https://res.cloudinary.com/dsxhxqfz8/image/upload/v1706168031/artvee/Gustav_Klimt_-_The_Kiss_xvlnpb.jpg',
    title: '키스',
    artist: '클림트'
  },
  {
    id: 4,
    url: 'https://res.cloudinary.com/dsxhxqfz8/image/upload/v1706168025/artvee/Edvard_Munch_-_The_Scream_qwerty.jpg',
    title: '절규',
    artist: '뭉크'
  },
  {
    id: 5,
    url: 'https://res.cloudinary.com/dsxhxqfz8/image/upload/v1706168019/artvee/Paul_Gauguin_-_Tahitian_Women_asdfgh.jpg',
    title: '타히티의 여인들',
    artist: '고갱'
  },
  {
    id: 6,
    url: 'https://res.cloudinary.com/dsxhxqfz8/image/upload/v1706168013/artvee/Johannes_Vermeer_-_Girl_with_a_Pearl_Earring_zxcvbn.jpg',
    title: '진주 귀걸이 소녀',
    artist: '베르메르'
  }
];

export default function JourneyHomePage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
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

  // Transform values based on scroll
  const mazeOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const artworksOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const peopleOpacity = useTransform(scrollYProgress, [0.4, 0.7], [0, 1]);
  const gardenOpacity = useTransform(scrollYProgress, [0.6, 1], [0, 1]);
  
  const lightIntensity = useTransform(scrollYProgress, [0, 1], [0.2, 1]);
  const mazeScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.2]);

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
            {/* 미로 배경 - 깊은 어둠 */}
            <div className="absolute inset-0 bg-gradient-radial from-green-950/20 via-black to-black" />
            
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
            
            {/* 유기적인 미로 벽 패턴 */}
            <svg className="absolute inset-0 w-full h-full opacity-30">
              <defs>
                <pattern id="organic-maze" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                  <path 
                    d="M0,100 Q50,80 100,100 T200,100 M100,0 Q80,50 100,100 T100,200 M50,50 Q70,70 90,50 M150,50 Q130,70 150,90 M50,150 Q70,130 90,150 M150,150 Q130,130 110,150"
                    stroke="rgba(34, 197, 94, 0.3)" 
                    fill="none" 
                    strokeWidth="2"
                  />
                  <circle cx="100" cy="100" r="3" fill="rgba(34, 197, 94, 0.2)" />
                </pattern>
                <filter id="noise">
                  <feTurbulence baseFrequency="0.02" numOctaves="3" seed="1" />
                  <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
                </filter>
              </defs>
              <rect width="100%" height="100%" fill="url(#organic-maze)" />
              <rect width="100%" height="100%" filter="url(#noise)" opacity="0.1" />
            </svg>
            
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
                className="text-6xl font-bold text-white/80 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                길을 잃은 것 같나요?
              </motion.h1>
              <motion.p 
                className="text-xl text-white/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                예술이 당신의 나침반이 되어드릴게요
              </motion.p>
              
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
            
            {/* 3D 공간의 작품들 */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1200px' }}>
              <motion.div 
                className="relative w-full max-w-7xl h-full preserve-3d"
                style={{
                  rotateY: useTransform(smoothMouseX, [-20, 20], [-5, 5]),
                  rotateX: useTransform(smoothMouseY, [-20, 20], [5, -5]),
                }}
              >
                {famousArtworks.map((artwork, i) => {
                  const positions = [
                    { x: -350, y: -150, z: -200, rotateY: 25 },
                    { x: 300, y: -100, z: -100, rotateY: -20 },
                    { x: -200, y: 150, z: 50, rotateY: 15 },
                    { x: 350, y: 100, z: -150, rotateY: -30 },
                    { x: -100, y: -50, z: 100, rotateY: 10 },
                    { x: 150, y: 200, z: -50, rotateY: -15 },
                  ];
                  const pos = positions[i];
                  
                  return (
                    <motion.div
                      key={artwork.id}
                      className="absolute"
                      style={{
                        width: '200px',
                        height: '250px',
                        left: '50%',
                        top: '50%',
                        transform: `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) rotateY(${pos.rotateY}deg)`,
                        transformStyle: 'preserve-3d',
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
                    >
                      {/* 작품 프레임 */}
                      <motion.div
                        className="relative w-full h-full group cursor-pointer"
                        whileHover={{ scale: 1.1, z: 50 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {/* 프레임 */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 rounded-lg p-3 shadow-2xl">
                          <div className="relative w-full h-full bg-white/90 rounded overflow-hidden">
                            <img
                              src={artwork.url}
                              alt={artwork.title}
                              className="w-full h-full object-cover"
                            />
                            {/* 작품 정보 오버레이 */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h3 className="text-white font-bold text-sm">{artwork.title}</h3>
                                <p className="text-white/80 text-xs">{artwork.artist}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* 감상 파티클들 */}
                        <div className="absolute inset-0 pointer-events-none">
                          {[...Array(5)].map((_, j) => (
                            <motion.div
                              key={j}
                              className="absolute w-2 h-2 bg-white/60 rounded-full"
                              style={{
                                left: `${20 + j * 15}%`,
                                top: `${30 + j * 10}%`,
                              }}
                              animate={{
                                y: [-10, -30, -10],
                                opacity: [0.3, 0.8, 0.3],
                                scale: [0.8, 1.2, 0.8],
                              }}
                              transition={{
                                duration: 3 + j * 0.5,
                                repeat: Infinity,
                                delay: j * 0.3,
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
                
                {/* 중앙 메시지 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center"
                  >
                    <p className="text-white/80 text-3xl font-light mb-2">
                      같은 작품, 다른 시선
                    </p>
                    <p className="text-white/60 text-lg">
                      당신만의 해석을 더해보세요
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scene 3: 다른 사람들과의 만남 */}
        <motion.div 
          className="absolute inset-0"
          style={{ opacity: peopleOpacity }}
        >
          <div className="relative w-full h-full">
            {/* 배경 - 더 밝아진 공간 */}
            <div className="absolute inset-0 bg-gradient-to-b from-green-800 to-green-900 opacity-60" />
            
            {/* 사람들 실루엣 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-32 h-40 rounded-full"
                    style={{
                      left: `${Math.cos(i * 72 * Math.PI / 180) * 200}px`,
                      top: `${Math.sin(i * 72 * Math.PI / 180) * 200}px`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <div className="w-full h-full bg-gradient-to-t from-white/20 to-transparent rounded-full" />
                    <div className="text-white/60 text-sm text-center mt-2">
                      같은 작품<br/>다른 시선
                    </div>
                  </motion.div>
                ))}
                
                <div className="text-white text-2xl text-center">
                  혼자가 아닙니다
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scene 4: 밝은 정원 */}
        <motion.div 
          className="absolute inset-0"
          style={{ opacity: gardenOpacity }}
        >
          <div className="relative w-full h-full">
            {/* 밝은 배경 */}
            <div className="absolute inset-0 bg-gradient-to-b from-green-300 via-green-100 to-white" />
            
            {/* 정원 요소들 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-6xl font-bold text-green-800 mb-4">
                  SAYU
                </h2>
                <p className="text-2xl text-green-700 mb-8">
                  함께 만들어가는 예술의 정원
                </p>
                
                <motion.button
                  className="px-8 py-4 bg-green-600 text-white rounded-full text-lg font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/quiz')}
                >
                  정원으로 들어가기
                </motion.button>
              </div>
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