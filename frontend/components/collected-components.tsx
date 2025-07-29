// 수집한 컴포넌트 목록 관리

export type ComponentStatus = 'collected' | 'customized' | 'integrated';

export interface CollectedComponent {
  name: string;
  path: string;
  status: ComponentStatus;
  notes: string;
  dependencies?: string[];
  originalSource?: string;
  dateCollected?: string;
}

export type { CollectedComponent as CollectedComponentType };

export const collectedComponents: Record<string, CollectedComponent> = {
  aurora: {
    name: 'AuroraBackground',
    path: '@/components/ui/aurora-background',
    status: 'collected',
    notes: '감정 페이지 배경 효과로 사용 예정',
    dependencies: ['framer-motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  retroGrid: {
    name: 'RetroGrid',
    path: '@/components/ui/retro-grid',
    status: 'collected',
    notes: '레트로 스타일 그리드 배경',
    dependencies: [],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  heroHighlight: {
    name: 'HeroHighlight',
    path: '@/components/ui/hero-highlight',
    status: 'collected',
    notes: '마우스 호버 인터랙션이 있는 히어로 섹션',
    dependencies: ['framer-motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  beamsBackground: {
    name: 'BeamsBackground',
    path: '@/components/ui/beams-background',
    status: 'collected',
    notes: '애니메이션 빔 효과가 있는 다이나믹 배경',
    dependencies: ['motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  animatedGridPattern: {
    name: 'AnimatedGridPattern',
    path: '@/components/ui/animated-grid-pattern',
    status: 'collected',
    notes: '동적으로 애니메이션되는 그리드 패턴 배경',
    dependencies: ['framer-motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  backgroundBeams: {
    name: 'BackgroundBeams',
    path: '@/components/ui/background-beams',
    status: 'collected',
    notes: '그라디언트 빔 애니메이션 배경',
    dependencies: ['framer-motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  glowingEffect: {
    name: 'GlowingEffect',
    path: '@/components/ui/glowing-effect',
    status: 'collected',
    notes: '마우스 호버시 글로우 효과가 나타나는 카드 래퍼',
    dependencies: ['motion', 'lucide-react'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  gallery4: {
    name: 'Gallery4',
    path: '@/components/ui/gallery4',
    status: 'collected',
    notes: '캐러셀 기반 갤러리 컴포넌트, 아트워크 전시에 적합',
    dependencies: ['lucide-react', '@radix-ui/react-slot', 'class-variance-authority', 'embla-carousel-react'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  testimonialsColumns1: {
    name: 'TestimonialsColumn',
    path: '@/components/ui/testimonials-columns-1',
    status: 'collected',
    notes: '자동 스크롤 되는 후기 컬럼 컴포넌트',
    dependencies: ['motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  animatedTooltip: {
    name: 'AnimatedTooltip',
    path: '@/components/ui/animated-tooltip',
    status: 'collected',
    notes: '호버시 애니메이션 툴팁이 나타나는 아바타 목록',
    dependencies: ['framer-motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  sparkles: {
    name: 'Sparkles',
    path: '@/components/ui/sparkles',
    status: 'collected',
    notes: '파티클 효과가 있는 반짝이는 배경',
    dependencies: ['@tsparticles/slim', '@tsparticles/react', 'next-themes'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  customersSection: {
    name: 'CustomersSection',
    path: '@/components/ui/customers-section',
    status: 'collected',
    notes: '고객사 로고 그리드 애니메이션 섹션',
    dependencies: ['lucide-react', 'framer-motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  retroTestimonial: {
    name: 'RetroTestimonial',
    path: '@/components/ui/retro-testimonial',
    status: 'collected',
    notes: '빈티지 스타일의 확장 가능한 후기 캐러셀, 풀스크린 뷰 지원',
    dependencies: ['framer-motion', 'lucide-react'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  aboutUsSection: {
    name: 'AboutUsSection',
    path: '@/components/ui/about-us-section',
    status: 'collected',
    notes: '인테리어/건축 회사용 About Us 섹션, 서비스 소개와 통계 포함',
    dependencies: ['framer-motion', 'lucide-react'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  shuffleGrid: {
    name: 'ShuffleGrid',
    path: '@/components/ui/shuffle-grid',
    status: 'collected',
    notes: '자동으로 섞이는 이미지 그리드 히어로 섹션',
    dependencies: ['framer-motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  featureWithImageComparison: {
    name: 'FeatureWithImageComparison',
    path: '@/components/ui/feature-with-image-comparison',
    status: 'collected',
    notes: '드래그로 이미지 비교하는 인터랙티브 기능 섹션',
    dependencies: ['lucide-react', 'class-variance-authority'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  compare: {
    name: 'Compare',
    path: '@/components/ui/compare',
    status: 'collected',
    notes: '고급 이미지 비교 슬라이더, 스파클 효과와 자동 재생 지원',
    dependencies: ['framer-motion', '@tabler/icons-react', '@tsparticles/slim', '@tsparticles/react', '@tsparticles/engine'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  imageComparison: {
    name: 'ImageComparison',
    path: '@/components/ui/image-comparison',
    status: 'collected',
    notes: 'Context 기반 이미지 비교 컴포넌트, 드래그/호버 모드와 스프링 애니메이션 지원',
    dependencies: ['framer-motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  macOsDock: {
    name: 'MacOSDock',
    path: '@/components/ui/mac-os-dock',
    status: 'collected',
    notes: 'macOS 스타일 독 네비게이션, 호버 확대 효과와 반응형 디자인',
    dependencies: [],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  interactiveBentoGallery: {
    name: 'InteractiveBentoGallery',
    path: '@/components/ui/interactive-bento-gallery',
    status: 'collected',
    notes: '드래그 가능한 벤토 그리드 갤러리, 비디오 지원과 모달 뷰',
    dependencies: ['framer-motion', 'lucide-react'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  dock: {
    name: 'Dock',
    path: '@/components/ui/dock',
    status: 'collected',
    notes: 'Apple 스타일 독 컴포넌트, Context API 기반 확대 효과',
    dependencies: ['framer-motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  dockTwo: {
    name: 'DockTwo',
    path: '@/components/ui/dock-two',
    status: 'collected',
    notes: '플로팅 애니메이션 독, 심플한 구조와 툴팁 지원',
    dependencies: ['framer-motion', 'lucide-react'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  liquidGlass: {
    name: 'LiquidGlass',
    path: '@/components/ui/liquid-glass',
    status: 'collected',
    notes: '유리 모핑 효과의 독과 버튼, SVG 필터 기반 왜곡 효과',
    dependencies: [],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  fluidMenu: {
    name: 'FluidMenu',
    path: '@/components/ui/fluid-menu',
    status: 'collected',
    notes: '부드러운 원형 메뉴, 확장 시 아이콘 전환 애니메이션',
    dependencies: ['lucide-react'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  animatedDock: {
    name: 'AnimatedDock',
    path: '@/components/ui/animated-dock',
    status: 'collected',
    notes: 'macOS 스타일 독 네비게이션, 마우스 호버 시 확대 애니메이션',
    dependencies: ['framer-motion', 'clsx', 'tailwind-merge'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  bentoGrid: {
    name: 'BentoGrid',
    path: '@/components/ui/bento-grid',
    status: 'collected',
    notes: '벤토 박스 스타일 그리드 레이아웃, 호버 애니메이션과 반응형 디자인',
    dependencies: ['@radix-ui/react-icons', '@radix-ui/react-slot', 'class-variance-authority'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  displayCards: {
    name: 'DisplayCards',
    path: '@/components/ui/display-cards',
    status: 'collected',
    notes: '3D 스택 카드 효과, 스큐 변형과 호버 애니메이션',
    dependencies: ['lucide-react'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  featureSection: {
    name: 'FeatureSteps',
    path: '@/components/ui/feature-section',
    status: 'collected',
    notes: '자동 재생 스텝 가이드, 이미지 전환 애니메이션',
    dependencies: ['framer-motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  radialOrbitalTimeline: {
    name: 'RadialOrbitalTimeline',
    path: '@/components/ui/radial-orbital-timeline',
    status: 'collected',
    notes: '3D 궤도 타임라인, 자동 회전과 연결된 노드 시각화',
    dependencies: ['lucide-react', '@radix-ui/react-slot', 'class-variance-authority'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  sectionWithMockup: {
    name: 'SectionWithMockup',
    path: '@/components/ui/section-with-mockup',
    status: 'collected',
    notes: '앱 목업 프레젠테이션 섹션, 3D 카드 효과와 역방향 레이아웃 지원',
    dependencies: ['framer-motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  lamp: {
    name: 'Lamp',
    path: '@/components/ui/lamp',
    status: 'collected',
    notes: '빛나는 램프 효과 히어로 섹션, 원뿔형 그라디언트 애니메이션',
    dependencies: ['framer-motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  canvas: {
    name: 'Canvas',
    path: '@/components/ui/canvas',
    status: 'collected',
    notes: '인터랙티브 캔버스 애니메이션, 마우스 추적 파티클 트레일',
    dependencies: [],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  scrollExpansionHero: {
    name: 'ScrollExpansionHero',
    path: '@/components/ui/scroll-expansion-hero',
    status: 'collected',
    notes: '스크롤 기반 미디어 확장 히어로, 동영상/이미지 지원과 터치 인터랙션',
    dependencies: ['framer-motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  etheralShadow: {
    name: 'EtheralShadow',
    path: '@/components/ui/etheral-shadow',
    status: 'collected',
    notes: 'SVG 필터 기반 그림자 오버레이, 애니메이션과 노이즈 효과 지원. SAYU 감정 표현에 적합',
    dependencies: ['framer-motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  containerScrollAnimation: {
    name: 'ContainerScrollAnimation',
    path: '@/components/ui/container-scroll-animation',
    status: 'collected',
    notes: '스크롤 기반 3D 컨테이너 애니메이션, 갤러리 소개나 기능 프레젠테이션에 적합',
    dependencies: ['framer-motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  textReveal: {
    name: 'TextRevealByWord',
    path: '@/components/ui/text-reveal',
    status: 'collected',
    notes: '스크롤에 따라 단어별로 나타나는 텍스트 애니메이션, 브랜드 메시지나 철학 전달에 효과적',
    dependencies: ['framer-motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  animatedTestimonials: {
    name: 'AnimatedTestimonials',
    path: '@/components/ui/animated-testimonials',
    status: 'collected',
    notes: '3D 카드 스택 효과가 있는 후기 슬라이더, 단어별 타이핑 애니메이션 지원. 사용자 후기 전시에 최적화',
    dependencies: ['framer-motion', '@tabler/icons-react'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  gooeyTextMorphing: {
    name: 'GooeyText',
    path: '@/components/ui/gooey-text-morphing',
    status: 'collected',
    notes: 'SVG 필터 기반 끈적한 텍스트 모핑 애니메이션, 브랜드 키워드나 동적 타이틀에 임팩트 있는 효과',
    dependencies: [],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  textEffect: {
    name: 'TextEffect',
    path: '@/components/ui/text-effect',
    status: 'collected',
    notes: '다양한 프리셋과 커스텀 애니메이션을 지원하는 텍스트 효과 컴포넌트, 글자/단어/줄 단위 애니메이션 가능',
    dependencies: ['framer-motion'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  heroWithVideo: {
    name: 'NavbarHero',
    path: '@/components/ui/hero-with-video',
    status: 'collected',
    notes: '고급 네비게이션과 비디오 배경을 가진 히어로 섹션. 드롭다운 메뉴, 비디오 컨트롤, 이메일 가입, 반응형 모바일 메뉴 포함. SAYU 전용 데모 5개 구현',
    dependencies: ['next-themes', 'lucide-react'],
    originalSource: '21st.dev',
    dateCollected: '2025-01-28'
  },
  v0AiChat: {
    name: 'VercelV0Chat',
    path: '@/components/ui/v0-ai-chat',
    status: 'collected',
    notes: 'Vercel V0 스타일 AI 채팅 인터페이스. 자동 리사이즈 텍스트에어리어, 파일 첨부, 액션 버튼 포함. SAYU AI 큐레이터, APT 테스트, 작품 분석용 변형 구현',
    dependencies: ['lucide-react'],
    originalSource: 'v0.dev',
    dateCollected: '2025-01-28'
  },
  animatedAiChat: {
    name: 'AnimatedAIChat',
    path: '@/components/ui/animated-ai-chat',
    status: 'collected',
    notes: '고급 애니메이션이 적용된 AI 채팅 인터페이스. 커맨드 팔레트, 파일 첨부, 타이핑 애니메이션, 마우스 추적 글로우 효과 포함. SAYU AI 큐레이터 전용 변형 3개 구현',
    dependencies: ['lucide-react', 'framer-motion'],
    originalSource: 'custom',
    dateCollected: '2025-01-28'
  },
  badgeNew: {
    name: 'BadgeNew',
    path: '@/components/ui/badge-new',
    status: 'collected',
    notes: '다양한 색상 변형과 크기를 지원하는 새로운 배지 컴포넌트. 11가지 색상 변형(gray, blue, purple, amber, red, pink, green, teal, inverted, trial, turbo), 3가지 크기, 아이콘 지원. SAYU APT 성격 유형, 전시회 현황, 작품 태그용 변형 구현',
    dependencies: ['lucide-react'],
    originalSource: 'custom',
    dateCollected: '2025-01-28'
  },
  award: {
    name: 'Awards',
    path: '@/components/ui/award',
    status: 'collected',
    notes: '6가지 다양한 스타일의 성과 인증 컴포넌트. stamp(도장), award(상장), certificate(인증서), badge(배지), sticker(스티커), id-card(멤버십카드) 변형 지원. 4가지 레벨(bronze, silver, gold, platinum)과 SVG 기반 복잡한 디자인. SAYU APT 성과, 전시회 참여 인증, 스티커 컬렉션용 구현',
    dependencies: ['lucide-react'],
    originalSource: 'custom',
    dateCollected: '2025-01-28'
  },
  rainbowButton: {
    name: 'RainbowButton',
    path: '@/components/ui/rainbow-button',
    status: 'collected',
    notes: '무지개 그라디언트 애니메이션이 적용된 프리미엄 버튼 컴포넌트. 5가지 색상으로 구성된 레인보우 애니메이션, 글로우 효과, 라이트/다크 모드 지원. SAYU 프리미엄 멤버십, AI 아트 프로필 생성, 커뮤니티 참여 등 주요 액션용 구현. Tailwind 설정과 CSS 변수 업데이트 필요',
    dependencies: [],
    originalSource: 'custom',
    dateCollected: '2025-01-28'
  },
  rainbowButtonV2: {
    name: 'RainbowButtonV2',
    path: '@/components/ui/rainbow-button-v2',
    status: 'collected',
    notes: '새로운 버전의 레인보우 그라디언트 버튼 컴포넌트. 향상된 그라디언트 효과와 성능 최적화. SAYU AI 창작 스튜디오, VIP 갤러리 투어, 아트 컬렉터 클럽 등 고급 서비스용 구현. 동일한 CSS 변수와 애니메이션 사용',
    dependencies: ['lucide-react'],
    originalSource: 'custom',
    dateCollected: '2025-01-28'
  },
  themeToggle: {
    name: 'ThemeToggle',
    path: '@/components/ui/theme-toggle',
    status: 'collected',
    notes: '부드러운 애니메이션이 적용된 라이트/다크 모드 토글 스위치. Sun/Moon 아이콘이 슬라이드되는 시각적 효과와 함께 테마 전환. SAYU 갤러리 뷰어, APT 테스트, 커뮤니티 인터페이스에서 최적의 감상 환경 제공. next-themes 연동 준비 완료',
    dependencies: ['lucide-react'],
    originalSource: 'custom',
    dateCollected: '2025-01-28'
  },
  calendarWithEventSlots: {
    name: 'Calendar31',
    path: '@/components/ui/calendar-with-event-slots',
    status: 'collected',
    notes: 'react-day-picker 기반 이벤트 스케줄링 달력 컴포넌트. 날짜 선택과 해당일의 이벤트 목록 표시, 카드 레이아웃으로 이벤트 정보 제공. SAYU 전시회 일정 관리, 커뮤니티 이벤트 달력, APT 테스트 예약 시스템용 3가지 변형 구현. 시간 포맷팅과 이벤트 색상 분류 지원',
    dependencies: ['react-day-picker', 'little-date', 'lucide-react'],
    originalSource: 'custom',
    dateCollected: '2025-01-28'
  },
  fullscreenCalendar: {
    name: 'FullScreenCalendar',
    path: '@/components/ui/fullscreen-calendar',
    status: 'collected',
    notes: 'date-fns 기반 전체 화면 캘린더 컴포넌트. 월별 그리드 뷰, 이벤트 표시, 반응형 디자인 지원. 데스크톱에서는 상세 이벤트 카드, 모바일에서는 도트 표시. SAYU 갤러리 전시 관리자, 커뮤니티 활동 달력, 큐레이터 전용 이벤트 관리자 3가지 변형 구현. Today 버튼, 월 네비게이션, 새 이벤트 추가 기능 포함',
    dependencies: ['date-fns', 'lucide-react', '@radix-ui/react-slot', 'class-variance-authority', '@radix-ui/react-separator'],
    originalSource: 'custom',
    dateCollected: '2025-01-28'
  },
  threeDCarousel: {
    name: 'ThreeDPhotoCarousel',
    path: '@/components/ui/3d-carousel',
    status: 'collected',
    notes: 'framer-motion 기반 3D 원통형 포토 캐러셀 컴포넌트. 드래그로 회전 조작, 클릭으로 이미지 확대, 반응형 실린더 크기 조정. 3D 변환과 스프링 애니메이션으로 자연스러운 상호작용 구현. SAYU 갤러리 아트워크 쇼케이스, 아티스트 포트폴리오 3D 갤러리, VIP 컬렉터 프라이빗 갤러리 3가지 변형 구현. 고급 미술품 감상과 포트폴리오 전시에 최적화',
    dependencies: ['framer-motion'],
    originalSource: 'custom',
    dateCollected: '2025-01-28'
  },
  perspectiveCarousel: {
    name: 'PerspectiveCarousel',
    path: '@/components/ui/perspective-carousel',
    status: 'collected',
    notes: '3D perspective 효과와 마우스 추적 기능을 가진 프리미엄 캐러셀 컴포넌트. rotateX 변환으로 원근감 구현, 마우스 움직임에 따른 실시간 3D 변환, 슬라이드 클릭 상호작용. SAYU 특별 전시회 하이라이트, 추천 아티스트 스포트라이트, 커뮤니티 피처드 콘텐츠 3가지 변형 구현. 고급 콘텐츠 프레젠테이션과 인터랙티브 갤러리에 최적화',
    dependencies: ['lucide-react'],
    originalSource: 'custom',
    dateCollected: '2025-01-28'
  },
  dialog: {
    name: 'Dialog',
    path: '@/components/ui/sayu-dialog',
    status: 'collected',
    notes: 'Radix UI 기반 접근성을 갖춘 모달 다이얼로그 컴포넌트. 부드러운 애니메이션과 다양한 크기 지원. SAYU APT 테스트 결과, 전시회 예약, 설정 관리용 4가지 변형 구현. 포털을 통한 레이어 관리와 포커스 트랩 지원',
    dependencies: ['@radix-ui/react-dialog', 'lucide-react'],
    originalSource: 'custom',
    dateCollected: '2025-01-28'
  },
  emptyState: {
    name: 'EmptyState',
    path: '@/components/ui/empty-state',
    status: 'collected',
    notes: '데이터가 없을 때 표시하는 빈 상태 컴포넌트. 최대 3개 아이콘의 애니메이션 효과, 호버 시 아이콘 회전/이동, 액션 버튼 지원. SAYU APT 테스트 결과, 갤러리 컬렉션, 팔로우 목록, 전시 일정 관리용 4가지 변형 구현. 대시보드와 빈 페이지 상태 관리에 최적화',
    dependencies: ['lucide-react'],
    originalSource: 'custom',
    dateCollected: '2025-01-28'
  },
  linkPreview: {
    name: 'LinkPreview',
    path: '@/components/ui/link-preview',
    status: 'collected',
    notes: '링크 호버 시 실시간 웹사이트 스크린샷 미리보기를 제공하는 인터랙티브 컴포넌트. Radix UI HoverCard와 Framer Motion 기반 부드러운 애니메이션, 마우스 추적 효과, 정적/동적 이미지 지원. SAYU AI 아트 추천, 갤러리 투어, 커뮤니티 기능 소개용 3가지 변형 구현. 외부 링크 미리보기와 콘텐츠 소개 페이지에 최적화',
    dependencies: ['qss', 'framer-motion', '@radix-ui/react-hover-card', 'lucide-react'],
    originalSource: 'custom',
    dateCollected: '2025-01-28'
  },
};

// 컴포넌트 상태별 필터링
export const getComponentsByStatus = (status: ComponentStatus) => {
  return Object.entries(collectedComponents)
    .filter(([_, component]) => component.status === status)
    .reduce((acc, [key, component]) => ({ ...acc, [key]: component }), {});
};

// 모든 의존성 목록 추출
export const getAllDependencies = () => {
  const deps = new Set<string>();
  Object.values(collectedComponents).forEach(component => {
    component.dependencies?.forEach(dep => deps.add(dep));
  });
  return Array.from(deps);
};