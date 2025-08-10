# 한국 미술관/갤러리 크롤링 적합성 분석 보고서

## 🎯 분석 개요
한국 주요 미술관과 갤러리 15곳의 웹사이트를 대상으로 크롤링 적합성을 조사하였습니다.

## 📊 최종 추천 순위 (크롤링 적합성 기준)

### 🥇 1등급 - 즉시 구현 가능 (90점 이상)

#### 1위. 갤러리현대 (95점)
- **URL**: https://www.galleryhyundai.com
- **크롤링 난이도**: ⭐⭐ (쉬움)
- **장점**: 
  - robots.txt 제한 없음
  - 서버사이드 렌더링 (JavaScript 불필요)
  - 명확한 URL 구조 (/exhibitions)
  - 한국어/영어 병행 제공
  - 과거/현재/예정 전시 모두 제공
- **데이터 품질**: ⭐⭐⭐⭐⭐ (최상)
- **구현 우선순위**: 🔥 최우선

#### 2위. 가나아트갤러리 (90점)
- **URL**: https://www.ganaart.com
- **크롤링 난이도**: ⭐⭐ (쉬움)
- **장점**:
  - WordPress 기반 (예측 가능한 구조)
  - RSS 피드 제공
  - 영어/한국어 지원
  - 작가별 상세 정보
- **단점**: WordPress REST API는 인증 필요
- **데이터 품질**: ⭐⭐⭐⭐ (우수)
- **구현 우선순위**: 🔥 최우선

### 🥈 2등급 - 구현 용이 (80-89점)

#### 3위. 학고재갤러리 (85점)  
- **URL**: https://www.hakgojae.com
- **크롤링 난이도**: ⭐⭐ (쉬움)
- **장점**: 전통적인 HTML 구조, 안정적
- **데이터 품질**: ⭐⭐⭐⭐ (우수)

#### 4위. 대전시립미술관 (80점)
- **URL**: https://dmma.daejeon.go.kr  
- **크롤링 난이도**: ⭐⭐ (쉬움)
- **장점**: 공공기관 특성상 표준화된 구조
- **데이터 품질**: ⭐⭐⭐ (보통)

### 🥉 3등급 - 중급 구현 (70-79점)

#### 5위. 국립현대미술관 (75점)
- **URL**: https://www.mmca.go.kr
- **크롤링 난이도**: ⭐⭐⭐ (중간)
- **장점**: 최고 품질의 전시 데이터
- **단점**: JavaScript 의존적, 복잡한 구조
- **데이터 품질**: ⭐⭐⭐⭐⭐ (최상)
- **구현 방법**: Puppeteer 등 브라우저 자동화 필요

#### 6위. 예술의전당 (75점)
- **URL**: https://www.sac.or.kr
- **크롤링 난이도**: ⭐⭐⭐ (중간)  
- **장점**: 대규모 전시 정보, 공연+전시 통합
- **데이터 품질**: ⭐⭐⭐⭐ (우수)

#### 7위. 대림미술관 (70점)
- **URL**: https://www.daelimmuseum.org
- **크롤링 난이도**: ⭐⭐⭐ (중간)
- **장점**: WordPress 기반, 깔끔한 디자인
- **데이터 품질**: ⭐⭐⭐ (보통)

#### 8위. 서울시립미술관 (70점)
- **URL**: https://sema.seoul.go.kr
- **크롤링 난이도**: ⭐⭐⭐⭐ (어려움)
- **단점**: React SPA, API 호출 필요
- **데이터 품질**: ⭐⭐⭐⭐ (우수)

### 🔴 4등급 - 고급 구현 (60-69점)

#### 9위. 아모레퍼시픽미술관 (65점)
- **URL**: https://www.apma.org
- **크롤링 난이도**: ⭐⭐⭐ (중간)

#### 10위. 아라리오갤러리 (65점) 
- **URL**: https://www.arario.com
- **크롤링 난이도**: ⭐⭐⭐⭐ (어려움)
- **단점**: 복잡한 SPA 구조

#### 11위. 부산시립미술관 (65점)
- **URL**: https://art.busan.go.kr

#### 12위. 일민미술관 (60점)
- **URL**: https://www.ilmin.org

#### 13위. 페리지갤러리 (60점)
- **URL**: https://www.perigee.co.kr

### ❌ 구현 불가

#### 리움미술관 (0점)
- **URL**: https://www.leeum.org
- **상태**: 사이트 접근 제한 또는 리뉴얼 중

## 🛠️ 기술적 구현 전략

### Phase 1: 즉시 구현 (1-2주)
```javascript
// 1. 갤러리현대 크롤러
const crawlGalleryHyundai = async () => {
  // 서버사이드 렌더링, Cheerio로 충분
  // URL: /exhibitions, /exhibitions/past, /exhibitions/upcoming
};

// 2. 가나아트갤러리 크롤러  
const crawlGanaArt = async () => {
  // WordPress 구조, RSS/HTML 파싱
  // URL: /exhibition/, RSS: /exhibition/feed/
};
```

### Phase 2: 중기 구현 (2-4주)
```javascript
// 3. 학고재갤러리
// 4. 대전시립미술관
// 5. 대림미술관
```

### Phase 3: 고급 구현 (1-2개월)
```javascript
// JavaScript 렌더링 필요한 사이트들
const advancedCrawlers = [
  'mmca.go.kr',      // Puppeteer 필요
  'sema.seoul.go.kr', // API 역공학 필요
  'arario.com'       // SPA 처리 필요
];
```

## 📋 크롤링 시 고려사항

### robots.txt 준수 상황
- ✅ 제한 없음: 갤러리현대, 서울시립미술관
- ⚠️ 일부 제한: 국립현대미술관 (vision.do만 제한)
- ✅ WordPress 표준: 가나아트갤러리 (wp-admin만 제한)

### 데이터 구조 표준화 필요
```typescript
interface ExhibitionData {
  title: string;
  titleEn?: string;
  venue: string;
  startDate: Date;
  endDate: Date;
  artists: string[];
  description: string;
  images: string[];
  price?: string;
  website: string;
  source: string;
}
```

## 🎯 최종 권장사항

### 즉시 시작할 크롤러 TOP 5
1. **갤러리현대** - 가장 안정적, 데이터 품질 최상
2. **가나아트갤러리** - WordPress 기반으로 예측 가능
3. **학고재갤러리** - 전통적 구조로 안전
4. **대전시립미술관** - 공공데이터 특성상 표준화
5. **예술의전당** - 대용량 데이터로 DB 구축에 유리

### 기술 스택 권장
- **기본 크롤링**: Node.js + Cheerio + Axios
- **고급 크롤링**: Puppeteer (JavaScript 렌더링)
- **데이터베이스**: PostgreSQL + 중복 제거 로직
- **스케줄링**: 일일 1-2회 업데이트

### 성공 지표
- 일일 전시 정보 50-100건 수집
- 데이터 정확도 95% 이상
- 사이트별 응답시간 5초 이내
- 중복률 5% 이하

## 🔄 유지보수 계획
- 주간: 크롤링 상태 모니터링
- 월간: 새로운 미술관/갤러리 추가 검토
- 분기: 사이트 구조 변경 대응
- 연간: 크롤링 전략 재검토