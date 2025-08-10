# SAYU 데이터베이스 전략 수정 (2025.08)

## 핵심 발견
exhibitions 테이블에 이미 venue 정보가 있지만 품질이 낮음:
- venue_id: 77%가 null
- venue_name: 숫자나 주소 일부인 경우 많음
- venue_city, venue_country는 대체로 정상

## 수정된 전략: "통합보다는 정리"

### 1단계: 현재 구조 유지하면서 데이터 품질 개선

#### A. 국제갤러리 데이터 즉시 Import
```javascript
// exhibitions 테이블 구조에 맞게 import
{
  id: "kukje-전시명-2024",
  title_en: "전시 제목",
  title_local: "전시 제목 한글",
  venue_name: "국제갤러리",  // 정확한 이름
  venue_city: "서울",
  venue_country: "KR",
  venue_id: null,  // 나중에 매칭
  // ... 나머지 필드
}
```

#### B. Venue 자동 생성/매칭
1. venue_name이 정상적인 경우 → venues 테이블에 추가
2. 기존 venue와 매칭 시도
3. 매칭 실패시 새 venue 생성

### 2단계: 데이터 정리 (나중에)

#### A. Venue Name 정리
- "407" → 실제 갤러리 이름 찾기
- "(신사동)" → 주변 정보로 추론
- 해외 전시관 → 별도 관리

#### B. 점진적 Venue ID 연결
- 수동 매칭 도구 개발
- AI 기반 추천

### 3단계: 미래 통합 (선택사항)
- 데이터 품질이 개선된 후
- 필요하다면 exhibitions_unified로 이전

## 즉시 실행 계획

### 1. 국제갤러리 Import 스크립트 수정
- exhibitions 테이블 구조에 맞게
- venue 정보 포함
- 새로운 테이블(exhibition_artworks 등)도 활용

### 2. 간단한 Venue 매칭 로직
```sql
-- 1. 정확한 이름 매칭
UPDATE exhibitions e
SET venue_id = v.id
FROM venues v
WHERE e.venue_id IS NULL
AND e.venue_name = v.name
AND e.venue_city = v.city;

-- 2. 국제갤러리처럼 알려진 곳은 수동 매칭
UPDATE exhibitions
SET venue_id = '국제갤러리-UUID'
WHERE venue_name = '국제갤러리'
AND venue_id IS NULL;
```

## 장점
1. **즉시 실행 가능**: 복잡한 마이그레이션 불필요
2. **위험 최소화**: 기존 시스템 그대로 유지
3. **점진적 개선**: 새 데이터부터 품질 향상
4. **실용적**: 완벽하지 않아도 작동

## 결론
통합(unification)은 나중에 하고, 지금은:
1. 국제갤러리 데이터 import
2. 새 데이터는 venue 정보 정확히
3. 기존 데이터는 점진적 개선