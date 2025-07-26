# Artmap.com 사이트 분석 및 크롤링 가이드

## 🔍 사이트 개요

**Artmap.com**은 전 세계 현대 미술 정보를 제공하는 플랫폼으로, 다음과 같은 구조를 가지고 있습니다:

- **URL**: https://artmap.com
- **주요 콘텐츠**: 미술관, 갤러리, 전시, 아티스트 정보
- **지역 범위**: 전 세계 (주로 유럽, 북미, 아시아)
- **언어**: 영어 (일부 다국어 지원)

## 📋 크롤링 허용 여부 분석

### 1. robots.txt 현황
- **상태**: robots.txt 파일 없음 (404 오류)
- **의미**: 명시적인 크롤링 제한 규칙 없음
- **결론**: 크롤링 허용으로 해석 가능

### 2. 기술적 제약사항
- **Rate Limiting**: 특별한 제한 없음 (테스트 결과)
- **User-Agent 차단**: 확인되지 않음
- **CAPTCHA**: 없음
- **JavaScript 의존성**: 낮음 (서버사이드 렌더링)

### 3. 권장 크롤링 정책
- **요청 간격**: 1-2초 권장
- **동시 연결**: 1개 (순차 처리)
- **User-Agent**: 적절한 봇 식별자 사용
- **에러 처리**: 404, 5xx 에러에 대한 재시도 로직

## 🏛️ 사이트 구조 분석

### 1. 미술 기관 정보 구조

#### A. 기관 목록 페이지
```
URL 패턴: /venues/{type}/{letter}/worldwide
- type: institutions, galleries, furtherspaces, all
- letter: a-z, 1 (숫자로 시작하는 이름)
```

**수집 가능한 데이터:**
- 기관명
- 도시
- 웹사이트 URL
- 내부 링크 경로

#### B. 기관 상세 페이지
```
URL 패턴: /{institution-slug}/contact
```

**수집 가능한 데이터:**
- 전체 주소
- 전화번호
- 이메일 주소
- 공식 웹사이트
- GPS 좌표 (Google Maps 연동)

### 2. 전시 정보 구조

#### A. 전시 목록 페이지
```
URL 패턴: /exhibitions/{type}/{sort}/worldwide
- type: institutions, galleries, furtherspaces, all, featured
- sort: opening, closing, venue
```

**수집 가능한 데이터:**
- 전시명
- 개최 기관
- 전시 기간
- 내부 링크

#### B. 전시 상세 페이지
```
URL 패턴: /{venue-slug}/exhibition/{exhibition-slug}
```

**수집 가능한 데이터:**
- 상세 설명
- 참여 아티스트
- 큐레이터 정보
- 이미지
- 관련 링크

## 🔧 API 존재 여부

### 공식 API: 없음
- `/api/` 엔드포인트 확인 결과: 404
- 공개 API 문서 없음
- GraphQL 엔드포인트 없음

### 대안 데이터 소스
- **RSS/XML 피드**: 확인되지 않음
- **JSON 데이터**: 페이지 내 JavaScript 변수로 일부 데이터 제공
- **Sitemap**: 없음

## 📊 크롤링 가능한 데이터 유형

### 1. 미술 기관 데이터
```javascript
{
  name: "기관명",
  type: "institution|gallery|alternative",
  address: "주소",
  city: "도시",
  country: "국가",
  phone: "전화번호",
  email: "이메일",
  website: "웹사이트",
  coordinates: { lat: 37.5665, lng: 126.9780 }
}
```

### 2. 전시 데이터
```javascript
{
  title: "전시명",
  venue: "개최 기관",
  startDate: "시작일",
  endDate: "종료일",
  artists: ["아티스트1", "아티스트2"],
  description: "전시 설명",
  images: ["이미지URL1", "이미지URL2"],
  curator: "큐레이터"
}
```

### 3. 아티스트 데이터
```javascript
{
  name: "아티스트명",
  nationality: "국적",
  birthYear: 1970,
  exhibitions: ["전시1", "전시2"],
  profileUrl: "프로필 링크"
}
```

## ⚠️ 크롤링 시 주의사항

### 1. 윤리적 고려사항
- **저작권**: 이미지 및 텍스트 저작권 확인 필요
- **개인정보**: 연락처 정보 처리 시 GDPR 준수
- **출처 표기**: 데이터 사용 시 artmap.com 출처 명시

### 2. 기술적 제약
- **서버 부하**: 과도한 요청으로 인한 서버 부담 방지
- **IP 차단**: 동일 IP에서 과도한 요청 시 차단 가능성
- **데이터 변동**: 전시 정보는 자주 변경됨

### 3. Rate Limiting 고려사항
```javascript
// 권장 설정
{
  requestDelay: 1000,      // 1초 간격
  maxConcurrent: 1,        // 동시 요청 1개
  retryAttempts: 3,        // 실패 시 3회 재시도
  timeout: 10000,          // 10초 타임아웃
  respectUserAgent: true   // 적절한 User-Agent 사용
}
```

## 🎯 SAYU 프로젝트 통합 방안

### 1. 데이터 매핑 전략

#### A. 미술관 정보 통합
```sql
-- SAYU venues 테이블과 매핑
INSERT INTO venues (
  name, name_en, type, address, city, country,
  phone, email, website, latitude, longitude,
  source, external_id
) VALUES (
  artmap_name, artmap_name, 'museum',
  artmap_address, artmap_city, artmap_country,
  artmap_phone, artmap_email, artmap_website,
  artmap_lat, artmap_lng,
  'artmap', artmap_url_slug
);
```

#### B. 전시 정보 통합
```sql
-- SAYU exhibitions 테이블과 매핑
INSERT INTO exhibitions (
  title, title_en, description, start_date, end_date,
  venue_id, source, external_id, status
) VALUES (
  artmap_title, artmap_title, artmap_description,
  artmap_start, artmap_end, venue_id,
  'artmap', artmap_exhibition_id, 'active'
);
```

### 2. 감정 매핑 시스템

#### A. 전시 감정 분석
```javascript
// 전시 설명을 기반으로 감정 프로필 생성
async function analyzeExhibitionEmotion(description) {
  const keywords = {
    contemplative: ['meditation', 'reflection', 'quiet', 'minimal'],
    energetic: ['dynamic', 'movement', 'vibrant', 'bold'],
    mysterious: ['shadow', 'hidden', 'enigmatic', 'surreal'],
    uplifting: ['celebration', 'joy', 'light', 'hope']
  };
  
  // GPT-4를 사용한 감정 분석
  const emotionProfile = await analyzeWithAI(description);
  return emotionProfile;
}
```

#### B. 성격 유형별 매칭
```javascript
// 16가지 동물 성격과 전시 매칭
const personalityMatching = {
  wolf: ['experimental', 'conceptual', 'challenging'],
  fox: ['colorful', 'impressionist', 'nature'],
  eagle: ['grand', 'historical', 'classic'],
  dolphin: ['interactive', 'community', 'social']
};
```

### 3. 크롤링 스케줄 전략

#### A. 일일 업데이트
- **신규 전시**: 매일 오전 업데이트
- **기관 정보**: 주 1회 검증
- **완료된 전시**: 자동 아카이브

#### B. 점진적 확장
1. **Phase 1**: 주요 도시 기관 (100개)
2. **Phase 2**: 유럽/북미 확장 (500개)
3. **Phase 3**: 전 세계 커버리지 (1000+개)

## 🚀 구현된 솔루션

### 크롤러 서비스
- **파일**: `/backend/src/services/artmapCrawlerService.js`
- **기능**: 기관/전시 정보 자동 수집
- **특징**: Rate limiting, 에러 처리, DB 통합

### 실행 스크립트
- **파일**: `/backend/crawl-artmap.js`
- **사용법**: 
  ```bash
  # 테스트 모드
  node crawl-artmap.js --test
  
  # 특정 알파벳 크롤링
  node crawl-artmap.js --letter=a --limit=10
  
  # 전시 정보만 크롤링
  node crawl-artmap.js --exhibitions --limit=20
  ```

## 📈 예상 수집 규모

### 기관 정보
- **전 세계 미술관**: 약 2,000-3,000개
- **갤러리**: 약 5,000-8,000개
- **대안공간**: 약 1,000-2,000개

### 전시 정보
- **현재 전시**: 약 500-1,000개
- **월간 신규**: 약 200-400개
- **연간 누적**: 약 2,500-5,000개

## 🔄 지속적 업데이트 전략

### 1. 모니터링 시스템
- 신규 기관 자동 감지
- 전시 일정 변경 추적
- 데이터 품질 검증

### 2. 사용자 피드백 통합
- 부정확한 정보 신고 시스템
- 누락된 기관/전시 제보
- 커뮤니티 큐레이션

### 3. AI 기반 개선
- 전시 설명 자동 번역
- 감정 매핑 정확도 향상
- 개인화 추천 알고리즘 학습

## 📝 결론

Artmap.com은 SAYU 프로젝트에 매우 유용한 데이터 소스입니다:

✅ **장점:**
- 전 세계 광범위한 커버리지
- 구조화된 데이터 형태
- 크롤링 제약 없음
- 정기적인 업데이트

⚠️ **주의점:**
- 저작권 및 윤리적 사용
- 적절한 Rate Limiting
- 데이터 품질 검증 필요
- 지속적인 모니터링 요구

**권장사항:** 단계적 접근으로 시작하여 점진적으로 확장하되, 항상 윤리적 크롤링 원칙을 준수해야 합니다.