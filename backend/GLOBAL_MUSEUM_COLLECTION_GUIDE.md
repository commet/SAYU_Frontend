# SAYU 글로벌 미술관 자동 수집 시스템

## 개요

SAYU의 글로벌 미술관 자동 수집 시스템은 전 세계 주요 도시의 미술관과 갤러리 정보를 자동으로 수집하고 관리하는 포괄적인 솔루션입니다. 기존의 수동 작업(50개씩 캡처)을 완전히 자동화하여 효율성을 극대화했습니다.

## 🌟 주요 기능

### 1. 다중 소스 자동 수집
- **웹 스크래핑**: Tokyo Art Beat, ParisArt, NYC-ARTS 등 주요 아트 플랫폼
- **Google Places API**: 도시별 미술관/갤러리 체계적 검색
- **Foursquare API**: 보완 데이터 및 상세 정보 수집

### 2. 전 세계 24개 주요 도시 커버
- **아시아**: Tokyo, Seoul, Hong Kong, Singapore, Shanghai, Beijing
- **유럽**: Paris, London, Berlin, Rome, Amsterdam, Vienna, Barcelona, Madrid  
- **북미**: New York, Los Angeles, San Francisco, Chicago, Toronto, Montreal
- **오세아니아**: Sydney, Melbourne
- **남미**: São Paulo, Buenos Aires

### 3. 스마트 데이터 관리
- 자동 중복 제거 및 데이터 병합
- 실시간 품질 검증 및 지오코딩
- 감정 시그니처 및 성격 매칭 연동

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 1. 환경 변수 설정
cp .env.example .env

# 2. 필수 API 키 설정 (.env 파일)
GOOGLE_PLACES_API_KEY=your-google-places-api-key
FOURSQUARE_API_KEY=your-foursquare-api-key
```

### 2. 데이터베이스 준비

```bash
# 스키마 설정
npm run global:setup

# 또는 수동으로
psql $DATABASE_URL < src/migrations/create-global-venues-schema.sql
```

### 3. 시스템 테스트

```bash
# 전체 시스템 테스트
npm run global:test

# 개별 테스트
npm run global:test -- --web    # 웹 스크래핑 테스트
npm run global:test -- --api    # API 테스트
```

### 4. 수집 실행

```bash
# 테스트 수집 (도쿄, 파리만)
npm run global:collect:test

# 전체 수집
npm run global:collect

# 웹 스크래핑만
npm run global:collect:web

# API 수집만  
npm run global:collect:api

# 특정 도시만
node collect-global-museums.js --cities Tokyo,Paris,London
```

## 📋 API 키 취득 가이드

### Google Places API
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. "Places API" 활성화
4. 사용자 인증 정보에서 API 키 생성
5. API 키 제한 설정 (IP, API별)

**월 무료 할당량**: $200 크레딧 (약 28,000회 요청)

### Foursquare API
1. [Foursquare Developer](https://developer.foursquare.com/) 가입
2. 앱 생성
3. API 키 복사

**무료 플랜**: 월 1,000회 요청

## 🕐 자동화 스케줄

시스템은 다음 일정으로 자동 실행됩니다:

```javascript
// 매일 오전 2시 - 웹 스크래핑 (빠른 업데이트)
'0 2 * * *'

// 매주 일요일 오전 3시 - API 수집 (포괄적 업데이트)  
'0 3 * * 0'

// 매월 1일 오전 4시 - 전체 재수집 (데이터 정리)
'0 4 1 * *'

// 매일 오후 6시 - 순환 수집 (요일별 특정 도시)
'0 18 * * *'
```

### 수동 트리거

```bash
# 즉시 수집 실행
kill -USR1 <process_id>

# 유지보수 작업 실행
kill -USR2 <process_id>
```

## 📊 데이터 구조

### venues 테이블 주요 필드

```sql
-- 기본 정보
name VARCHAR(255)           -- 기관명
name_en VARCHAR(255)        -- 영문명  
type VARCHAR(50)            -- museum, gallery, art_center
address TEXT                -- 주소
city VARCHAR(100)           -- 도시
country VARCHAR(100)        -- 국가

-- 위치
latitude DECIMAL(10, 8)     -- 위도
longitude DECIMAL(11, 8)    -- 경도

-- 연락처
website VARCHAR(255)        -- 웹사이트
phone VARCHAR(50)           -- 전화번호

-- 외부 ID
external_ids JSONB          -- Google Place ID, Foursquare ID 등

-- 평가
rating DECIMAL(3, 2)        -- 평점
user_ratings_total INTEGER  -- 평가 수

-- SAYU 특화
emotion_signature DECIMAL[] -- 감정 벡터
personality_affinity JSONB  -- 성격 친화도

-- 메타데이터
sources TEXT[]              -- 데이터 소스
created_at TIMESTAMP        -- 생성일
updated_at TIMESTAMP        -- 수정일
```

## 🔧 고급 기능

### 1. 데이터 품질 관리

```bash
# 품질 점수 확인
SELECT v.name, vqs.overall_score, vqs.completeness_score 
FROM venues v 
LEFT JOIN venue_quality_scores vqs ON v.id = vqs.venue_id
ORDER BY vqs.overall_score DESC;

# 누락 정보 확인
SELECT name, 
  CASE WHEN latitude IS NULL THEN 'coords' END as missing_coords,
  CASE WHEN website IS NULL THEN 'website' END as missing_website
FROM venues 
WHERE latitude IS NULL OR website IS NULL;
```

### 2. 통계 및 분석

```bash
# 도시별 통계
SELECT * FROM city_venue_stats;

# 최근 수집 현황
SELECT * FROM recently_collected_venues LIMIT 10;

# 고품질 기관 목록
SELECT * FROM high_quality_venues LIMIT 20;
```

### 3. 수집 로그 분석

```sql
-- 수집 성공률 분석
SELECT 
  collection_type,
  COUNT(*) as total_runs,
  AVG(venues_created) as avg_created,
  AVG(venues_failed) as avg_failed,
  AVG(duration_seconds) as avg_duration
FROM global_collection_logs 
WHERE start_time > CURRENT_DATE - INTERVAL '30 days'
GROUP BY collection_type;
```

## 🚨 문제 해결

### 일반적인 오류

#### 1. API 키 관련
```bash
# 오류: Invalid API key
# 해결: .env 파일의 API 키 확인

# Google Places API 키 테스트
curl "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=museum&inputtype=textquery&key=YOUR_API_KEY"
```

#### 2. 데이터베이스 연결
```bash
# 오류: Connection refused
# 해결: DATABASE_URL 확인
echo $DATABASE_URL

# 연결 테스트
psql $DATABASE_URL -c "SELECT NOW();"
```

#### 3. 웹 스크래핑 실패
```bash
# 오류: Request timeout
# 해결: 네트워크 상태 확인, User-Agent 헤더 검증
```

### 성능 최적화

#### 1. 배치 크기 조정
```bash
# .env 파일
GLOBAL_COLLECTION_BATCH_SIZE=25  # 기본: 50
GLOBAL_COLLECTION_DELAY_MS=2000  # 기본: 1000
```

#### 2. 메모리 사용량 모니터링
```bash
# Node.js 메모리 옵션
node --max-old-space-size=4096 collect-global-museums.js
```

#### 3. 인덱스 최적화
```sql
-- 자주 사용되는 쿼리용 인덱스 추가
CREATE INDEX idx_venues_city_type ON venues (city, type);
CREATE INDEX idx_venues_rating_desc ON venues (rating DESC NULLS LAST);
```

## 📈 확장 계획

### 1. 추가 예정 소스
- **Artsy API**: 갤러리 및 아트페어 정보
- **Europeana**: 유럽 문화 기관 데이터
- **각국 문화부 API**: 정부 공식 데이터

### 2. 고도화 기능
- **AI 기반 기관 분류**: 자동 태깅 및 카테고리화
- **실시간 전시 정보 연동**: 전시 일정 자동 업데이트
- **사용자 리뷰 통합**: 방문객 평가 시스템

### 3. 성능 개선
- **분산 처리**: 도시별 병렬 수집
- **캐싱 시스템**: Redis 기반 중간 데이터 저장
- **점진적 업데이트**: 변경사항만 감지하여 업데이트

## 🤝 기여 방법

### 새로운 소스 추가
1. `globalMuseumCollectorService.js`의 `sources` 객체에 추가
2. 해당 소스별 파싱 로직 구현
3. 테스트 케이스 작성

### 도시 추가
1. `targetCities` 배열에 도시 정보 추가
2. 좌표와 우선순위 설정
3. 해당 지역 특화 로직 구현 (필요시)

## 📞 지원

문제가 발생하거나 개선 제안이 있다면:

1. **로그 확인**: `logs/` 디렉토리의 최신 로그 파일
2. **테스트 실행**: `npm run global:test`로 시스템 상태 확인
3. **이슈 등록**: GitHub Issues에 상세한 오류 정보와 함께 등록

---

**SAYU 글로벌 미술관 수집 시스템**으로 전 세계 예술 기관들을 효율적으로 관리하고, 사용자들에게 더 풍부한 예술 경험을 제공하세요! 🎨✨