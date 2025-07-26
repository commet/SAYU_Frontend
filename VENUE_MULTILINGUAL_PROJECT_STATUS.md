# SAYU Venue 다국어 지원 프로젝트 현황

## ✅ 완료된 작업 (2025년 1월)

### 1. 데이터베이스 통합 및 구조 개선
- [x] `venues` → `global_venues` 테이블 통합 완료
- [x] 한국 미술관 736개 + 해외 미술관 360개 = 총 1,081개 통합
- [x] 34개국 106개 도시 데이터 정리
- [x] 국가명/도시명 일관성 수정 (KR→South Korea, US→United States 등)

### 2. 다국어 필드 추가
- [x] `name_ko`, `name_en`, `city_ko`, `city_en`, `address_ko`, `address_en` 필드 추가
- [x] `city_translations` 테이블 생성 (100+ 도시 번역 데이터)
- [x] 주요 미술관 50개 수동 번역 + 패턴 기반 200개+ 자동 번역
- [x] 번역 현황: 미국 73.6%, 영국 65.9%, 네덜란드 65.0% 등

### 3. 백엔드 API 구현
- [x] `venueController.js` - 다국어 지원 API 컨트롤러
- [x] `venueRoutes.js` - API 라우트 정의
- [x] `globalVenueModel.js` - 통합된 venue 모델
- [x] `server.js`에 venue 라우트 추가
- [x] 언어별 필드 매핑 로직 구현

### 4. 프론트엔드 타입 및 API
- [x] `types/venue.ts` - TypeScript 타입 정의
- [x] `lib/api/venue.ts` - API 클라이언트 함수
- [x] `hooks/useLanguage.ts` - 언어 전환 훅
- [x] `components/venue/VenueList.tsx` - React 컴포넌트 예시

### 5. 마이그레이션 및 문서화
- [x] `VENUE_TABLE_MIGRATION_GUIDE.md` - 마이그레이션 가이드
- [x] `add-multilingual-fields.sql` - 다국어 마이그레이션 스크립트
- [x] CLAUDE.md 업데이트하여 global_venues 사용 명시

## 🚧 누락된 작업 및 개선 필요 사항

### 1. 번역 데이터 보완 (HIGH PRIORITY)
- [ ] **중국 미술관 한글명 번역** (현재 0%)
  - 베이징, 상하이 주요 미술관 번역 필요
  - 중국어 → 한글 음차 표기법 적용
- [ ] **한국 미술관 영문 설명** 추가
  - description_en 필드 대부분 비어있음
  - 주요 한국 미술관 영문 소개글 작성
- [ ] **주소 번역** 완성
  - address_ko, address_en 필드 활용도 낮음
  - 주요 해외 미술관 주소 한글 표기

### 2. API 기능 보완 (MEDIUM PRIORITY)
- [ ] **페이지네이션 개선**
  - 무한 스크롤 지원
  - 더 효율적인 쿼리 최적화
- [ ] **고급 필터링**
  - 가격 범위별 필터 (무료/유료)
  - 개관시간 기반 필터
  - 평점/리뷰 수 기반 정렬
- [ ] **즐겨찾기/북마크 기능**
  - 사용자별 관심 미술관 저장
  - 여행 계획 기능과 연동
- [ ] **거리 기반 검색**
  - 위치 정보 활용한 주변 미술관 찾기
  - Google Maps API 연동

### 3. 프론트엔드 컴포넌트 완성 (MEDIUM PRIORITY)
- [ ] **VenueDetail 페이지 구현**
  - 미술관 상세 정보 표시
  - 현재 전시 정보 연동
  - 리뷰/평점 시스템
- [ ] **VenueFilters 컴포넌트 완성**
  - 고급 필터 UI 구현
  - 검색 히스토리 기능
- [ ] **지도 컴포넌트 연동**
  - Google Maps 또는 Kakao Map
  - 미술관 위치 표시
- [ ] **언어 전환 UI**
  - 헤더에 언어 토글 버튼
  - 실시간 언어 전환 기능

### 4. 데이터 품질 개선 (LOW PRIORITY)
- [ ] **데이터 검증 및 정제**
  - 중복 데이터 제거
  - 폐관된 미술관 정보 업데이트
  - 연락처/웹사이트 정보 검증
- [ ] **이미지 데이터 추가**
  - 미술관 외관/내부 사진
  - Cloudinary 연동
- [ ] **소셜미디어 정보 보완**
  - Instagram, Facebook 계정 정보
  - social_media JSONB 필드 활용

### 5. 성능 최적화 (LOW PRIORITY)
- [ ] **쿼리 성능 개선**
  - 인덱스 최적화
  - 캐싱 전략 구현
- [ ] **이미지 최적화**
  - 이미지 lazy loading
  - WebP 포맷 지원

## 📋 다음 세션 우선순위 추천

### 🥇 1순위: 번역 데이터 보완
```bash
# 중국 미술관 한글명 추가
node add-chinese-museum-names.js

# 한국 미술관 영문 설명 추가  
node add-korean-museum-descriptions.js
```

### 🥈 2순위: 프론트엔드 컴포넌트 완성
- VenueDetail 페이지 구현
- 언어 전환 UI 완성
- 지도 컴포넌트 연동

### 🥉 3순위: API 기능 확장
- 즐겨찾기 기능
- 거리 기반 검색
- 고급 필터링

## 🗂️ 작업 파일 위치

### 백엔드
- 컨트롤러: `/backend/src/controllers/venueController.js`
- 모델: `/backend/src/models/globalVenueModel.js`
- 라우트: `/backend/src/routes/venueRoutes.js`
- 마이그레이션: `/backend/src/migrations/add-multilingual-fields.sql`

### 프론트엔드
- 타입: `/frontend/types/venue.ts`
- API: `/frontend/lib/api/venue.ts`
- 훅: `/frontend/hooks/useLanguage.ts`
- 컴포넌트: `/frontend/components/venue/VenueList.tsx`

### 테스트/도구
- DB 테스트: `/backend/test-multilingual-queries.js`
- API 테스트: `/backend/test-venue-api.js`
- 도시별 통계: `/backend/check-venues-by-city.js`

## 📊 현재 데이터 현황
- **총 미술관/갤러리**: 1,081개 (34개국 106개 도시)
- **한국**: 661개 (영문명 100%, 한글명 100%)
- **해외**: 420개 (영문명 100%, 한글명 평균 60%)
- **번역률 높은 국가**: 미국(73.6%), 영국(65.9%), 네덜란드(65.0%)
- **번역률 낮은 국가**: 중국(0%), 멕시코(0%), UAE(0%)

## 🎯 최종 목표
1. **완전한 다국어 지원**: 모든 주요 미술관 한글/영문명 100% 완성
2. **사용자 경험 향상**: 직관적인 언어 전환 및 검색 기능
3. **데이터 품질**: 정확하고 최신의 미술관 정보 제공
4. **글로벌 서비스**: 한국↔해외 사용자 모두에게 친화적인 인터페이스

---
*마지막 업데이트: 2025년 1월*
*작업자: Claude + Samsung*