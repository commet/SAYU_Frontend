# SAYU Exhibition Collection System - Implementation Summary

## 🎯 완성된 기능

### 1. 데이터베이스 스키마 (PostgreSQL)
- **Venues** - 미술관/갤러리 정보 (195개 국내 + 60개 해외)
- **Exhibitions** - 전시 정보
- **Exhibition Submissions** - 사용자 제보

파일 위치:
- `/backend/src/database/exhibitionSchema.sql` - SQL 스키마
- `/backend/setup-exhibition-db.js` - DB 설정 스크립트

### 2. 백엔드 API
#### Models (PostgreSQL 기반)
- `/backend/src/models/exhibitionModel.js`
- `/backend/src/models/venueModel.js`
- `/backend/src/models/exhibitionSubmissionModel.js`

#### Controllers & Routes
- `/backend/src/controllers/exhibitionController.js`
- `/backend/routes/exhibitionRoutes.js`

#### 주요 엔드포인트:
- `GET /api/exhibitions` - 전시 목록
- `GET /api/exhibitions/:id` - 전시 상세
- `POST /api/exhibitions/submit` - 전시 제보
- `GET /api/venues` - 장소 목록
- `GET /api/exhibitions/trending` - 인기 전시
- `GET /api/exhibitions/upcoming` - 예정 전시

### 3. 자동 수집 시스템
#### Naver API 연동
- `/backend/services/exhibitionCollectorService.js` - Sequelize 버전 (변환 필요)
- 블로그/뉴스 검색으로 전시 정보 파싱
- 중복 제거 및 자동 저장

#### Cron Jobs
- `/backend/cron/exhibitionCollectorCron.js`
- Tier별 수집 주기 관리
- 자동 상태 업데이트

### 4. 프론트엔드 컴포넌트
- `/frontend/components/exhibition/ExhibitionSubmissionForm.tsx`
- React Hook Form + Zod 검증
- 달력 UI, 다단계 폼

### 5. 포인트 시스템
- 제보 시: 100 포인트
- 승인 시: 추가 400 포인트
- 메인 노출 시: 추가 1000 포인트

## 🚀 설치 및 실행 방법

### 1. 환경 변수 설정
```env
# .env 파일에 추가
NAVER_CLIENT_ID=your-client-id
NAVER_CLIENT_SECRET=your-client-secret
```

### 2. 데이터베이스 설정
```bash
# Exhibition 테이블 생성
cd backend
node setup-exhibition-db.js

# Venue 초기 데이터 입력
node seeders/venueSeeder.js
```

### 3. 서버 시작
백엔드 서버에 이미 라우트가 추가되어 있음:
- `/backend/src/server.js` - 라우트 등록 완료

## 📋 API 사용 예시

### 전시 목록 조회
```javascript
// 서울 현재 진행 중인 전시
GET /api/exhibitions?city=서울&status=ongoing

// 다음 7일 내 시작하는 전시
GET /api/exhibitions/upcoming?days=7
```

### 전시 제보
```javascript
POST /api/exhibitions/submit
{
  "exhibitionTitle": "피카소 특별전",
  "venueName": "서울시립미술관",
  "startDate": "2024-03-01",
  "endDate": "2024-06-30",
  "submitterEmail": "user@example.com"
}
```

## 🔧 추가 구현 필요 사항

### 1. exhibitionCollectorService.js PostgreSQL 변환
현재 Sequelize 기반으로 작성되어 있어 PostgreSQL 쿼리로 변환 필요

### 2. 해외 전시 수집 (Puppeteer/Playwright)
- 웹 스크래핑 구현
- 주요 아트 미디어 사이트 크롤링

### 3. 프론트엔드 추가 페이지
- 전시 목록 페이지
- 전시 상세 페이지
- 내 제보 관리 페이지

### 4. 관리자 대시보드
- 제보 검토 인터페이스
- 수집 통계 대시보드

## 💡 핵심 특징

1. **하이브리드 수집**: 자동(API) + 수동(사용자 제보)
2. **검증 시스템**: 중복 체크, 스팸 점수, 관리자 검토
3. **확장 가능**: 새로운 수집 소스 쉽게 추가
4. **성능 최적화**: 인덱스, 캐싱 준비
5. **국제화 준비**: 다국어 필드, 해외 장소 지원

## 📊 데이터 현황

- **Venues**: 255개 (국내 195, 해외 60)
- **Tier 1**: 매일 업데이트 (주요 미술관)
- **Tier 2**: 주 2회 업데이트 (중요 갤러리)
- **Tier 3**: 주 1회 업데이트 (소규모 공간)

## 🎯 다음 단계

1. `exhibitionCollectorService.js`를 PostgreSQL로 변환
2. 크론 작업 활성화
3. 프론트엔드 전시 목록/상세 페이지 구현
4. 관리자 인터페이스 구축
5. 해외 전시 수집 자동화

---

이제 SAYU는 국내외 전시 정보를 체계적으로 수집하고 관리할 수 있는 플랫폼이 되었습니다! 🎨