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