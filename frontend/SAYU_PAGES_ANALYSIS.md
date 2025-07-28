# SAYU 프론트엔드 페이지 및 기능 분석

## 현재 구현된 페이지들 (기존)
- ✅ `/app/artists/page.tsx` - 아티스트 목록 페이지
- ✅ `/app/emotion-translator/page.tsx` - 감정 번역기 페이지

## SAYU 핵심 기능별 페이지 구조 설계

### 🏠 1. 메인 홈페이지 (`/`)
**목적**: 첫 방문자를 위한 SAYU 소개 및 주요 기능 탐색
**필요한 UI 컴포넌트**:
- `hero-with-video` - 메인 히어로 섹션 (SAYU 브랜드 소개)
- `animated-testimonials` - 사용자 후기 슬라이더
- `feature-section` - 주요 기능 스텝별 소개
- `bento-grid` - 기능별 카드 그리드
- `link-preview` - 외부 갤러리/미술관 링크 미리보기
- `sparkles` - 마법적인 예술 경험 연출

### 🧠 2. APT 테스트 페이지들
#### 2-1. APT 테스트 시작 (`/apt-test`)
- `lamp` - 테스트 시작 전 몰입감 있는 배경
- `text-reveal` - 테스트 설명 단계별 등장
- `rainbow-button` - 테스트 시작 버튼 (중요한 액션)

#### 2-2. APT 테스트 진행 (`/apt-test/quiz`)
- `animated-grid-pattern` - 동적 배경 패턴
- `display-cards` - 질문 카드 3D 스택 효과
- `badge-new` - 진행 상황 표시

#### 2-3. APT 결과 페이지 (`/apt-test/result`)
- `aurora-background` - 결과 발표 배경
- `award` - 성격 유형 인증서/배지
- `dialog` - 상세 결과 모달
- `perspective-carousel` - 추천 작품 3D 캐러셀
- `animated-tooltip` - 성격 특성 설명

### 🎨 3. AI 아트 프로필 페이지들
#### 3-1. 프로필 생성 (`/art-profile/create`)
- `canvas` - 인터랙티브 창작 캔버스
- `glowing-effect` - 마우스 호버 글로우 효과
- `v0-ai-chat` - AI 큐레이터와 대화
- `theme-toggle` - 창작 환경 테마 변경

#### 3-2. 프로필 갤러리 (`/art-profile/gallery`)
- `gallery4` - 메인 작품 캐러셀
- `3d-carousel` - 3D 원통형 포트폴리오
- `empty-state` - 작품이 없을 때
- `shuffle-grid` - 자동 섞이는 이미지 그리드

### 🏛️ 4. 갤러리 & 전시 페이지들
#### 4-1. 갤러리 메인 (`/gallery`)
- `container-scroll-animation` - 스크롤 기반 갤러리 소개
- `interactive-bento-gallery` - 드래그 가능한 작품 그리드
- `mac-os-dock` - 갤러리 카테고리 네비게이션

#### 4-2. 작품 상세 (`/gallery/[artworkId]`)
- `compare` - 작품 비교 슬라이더
- `image-comparison` - Before/After 비교
- `animated-ai-chat` - AI 작품 해설
- `link-preview` - 작가/갤러리 정보 미리보기

#### 4-3. 전시 일정 (`/exhibitions`)
- `fullscreen-calendar` - 전시 달력 전체 화면
- `calendar-with-event-slots` - 이벤트 예약 슬롯
- `radial-orbital-timeline` - 전시 연표 3D 시각화

### 👥 5. 커뮤니티 페이지들
#### 5-1. 커뮤니티 메인 (`/community`)
- `testimonials-columns-1` - 커뮤니티 후기 스크롤
- `customers-section` - 활성 멤버 애니메이션
- `fluid-menu` - 커뮤니티 기능 원형 메뉴

#### 5-2. 퍼셉션 익스체인지 (`/community/perception-exchange`)
- `retro-testimonial` - 감상 교환 빈티지 UI
- `etheral-shadow` - 감정 표현 시각 효과
- `text-effect` - 감상 텍스트 애니메이션

#### 5-3. 전시 동행 (`/community/exhibition-companion`)
- `about-us-section` - 동행 서비스 소개
- `feature-with-image-comparison` - 혼자 vs 함께 비교
- `animated-dock` - 동행 매칭 도구

### 🤝 6. 팔로우 & 소셜 페이지들
#### 6-1. 팔로우 관리 (`/follow`)
- `empty-state` - 팔로우 목록이 없을 때
- `animated-tooltip` - 사용자 프로필 미리보기
- `dock-two` - 소셜 액션 플로팅 독

#### 6-2. 아티스트 프로필 (`/artists/[artistId]`)
- `scroll-expansion-hero` - 아티스트 소개 스크롤 확장
- `section-with-mockup` - 작품 목업 프레젠테이션
- `gooey-text-morphing` - 아티스트명 역동적 표현

### ⚙️ 7. 설정 & 개인화 페이지들
#### 7-1. 개인 설정 (`/settings`)
- `dialog` - 각종 설정 모달
- `theme-toggle` - 테마 변경
- `badge-new` - 멤버십 등급 표시

#### 7-2. 대시보드 (`/dashboard`)
- `beams-background` - 동적 배경 빔
- `display-cards` - 개인 통계 카드들
- `rainbow-button-v2` - 프리미엄 기능 액션

### 🔍 8. 검색 & 탐색 페이지들
#### 8-1. 통합 검색 (`/search`)
- `empty-state` - 검색 결과 없음
- `retro-grid` - 검색 결과 그리드
- `background-beams` - 검색 중 로딩 애니메이션

### 💬 9. AI 큐레이터 페이지들
#### 9-1. AI 채팅 (`/ai-curator`)
- `animated-ai-chat` - 메인 채팅 인터페이스
- `v0-ai-chat` - 간단한 질문 모드
- `sparkles` - AI 응답 파티클 효과

### 📱 10. 감정 & 무드 페이지들
#### 10-1. 감정 번역기 (`/emotion-translator`) ✅ 기존
- `aurora-background` - 감정 표현 배경
- `text-effect` - 감정 변화 텍스트
- `glowing-effect` - 감정 카드 글로우

## 페이지별 우선순위

### 🔥 Phase 1 (핵심 MVP) - 즉시 구현
1. **메인 홈페이지** (`/`) - 첫 인상 결정
2. **APT 테스트 시작** (`/apt-test`) - 핵심 기능
3. **APT 결과 페이지** (`/apt-test/result`) - 핵심 기능
4. **갤러리 메인** (`/gallery`) - 주요 콘텐츠

### ⚡ Phase 2 (핵심 기능 완성) - 1-2주 내
5. **AI 아트 프로필 생성** (`/art-profile/create`)
6. **커뮤니티 메인** (`/community`)
7. **아티스트 목록** (`/artists`) ✅ 기존 개선
8. **개인 설정** (`/settings`)

### 🚀 Phase 3 (고급 기능) - 1개월 내
9. **AI 큐레이터** (`/ai-curator`)
10. **전시 일정** (`/exhibitions`)
11. **퍼셉션 익스체인지** (`/community/perception-exchange`)
12. **개인 대시보드** (`/dashboard`)

## 다음 단계 계획
1. ✅ **페이지 구조 분석 완료**
2. 🔄 **Phase 1 페이지별 컴포넌트 매칭 상세 분석**
3. 🔄 **실제 페이지 구현 시작 (메인 홈페이지부터)**
4. 🔄 **컴포넌트 커스터마이징 및 SAYU 브랜딩 적용**