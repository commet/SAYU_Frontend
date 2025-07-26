# ArtMap.com 크롤러 통합 가이드

## 빠른 시작

### 1. 설치 및 설정
```bash
cd backend
npm install  # 필요한 패키지가 이미 설치되어 있음
```

### 2. 테스트 실행
```bash
# 기능 테스트 (권장)
npm run artmap:test

# 전체 테스트 (서울 + 뉴욕)
npm run artmap:test:full
```

### 3. 배치 크롤링
```bash
# Tier 1 도시 크롤링 (서울, 뉴욕, 런던, 파리, 베를린, 도쿄)
npm run artmap:crawl:tier1

# Tier 2 도시 크롤링
npm run artmap:crawl:tier2

# 모든 도시 크롤링
npm run artmap:crawl:all
```

### 4. 정기 실행
```bash
# 크론 작업 시작
npm run artmap:cron

# 즉시 일일 크롤링 실행
npm run artmap:cron:now

# 수동 실행
npm run artmap:manual
```

## 사용 시나리오

### 시나리오 1: 초기 데이터 수집
```bash
# 1단계: 테스트로 시작
npm run artmap:test

# 2단계: Tier 1 도시 수집
npm run artmap:crawl:tier1

# 3단계: 확장
npm run artmap:crawl:tier2
```

### 시나리오 2: 정기 업데이트
```bash
# Railway 또는 서버에서 실행
npm run artmap:cron

# 로그 확인
tail -f src/services/artmap-crawler/logs/*.json
```

### 시나리오 3: 특정 도시 재크롤링
```bash
# 진행 상황 초기화 후 재실행
rm src/services/artmap-crawler/crawl-progress.json
npm run artmap:crawl:tier1
```

## 데이터베이스 통합

### 필요한 테이블
```sql
-- exhibitions 테이블 (기존)
-- venues 테이블 (기존)
-- 추가 필드 확인 필요:
-- - source_url (전시 원본 URL)
-- - artists (JSON 타입)
-- - city (도시명)
-- - country (국가명)
```

### 데이터 매핑
- ArtMap 전시 → SAYU exhibitions 테이블
- ArtMap venue → SAYU venues 테이블
- 중복 방지: title + venue_id + start_date 조합

## 모니터링

### 로그 위치
```
backend/src/services/artmap-crawler/logs/
├── seoul_2025-01-26T10-30-00.json
├── newyork_2025-01-26T10-35-00.json
└── batch_summary_2025-01-26T11-00-00.json
```

### 진행 상황 확인
```bash
# 진행 상황 파일 확인
cat src/services/artmap-crawler/crawl-progress.json
```

### 성능 지표
- 도시당 평균 크롤링 시간: 5-10분
- 일일 수집 가능 전시: 500-1000건
- 메모리 사용량: 200-500MB

## 문제 해결

### 1. 타임아웃 오류
```javascript
// artmapCrawler.js에서 timeout 값 조정
this.axiosConfig = {
  timeout: 20000  // 20초로 증가
};
```

### 2. 속도 제한
```javascript
// 요청 간격 증가
this.requestDelay = 3000;  // 3초로 증가
```

### 3. 파싱 오류
- HTML 구조가 변경되었을 가능성
- cheerio 선택자 업데이트 필요

## 주의 사항

1. **윤리적 크롤링**
   - robots.txt 준수
   - 과도한 요청 금지
   - User-Agent 명시

2. **데이터 품질**
   - 날짜 형식 검증
   - 중복 제거
   - 이미지 URL 유효성

3. **확장성**
   - 새 도시 추가 시 cities 객체 업데이트
   - venue 타입별 우선순위 조정

## 향후 개선 사항

1. **고급 기능**
   - 전시 상세 페이지 크롤링
   - 작가 프로필 수집
   - 리뷰/평점 수집

2. **성능 최적화**
   - 병렬 처리 도입
   - 캐싱 전략
   - 증분 업데이트

3. **통합 강화**
   - SAYU 추천 엔진 연동
   - 감정 분석 적용
   - 사용자 알림 시스템

## 연락처
문제 발생 시 SAYU 개발팀에 문의:
- GitHub Issues
- 내부 Slack 채널