# SAYU Exhibition Collection System Documentation

## Overview

SAYU의 전시 정보 수집 시스템은 국내외 미술관/갤러리의 전시 정보를 자동/수동으로 수집하고 관리하는 통합 플랫폼입니다.

## System Architecture

### 데이터 수집 방식

1. **자동 수집**
   - Naver Search API (국내)
   - Web Scraping (해외)
   - Instagram API (예정)
   
2. **수동 제보**
   - 웹 폼을 통한 사용자 제보
   - 카카오톡 채널 (예정)
   - 이메일 제보 (예정)

3. **API 제공**
   - RESTful API로 전시 정보 제공
   - 외부 파트너 연동 지원

## Database Schema

### Venues (장소)
- 국내 195개, 해외 60개 핵심 기관 등록
- Tier 시스템으로 수집 주기 관리
  - Tier 1: 매일 업데이트 (주요 미술관)
  - Tier 2: 주 2회 업데이트 (중요 갤러리)
  - Tier 3: 주 1회 업데이트 (소규모 공간)

### Exhibitions (전시)
- 전시 기본 정보 (제목, 날짜, 장소)
- 참여 작가 정보
- 이미지 및 링크
- 검증 상태 관리

### ExhibitionSubmissions (제보)
- 사용자 제보 정보
- 검증 프로세스
- 포인트 보상 시스템

## API Endpoints

### Public Endpoints

#### GET /api/exhibitions
전시 목록 조회

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `city` - 도시 필터
- `country` - 국가 코드 (default: KR)
- `status` - upcoming/ongoing/ended
- `startDate` - 시작일 필터
- `endDate` - 종료일 필터
- `venueId` - 특정 장소
- `search` - 검색어
- `featured` - 추천 전시 여부

**Response:**
```json
{
  "exhibitions": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### GET /api/exhibitions/:id
전시 상세 정보

#### GET /api/exhibitions/trending
인기 전시 (조회수/좋아요 기준)

#### GET /api/exhibitions/upcoming
다가오는 전시 (7일 이내)

#### POST /api/exhibitions/submit
전시 정보 제보

**Request Body:**
```json
{
  "exhibitionTitle": "전시명",
  "venueName": "장소명",
  "venueAddress": "주소 (선택)",
  "startDate": "2024-01-15",
  "endDate": "2024-03-15",
  "artists": "작가1, 작가2",
  "description": "전시 소개",
  "officialUrl": "https://...",
  "posterImageUrl": "https://...",
  "admissionFee": "15000원",
  "openingEvent": {
    "date": "2024-01-15",
    "time": "17:00"
  },
  "submitterEmail": "user@email.com",
  "submitterName": "홍길동",
  "submitterPhone": "010-0000-0000"
}
```

#### GET /api/venues
장소 목록 조회

**Query Parameters:**
- `city` - 도시
- `country` - 국가 코드
- `type` - museum/gallery/alternative_space/art_center
- `tier` - 1/2/3
- `search` - 검색어
- `limit` - 결과 개수 제한

### Authenticated Endpoints

#### GET /api/my/submissions
내 제보 목록 조회 (로그인 필요)

### Admin Endpoints

#### POST /api/admin/exhibitions/collect
전시 정보 수집 실행

#### PUT /api/admin/submissions/:id/review
제보 검토 및 승인/거절

## 포인트 시스템

- 제보 시: 즉시 100 포인트
- 승인 시: 추가 400 포인트
- 메인 노출: 추가 1000 포인트

## Cron Jobs

### 일일 작업 (매일 오전 3시)
- Tier 1 장소 전시 정보 수집
- 오래된 전시 정보 정리

### 주 2회 작업 (화, 금 오전 3시 30분)
- Tier 2 장소 전시 정보 수집

### 주간 작업 (일요일 오전 4시)
- Tier 3 장소 전시 정보 수집

## 환경 변수 설정

```env
# Naver API
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret

# Feature Flags
ENABLE_INTERNATIONAL_COLLECTION=false
```

## 설치 및 실행

### 1. 데이터베이스 마이그레이션
```bash
cd backend
npx sequelize-cli db:migrate
```

### 2. 초기 데이터 입력
```bash
node seeders/venueSeeder.js
```

### 3. 크론 작업 시작
```javascript
// server.js에 추가
const exhibitionCollectorCron = require('./cron/exhibitionCollectorCron');
exhibitionCollectorCron.start();
```

## 프론트엔드 통합

### 전시 제보 폼
```tsx
import ExhibitionSubmissionForm from '@/components/exhibition/ExhibitionSubmissionForm';

<ExhibitionSubmissionForm />
```

## 향후 개발 계획

1. **Phase 1 (완료)**
   - 기본 데이터 모델 설계
   - Naver API 연동
   - 사용자 제보 시스템

2. **Phase 2 (진행 중)**
   - 해외 전시 웹 스크래핑
   - Instagram API 연동
   - 카카오톡 채널 연동

3. **Phase 3 (계획)**
   - AI 기반 전시 추천
   - 전시 리뷰 시스템
   - API 유료화

## API 사용 예시

### 서울 현재 진행 중인 전시 조회
```javascript
const response = await fetch('/api/exhibitions?city=서울&status=ongoing');
const data = await response.json();
```

### 전시 정보 제보
```javascript
const submission = {
  exhibitionTitle: "데이비드 호크니: 봄의 도착",
  venueName: "서울시립미술관",
  startDate: "2024-03-01",
  endDate: "2024-05-31",
  submitterEmail: "user@example.com"
};

const response = await fetch('/api/exhibitions/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(submission)
});
```

## 문제 해결

### Naver API 할당량 초과
- 일일 25,000회 제한
- 수집 주기 조정 필요

### 중복 전시 정보
- MD5 체크섬으로 중복 검사
- 제목 + 장소 + 시작일 조합

### 검증 프로세스
- 자동 검증: 이미지 OCR, 링크 확인
- 수동 검증: 관리자 검토

## 연락처

기술 문의: tech@sayu.art
제휴 문의: partnership@sayu.art