'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMobileScale, mobileVw, mobileClamp } from '@/lib/mobile-scale';

// 저작권 free 유명 작품들 - 데스크톱과 동일
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
      "고요한 평온함",
      "자연과의 조화",
      "빛의 미묘한 변화",
      "인상주의 터치",
      "시간의 흐름",
      "물의 반사"
    ],
    perceptions_en: [
      "Serene tranquility",
      "Harmony with nature",
      "Subtle light changes",
      "Impressionist touches",
      "Flow of time",
      "Water reflections"
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
      "황금빛 사랑",
      "장식적 아름다움",
      "친밀한 순간",
      "비잔틴 영감",
      "패턴의 조화",
      "영원한 포옹"
    ],
    perceptions_en: [
      "Golden love",
      "Decorative beauty",
      "Intimate moment",
      "Byzantine inspiration",
      "Pattern harmony",
      "Eternal embrace"
    ]
  }
];

// 3명의 testimonials - 데스크톱과 동일
const testimonials = [
  {
    name: "민지",
    name_en: "Emily",
    aptType: "LAEF",
    emoji: "🦊",
    quote: <>매일 아침 <strong className="text-lime-300 font-bold">감정에 맞는 작품</strong>을 보며 하루를 시작해요.{"\n"}예전엔 몰랐던 제 감정의 깊이를 이해하게 되었어요.</>,
    quote_en: "I start each day by viewing artworks that match my emotions. I've come to understand the depth of my feelings that I never knew before."
  },
  {
    name: "준호",
    name_en: "James",
    aptType: "SREC",
    emoji: "🦆",
    quote: <><strong className="text-lime-300 font-bold">전시 동행 매칭</strong>으로 만난 친구와 매주 미술관을 가요.{"\n"}혼자서는 못 봤을 작품들을 함께 감상하니 더 풍부해져요.</>,
    quote_en: "Weekly museum visits with my exhibition companion opened my eyes to artworks I'd never have discovered alone."
  },
  {
    name: "서연",
    name_en: "Sarah",
    aptType: "LAMF",
    emoji: "🦉",
    quote: <><strong className="text-lime-300 font-bold">AI 상담사와 대화</strong>하면서 제가 왜 특정 작품에 끌리는지{"\n"}알게 되었어요. 예술이 제 마음의 거울이 되어주고 있어요.</>,
    quote_en: "Through conversations with the AI counselor, I learned why I'm drawn to certain artworks. Art has become a mirror to my heart."
  }
];

export default function MobileHomePageFixed() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentArtwork, setCurrentArtwork] = useState(0);
  const [currentScene, setCurrentScene] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const scale = useMobileScale();

  // 자동 작품 전환
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentArtwork((prev) => (prev + 1) % famousArtworks.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 터치 스와이프 처리
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSwipeUp = distance > 50;
    const isSwipeDown = distance < -50;
    
    if (isSwipeUp && currentScene < 3) {
      setCurrentScene(currentScene + 1);
      // 프로그래매틱하게 스크롤
      const sections = containerRef.current?.querySelectorAll('section');
      sections?.[currentScene + 1]?.scrollIntoView({ behavior: 'smooth' });
    }
    
    if (isSwipeDown && currentScene > 0) {
      setCurrentScene(currentScene - 1);
      const sections = containerRef.current?.querySelectorAll('section');
      sections?.[currentScene - 1]?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 스크롤 이벤트로 현재 Scene 추적
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const windowHeight = window.innerHeight;
      const newScene = Math.round(scrollTop / windowHeight);
      setCurrentScene(Math.min(3, Math.max(0, newScene)));
    };

    containerRef.current?.addEventListener('scroll', handleScroll);
    return () => containerRef.current?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="h-screen overflow-y-auto relative -mt-14"
      style={{
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        scrollSnapType: 'y proximity',
        scrollPaddingTop: '0px',
        overscrollBehavior: 'contain'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 모바일 플로팅 네비게이션 - 언어 전환 */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <motion.button
          className="bg-black/20 backdrop-blur-md rounded-full px-3 py-2 text-white/80 text-xs font-medium border border-white/20"
          whileTap={{ scale: 0.95 }}
          onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
        >
          {language === 'ko' ? 'EN' : '한글'}
        </motion.button>
      </div>
      
      {/* Scene 인디케이터 - 왼쪽 사이드 */}
      <div className="fixed left-3 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        {[0, 1, 2, 3].map((scene) => (
          <motion.div
            key={scene}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              currentScene === scene 
                ? 'bg-white w-1.5 h-4' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
            whileTap={{ scale: 0.8 }}
            onClick={() => {
              setCurrentScene(scene);
              const sections = containerRef.current?.querySelectorAll('section');
              sections?.[scene]?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        ))}
      </div>
      {/* Scene 1: 미로 입구 - 100vh */}
      <section className="h-screen w-full snap-start snap-always overflow-hidden">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-900" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
          
          {/* 안개 효과 */}
          <div className="absolute inset-0">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full opacity-20"
                style={{
                  left: `${(i * 33) + 17}%`,
                  top: `${(i * 25) + 20}%`,
                  width: mobileVw(60 + (i * 15), 90),
                  height: mobileVw(60 + (i * 15), 90),
                  background: `radial-gradient(circle, rgba(100, 100, 120, 0.3) 0%, transparent 70%)`,
                  filter: 'blur(30px)',
                }}
                animate={{
                  x: [0, 15, 0],
                  y: [0, -20, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 8 + (i * 2),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 2,
                }}
              />
            ))}
          </div>
          
          {/* 미로 패턴 */}
          <div className="absolute inset-0 flex items-center justify-center opacity-15">
            <svg className="w-4/5 h-4/5" viewBox="0 0 400 600">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle cx="200" cy="300" r="60" fill="none" stroke="rgba(150, 150, 200, 0.4)" strokeWidth="1" filter="url(#glow)" />
              <circle cx="200" cy="300" r="100" fill="none" stroke="rgba(140, 140, 190, 0.3)" strokeWidth="1" strokeDasharray="15 8" />
              <circle cx="200" cy="300" r="140" fill="none" stroke="rgba(130, 130, 180, 0.2)" strokeWidth="1" strokeDasharray="20 10" />
            </svg>
          </div>
          
          {/* 메인 텍스트 - 위치를 위로 이동 */}
          <div className="relative z-10 flex flex-col items-center px-6 pt-28">
            <motion.h1 
              className={`font-bold text-white/90 text-center ${language === 'ko' ? 'whitespace-nowrap' : 'whitespace-pre-line'}`}
              style={{
                fontSize: mobileClamp(23, 27, 31),
                lineHeight: '1.25',
                marginBottom: scale.spacing.lg,
                letterSpacing: language === 'ko' ? '-0.03em' : 'normal'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              {language === 'ko' 
                ? '하루에도 몇 번씩 바뀌는 마음,'
                : 'Your feelings\nshift like the tides,'}
            </motion.h1>
            
            <motion.p 
              className="text-white/70 text-center"
              style={{
                fontSize: scale.fontSize.lg,
                marginBottom: scale.spacing.lg
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {language === 'ko'
                ? '어떤 게 진짜 나인지 헷갈리시나요?'
                : 'Wondering which one is the real you?'}
            </motion.p>
            
            {/* 구분 요소 - 작은 점 3개 */}
            <motion.div 
              className="flex justify-center gap-3"
              style={{
                marginTop: scale.spacing.xl,
                marginBottom: scale.spacing.xl
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.4, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="w-1 h-1 bg-white/40 rounded-full"></div>
              <div className="w-1 h-1 bg-white/60 rounded-full"></div>
              <div className="w-1 h-1 bg-white/40 rounded-full"></div>
            </motion.div>
            
            <motion.p 
              className="text-white/60 text-center px-4 italic"
              style={{
                fontSize: scale.fontSize.base,
                marginBottom: scale.spacing.md
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              {language === 'ko'
                ? '예술과 함께 진정한 나를 발견하는 여정'
                : "Begin your artistic journey"}
            </motion.p>

            {/* 서비스 가치 명확화 - 모바일 최적화 */}
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-xl mx-2 w-full max-w-sm"
              style={{
                padding: `${scale.spacing.sm}px ${scale.spacing.md}px`,
                marginBottom: scale.spacing.lg
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-base mb-1">✨</span>
                  <p className="text-white/90 text-[9px] font-medium leading-tight">
                    {language === 'ko' ? '5분 만에' : 'Discover in'}
                  </p>
                  <p className="text-white/70 text-[8px] leading-tight">
                    {language === 'ko' ? '예술 성향' : '5 minutes'}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-base mb-1">🤝</span>
                  <p className="text-white/90 text-[9px] font-medium leading-tight">
                    {language === 'ko' ? '완벽한 매칭' : 'Perfect match'}
                  </p>
                  <p className="text-white/70 text-[8px] leading-tight">
                    {language === 'ko' ? '전시 동행' : 'Companions'}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-base mb-1">🎨</span>
                  <p className="text-white/90 text-[9px] font-medium leading-tight">
                    {language === 'ko' ? 'AI 추천' : 'AI-powered'}
                  </p>
                  <p className="text-white/70 text-[8px] leading-tight">
                    {language === 'ko' ? '맞춤 전시' : 'Art recs'}
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.button
              className="bg-white/10 backdrop-blur-lg rounded-full border border-white/20 active:scale-95"
              style={{
                paddingLeft: scale.spacing.xl,
                paddingRight: scale.spacing.xl,
                paddingTop: scale.spacing.md,
                paddingBottom: scale.spacing.md,
                minHeight: `${scale.touchTarget}px`
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              onClick={() => router.push('/quiz')}
            >
              <span className="text-white/90 font-medium" style={{ fontSize: scale.fontSize.lg }}>
                {language === 'ko' ? '나의 예술 여정 시작하기' : 'Begin My Art Journey'}
              </span>
            </motion.button>
            
            {/* 스크롤 유도 화살표 */}
            <motion.div
              className="mt-12 text-white/60"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Scene 2: 미로 속 작품들 - 100vh (배경색 수정: 녹색) */}
      <section className="h-screen w-full snap-start snap-always overflow-hidden">
        <div className="relative w-full h-full bg-gradient-to-b from-green-900 to-green-950">
          <div className="h-full flex flex-col p-4 pt-12">
            {/* 헤더 */}
            <div className="text-center mb-3">
              <h2 className="text-white font-bold" style={{ fontSize: mobileClamp(22, 26, 30) }}>
                {language === 'ko' ? '같은 작품, 다른 시선' : 'Same Art, Different Eyes'}
              </h2>
              <p className="text-white/70 mt-1" style={{ fontSize: scale.fontSize.sm }}>
                {language === 'ko' ? '16가지 Art Persona가 바라보는 각자의 예술 세계' : '16 unique perspectives'}
              </p>
            </div>
            
            {/* 작품 */}
            <div className="flex justify-center mb-2">
              <div className="relative" style={{ width: mobileVw(320, 340), height: mobileVw(200, 240) }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentArtwork}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <img
                      src={famousArtworks[currentArtwork].url}
                      alt={famousArtworks[currentArtwork].title}
                      className="w-full h-full object-cover rounded-xl shadow-2xl"
                    />
                    <div className="absolute bottom-2 left-4 right-4">
                      <p className="text-white font-bold" style={{ fontSize: scale.fontSize.sm }}>
                        {language === 'ko' ? famousArtworks[currentArtwork].title : famousArtworks[currentArtwork].title_en}
                      </p>
                      <p className="text-white/80" style={{ fontSize: scale.fontSize.xs }}>
                        {language === 'ko' ? famousArtworks[currentArtwork].artist : famousArtworks[currentArtwork].artist_en}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            
            {/* 인디케이터 */}
            <div className="flex justify-center gap-1 mb-2">
              {famousArtworks.map((_, i) => (
                <button
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === currentArtwork ? 'w-6 bg-white/80' : 'w-1 bg-white/30'
                  }`}
                  onClick={() => setCurrentArtwork(i)}
                />
              ))}
            </div>
            
            {/* 6개 감상 포인트 - 높이 통일 */}
            <div className="grid grid-cols-3 gap-1 mb-4">
              {(language === 'ko' 
                ? famousArtworks[currentArtwork].perceptions 
                : famousArtworks[currentArtwork].perceptions_en
              ).map((perception, i) => (
                <motion.div
                  key={i}
                  className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-2 text-center flex items-center justify-center border border-white/30"
                  style={{ minHeight: '32px', height: '32px' }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <p className="text-white text-[11px] font-medium leading-tight whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                    {perception}
                  </p>
                </motion.div>
              ))}
            </div>
            
            {/* 3개 기능 카드 - 높이 줄이기 */}
            <div className="flex flex-col gap-1.5 mt-2">
              {[
                { icon: '👁️', title: language === 'ko' ? '시선 공유' : 'Share Perspectives', 
                  desc: language === 'ko' ? '나만의 해석을 공유하고 다른 시선 발견' : 'Share your unique interpretation' },
                { icon: '🤝', title: language === 'ko' ? '전시 동행 매칭' : 'Exhibition Companions',
                  desc: language === 'ko' ? '나와 맞는 Art Persona와 전시 관람' : 'Meet Art Personas like you' },
                { icon: '🤖', title: language === 'ko' ? 'AI 아트 큐레이터' : 'AI Art Curator',
                  desc: language === 'ko' ? '시시각각 변하는 당신을 위한 매일 새로운 큐레이션' : 'Daily curation for the ever-changing you' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  className="bg-gradient-to-r from-emerald-600/30 to-teal-600/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-emerald-400/40 flex items-center gap-2"
                  style={{ minHeight: '48px' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="text-lg">{item.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-xs">
                      {item.title}
                    </h3>
                    <p className="text-white/80 text-[10px]" style={{ lineHeight: '1.3' }}>
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Scene 3: 다른 사람들과의 만남 - 100vh with 3 testimonials */}
      <section className="h-screen w-full snap-start snap-always overflow-hidden">
        <div className="relative w-full h-full bg-gradient-to-b from-green-800 to-green-900">
          <div className="h-full flex flex-col p-4 pt-12">
            {/* 타이틀 */}
            <div className="text-center mb-3">
              <h2 className="text-white font-bold" style={{ fontSize: mobileClamp(20, 24, 28) }}>
                {language === 'ko' ? '혼자가 아닙니다' : 'You Are Not Alone'}
              </h2>
              <p className="text-white/80" style={{ 
                fontSize: scale.fontSize.sm,
                letterSpacing: language === 'en' ? '-0.02em' : 'normal'
              }}>
                {language === 'ko' 
                  ? '이미 많은 사람들이 SAYU와 함께하고 있어요'
                  : 'Many people are already joining the SAYU journey'}
              </p>
            </div>
            
            {/* 3명의 testimonials */}
            <div className="flex flex-col gap-1.5 mb-2">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-center py-1.5 px-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className="mb-0.5">
                    <span className="text-lg">{testimonial.emoji}</span>
                  </div>
                  <p className="text-white/90 text-sm mb-1 leading-relaxed whitespace-pre-line italic">
                    {language === 'ko' ? testimonial.quote : testimonial.quote_en}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-white/80 font-medium text-xs">
                      {language === 'ko' ? testimonial.name : testimonial.name_en}
                    </p>
                    <span className="text-white/60 text-xs">•</span>
                    <p className="text-white/70 text-xs">{testimonial.aptType}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* 첫 동행자 혜택 - testimonials와 간격 추가 */}
            <motion.div 
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-lg p-3 border border-white/20 mt-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white font-bold" style={{ 
                  fontSize: language === 'en' ? scale.fontSize.sm : scale.fontSize.base 
                }}>
                  {language === 'ko' ? '첫 동행자를 위한 특별 혜택' : 'Special Benefits for Early Companions'}
                </h3>
                <span className="text-xl">🎁</span>
              </div>
              <p className="text-white/80 text-center mb-1" style={{ 
                fontSize: language === 'en' ? '11px' : scale.fontSize.xs,
                letterSpacing: language === 'en' ? '-0.01em' : 'normal'
              }}>
                {language === 'ko' 
                  ? 'SAYU의 첫 100명과 함께 특별한 여정을 시작하세요'
                  : 'Start a special journey with the first 100 members of SAYU'}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-lg mb-1">🌱</div>
                  <p className="text-white/90 text-[10px] font-medium">
                    {language === 'ko' ? '신규 기능 우선 공개' : 'Early Access'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-lg mb-1">🎖️</div>
                  <p className="text-white/90 text-[10px] font-medium">
                    {language === 'ko' ? '창립 멤버 배지' : 'Founding Badge'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-lg mb-1">🗣️</div>
                  <p className="text-white/90 text-[10px] font-medium">
                    {language === 'ko' ? '함께 만드는 서비스' : 'Co-create'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Scene 4: 밝은 정원 - 100vh */}
      <section className="h-screen w-full snap-start snap-always overflow-hidden">
        <div className="relative w-full h-full bg-gradient-to-b from-green-300 via-green-100 to-white">
          {/* 빛 입자들 */}
          <div className="absolute inset-0">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${(i * 25) + 12}%`,
                  top: `${(i * 20) + 10}%`,
                  width: '60px',
                  height: '60px',
                  background: `radial-gradient(circle, rgba(255,255,255,0.${i+3}) 0%, transparent 70%)`,
                  filter: 'blur(30px)',
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 6 + i * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1.5,
                }}
              />
            ))}
          </div>
          
          {/* 꽃잎들 */}
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-pink-300/40 rounded-full blur-sm"
                style={{
                  left: `${(i * 16) + 8}%`,
                  top: '-10%',
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  x: [0, (i % 2 === 0 ? 20 : -20)],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 8 + (i * 2),
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.8,
                }}
              />
            ))}
          </div>
          
          {/* 중앙 콘텐츠 */}
          <div className="relative z-10 h-full flex flex-col items-center px-6" style={{ paddingTop: '15vh' }}>
            <motion.h2 
              className="text-green-800 font-bold text-center font-serif tracking-wide"
              style={{
                fontSize: mobileClamp(36, 42, 48),
                marginBottom: scale.spacing.sm,
                fontFamily: "'Playfair Display', 'Noto Serif KR', serif",
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                letterSpacing: '0.05em'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              SAYU
            </motion.h2>
            
            <p className="text-green-700 text-center mb-6" style={{ fontSize: scale.fontSize.base }}>
              {language === 'ko' ? '함께 만들어가는 예술의 정원' : 'A Garden of Art We Create Together'}
            </p>
            
            {/* 16개 SAYU Personality 동물 이모지 */}
            <div className="mb-6">
              <div className="grid grid-cols-8 gap-1 mb-2">
                {['🦊', '🐱', '🦉', '🐢', '🦎', '🦔', '🐙', '🦫'].map((emoji, i) => (
                  <motion.div
                    key={i}
                    className="text-xl"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.8, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                  >
                    {emoji}
                  </motion.div>
                ))}
              </div>
              <div className="grid grid-cols-8 gap-1">
                {['🦋', '🐧', '🦜', '🦌', '🐕', '🦆', '🐘', '🦅'].map((emoji, i) => (
                  <motion.div
                    key={i}
                    className="text-xl"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.8, scale: 1 }}
                    transition={{ delay: 0.9 + i * 0.05 }}
                  >
                    {emoji}
                  </motion.div>
                ))}
              </div>
            </div>
            
            <p className="text-green-600/70 text-xs mb-4">
              {language === 'ko' 
                ? '16가지 Art Persona가 당신을 기다리고 있습니다'
                : '16 Art Personas are waiting for you'
              }
            </p>
            
            <motion.button
              className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full font-bold shadow-xl"
              style={{
                paddingLeft: scale.spacing.xl,
                paddingRight: scale.spacing.xl,
                paddingTop: scale.spacing.md,
                paddingBottom: scale.spacing.md,
                fontSize: scale.fontSize.lg,
                minHeight: `${scale.touchTarget}px`
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/quiz')}
            >
              {language === 'ko' ? '나의 Art Persona 발견하기' : 'Discover My Art Persona'}
            </motion.button>
            
            <motion.div
              className="mt-4 text-green-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p style={{ fontSize: scale.fontSize.sm }}>
                  {language === 'ko' 
                    ? <>오늘 <span className="font-bold">47명</span>이 새로운 Art Persona를 발견했어요</>
                    : <>Today <span className="font-bold">47 people</span> discovered their Art Persona</>
                  }
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}