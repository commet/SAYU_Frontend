# SAYU 프로젝트 리팩토링 아키텍처 계획

*생성일: 2025년 7월 28일*

## 🎯 현재 상황 요약

### 📊 코드베이스 현황
- **총 파일 수**: 1,303개 (TS: 681개, JS: 622개)
- **총 코드 라인**: 324,012줄
- **평균 파일 크기**: 249줄
- **대용량 파일**: 20개 (500줄 이상)
- **순환 의존성**: 0개 ✅ (매우 좋음!)

### ⚠️ 주요 문제점
1. **과도한 파일 분산**: 1,300개가 넘는 파일이 체계 없이 분산
2. **거대한 파일들**: 일부 파일이 1,000줄 이상 (최대 1,598줄)
3. **복잡한 서버 파일**: `backend/src/server.js`가 73개 의존성
4. **미사용 파일**: 10개의 고립된 모듈
5. **JS/TS 혼재**: JavaScript 파일 비율 48%

## 🏗️ 새로운 아키텍처 설계

### 1. 전체 폴더 구조 (Feature-First)

```
sayu/
├── 📁 packages/                    # 모노레포 패키지
│   ├── 📁 shared/                  # 공통 라이브러리
│   │   ├── 📁 types/               # 공통 타입 정의
│   │   ├── 📁 utils/               # 유틸리티 함수
│   │   ├── 📁 constants/           # 상수 정의
│   │   └── 📁 validation/          # 공통 검증 로직
│   │
│   ├── 📁 api-client/              # API 클라이언트 라이브러리
│   │   ├── 📁 core/                # 기본 HTTP 클라이언트
│   │   ├── 📁 auth/                # 인증 관련 API
│   │   ├── 📁 art/                 # 아트 관련 API
│   │   └── 📁 user/                # 사용자 관련 API
│   │
│   └── 📁 design-system/           # 디자인 시스템
│       ├── 📁 components/          # 기본 컴포넌트
│       ├── 📁 themes/              # 16가지 동물 테마
│       └── 📁 animations/          # 애니메이션 시스템
│
├── 📁 apps/                        # 애플리케이션
│   ├── 📁 frontend/                # 프론트엔드 앱
│   │   ├── 📁 src/
│   │   │   ├── 📁 features/        # 기능별 모듈
│   │   │   │   ├── 📁 apt/         # 성격 테스트
│   │   │   │   │   ├── 📁 components/
│   │   │   │   │   ├── 📁 hooks/
│   │   │   │   │   ├── 📁 services/
│   │   │   │   │   ├── 📁 types/
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── 📁 gallery/     # 갤러리 기능
│   │   │   │   │   ├── 📁 components/
│   │   │   │   │   │   ├── GalleryGrid.tsx
│   │   │   │   │   │   ├── ArtworkCard.tsx
│   │   │   │   │   │   └── FilterPanel.tsx
│   │   │   │   │   ├── 📁 hooks/
│   │   │   │   │   │   ├── useGalleryData.ts
│   │   │   │   │   │   └── useArtworkFilters.ts
│   │   │   │   │   ├── 📁 services/
│   │   │   │   │   │   └── galleryAPI.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── 📁 community/   # 커뮤니티 기능
│   │   │   │   ├── 📁 matching/    # 매칭 시스템
│   │   │   │   ├── 📁 chat/        # 채팅 기능
│   │   │   │   └── 📁 profile/     # 프로필 관리
│   │   │   │
│   │   │   ├── 📁 shared/          # 앱 내 공통 요소
│   │   │   │   ├── 📁 components/  # 공통 컴포넌트
│   │   │   │   ├── 📁 hooks/       # 공통 훅
│   │   │   │   └── 📁 layouts/     # 레이아웃
│   │   │   │
│   │   │   └── 📁 app/             # Next.js App Router
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       ├── gallery/
│   │   │       └── profile/
│   │   │
│   │   ├── 📄 package.json
│   │   └── 📄 next.config.js
│   │
│   └── 📁 backend/                 # 백엔드 API
│       ├── 📁 src/
│       │   ├── 📁 features/        # 기능별 모듈
│       │   │   ├── 📁 auth/        # 인증 시스템
│       │   │   │   ├── 📁 controllers/
│       │   │   │   ├── 📁 services/
│       │   │   │   ├── 📁 middleware/
│       │   │   │   ├── 📁 models/
│       │   │   │   └── 📁 routes/
│       │   │   │
│       │   │   ├── 📁 apt/         # APT 시스템
│       │   │   ├── 📁 gallery/     # 갤러리 API
│       │   │   ├── 📁 matching/    # 매칭 알고리즘
│       │   │   └── 📁 community/   # 커뮤니티 API
│       │   │
│       │   ├── 📁 shared/          # 공통 백엔드 로직
│       │   │   ├── 📁 database/    # DB 연결 및 모델
│       │   │   ├── 📁 middleware/  # 공통 미들웨어
│       │   │   ├── 📁 services/    # 공통 서비스
│       │   │   └── 📁 utils/       # 유틸리티
│       │   │
│       │   └── 📄 server.ts        # 메인 서버 진입점
│       │
│       ├── 📄 package.json
│       └── 📄 Dockerfile
│
├── 📁 tools/                       # 개발 도구
│   ├── 📁 scripts/                 # 빌드/배포 스크립트
│   ├── 📁 analysis/                # 코드 분석 도구
│   └── 📁 testing/                 # 테스트 유틸리티
│
├── 📁 docs/                        # 문서화
│   ├── 📁 architecture/            # 아키텍처 문서
│   ├── 📁 api/                     # API 문서
│   └── 📁 deployment/              # 배포 가이드
│
└── 📄 package.json                 # 루트 workspace 설정
```

### 2. 기능별 모듈 구조 (예: APT 기능)

```typescript
// apps/frontend/src/features/apt/index.ts
export { APTTestFlow } from './components/APTTestFlow';
export { APTResults } from './components/APTResults';
export { useAPTTest } from './hooks/useAPTTest';
export { aptAPI } from './services/aptAPI';
export type { APTResult, AnimalType, QuestionSet } from './types';

// 내부 구현은 export하지 않음 (캡슐화)
```

### 3. 대용량 파일 분할 계획

#### A. `frontend/data/personality-descriptions.ts` (1,598줄)
```
분할 후:
├── personality-base.ts        # 기본 타입 정의
├── animal-descriptions/       # 동물별 설명
│   ├── tiger.ts              # 호랑이 관련
│   ├── bear.ts               # 곰 관련
│   └── ...                   # 나머지 14개
├── personality-traits.ts      # 성격 특성
└── index.ts                  # 통합 export
```

#### B. `backend/src/services/gamificationService.js` (1,371줄)
```
분할 후:
├── core/
│   ├── pointsCalculator.ts    # 포인트 계산
│   ├── levelManager.ts        # 레벨 관리
│   └── achievementEngine.ts   # 성취 시스템
├── features/
│   ├── dailyChallenge.ts      # 일일 도전
│   ├── streakTracker.ts       # 연속 기록
│   └── rewards.ts             # 보상 시스템
└── index.ts                   # 통합 서비스
```

## 🚀 마이그레이션 전략

### Phase 1: 기반 구조 설정 (1주)
1. **모노레포 설정**
   ```bash
   # 루트 package.json workspace 설정
   npm init -w packages/shared
   npm init -w packages/api-client
   npm init -w packages/design-system
   ```

2. **공통 라이브러리 추출**
   - `packages/shared` 패키지 생성
   - 타입 정의, 유틸리티, 상수 이동
   - 각 앱에서 import 경로 업데이트

### Phase 2: 기능별 모듈화 (2-3주)
1. **우선순위 기능부터 시작**
   - ✅ Auth (가장 독립적)
   - ✅ APT (핵심 기능)
   - ✅ Gallery (비교적 단순)
   - ⚠️ Community (복잡한 의존성)

2. **단계별 이동**
   ```bash
   # 예: APT 기능 이동
   mkdir -p apps/frontend/src/features/apt/{components,hooks,services,types}
   git mv frontend/components/quiz/* apps/frontend/src/features/apt/components/
   git mv frontend/hooks/useAPT.ts apps/frontend/src/features/apt/hooks/
   ```

### Phase 3: 대용량 파일 분할 (1-2주)
1. **자동화 스크립트 사용**
   ```typescript
   // tools/scripts/split-large-files.ts
   // AST 파싱으로 함수/클래스별 자동 분할
   ```

2. **수동 리팩토링**
   - 비즈니스 로직별 분리
   - 관심사 분리 원칙 적용

### Phase 4: TypeScript 마이그레이션 (2-3주)
1. **점진적 마이그레이션**
   ```bash
   # JavaScript 파일을 하나씩 TypeScript로 변환
   mv file.js file.ts
   # 타입 추가 및 에러 수정
   ```

2. **타입 안정성 강화**
   - strict 모드 활성화
   - any 타입 제거
   - 인터페이스 정의 완료

## 📋 마이그레이션 체크리스트

### 🔧 기술적 준비사항
- [ ] 모노레포 workspace 설정
- [ ] TypeScript 설정 통합
- [ ] ESLint/Prettier 설정 통합
- [ ] Jest 테스트 환경 설정
- [ ] CI/CD 파이프라인 업데이트

### 📦 패키지별 마이그레이션
- [ ] `packages/shared` 생성 및 공통 코드 이동
- [ ] `packages/api-client` 생성 및 API 로직 통합
- [ ] `packages/design-system` 생성 및 컴포넌트 정리

### 🎯 기능별 마이그레이션
- [ ] Auth 기능 모듈화
- [ ] APT 기능 모듈화
- [ ] Gallery 기능 모듈화
- [ ] Community 기능 모듈화
- [ ] Matching 기능 모듈화

### 🧹 코드 정리
- [ ] 대용량 파일 분할 (20개 파일)
- [ ] 미사용 파일 제거 (10개 파일)
- [ ] JavaScript → TypeScript 변환
- [ ] import 경로 정리
- [ ] 테스트 코드 업데이트

## 🎯 예상 효과

### 📈 개선 지표
1. **파일 수 감소**: 1,303개 → ~800개 (40% 감소)
2. **평균 파일 크기**: 249줄 → ~150줄 (40% 감소)
3. **최대 파일 크기**: 1,598줄 → ~500줄 (70% 감소)
4. **TypeScript 비율**: 52% → 95% (43%p 증가)

### 🚀 개발 경험 개선
- **모듈 발견성**: 기능별 폴더로 쉬운 탐색
- **재사용성**: 공통 패키지로 중복 코드 제거
- **타입 안정성**: TypeScript로 런타임 에러 감소
- **테스트 용이성**: 작은 모듈로 쉬운 단위 테스트

### 📊 유지보수성 향상
- **변경 범위 최소화**: 기능별 독립성
- **신규 개발자 온보딩**: 명확한 구조
- **버그 추적 용이성**: 모듈 경계 명확
- **성능 최적화**: 트리 쉐이킹 효과

## ⚠️ 위험 요소 및 대응

### 🚨 주요 위험
1. **마이그레이션 중 서비스 중단**
   - 대응: 기능별 점진적 마이그레이션
   - 백업: feature flag로 롤백 가능

2. **import 경로 대량 변경**
   - 대응: 자동화 스크립트 사용
   - 검증: 컴파일 에러로 누락 방지

3. **테스트 케이스 누락**  
   - 대응: 마이그레이션 전 테스트 작성
   - 모니터링: 커버리지 측정

### 🛡️ 안전장치
```bash
# 각 단계별 백업 브랜치 생성
git checkout -b refactor-phase-1-backup
git checkout -b refactor-phase-2-backup

# 자동화된 검증 스크립트
npm run validate-migration
npm run test-all-features
```

---

**이 계획은 SAYU 프로젝트의 지속 가능한 성장을 위한 기반을 마련합니다. 단계별로 신중하게 진행하여 서비스 안정성을 보장하면서 개발 효율성을 크게 향상시킬 수 있습니다.**