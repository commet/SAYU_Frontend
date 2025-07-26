# Venue Table Migration Guide

## 🚨 중요: venues → global_venues 마이그레이션 가이드

### 현재 상태
- **`venues` 테이블**: 한국 미술관/갤러리 751개 (원본 유지)
- **`global_venues` 테이블**: 전 세계 1,081개 (통합 완료)
  - 한국 venues에서 721개 마이그레이션
  - 해외에서 360개 수집

### ⚠️ 모든 새로운 코드는 반드시 global_venues 사용

## 📝 코드 변경 가이드

### 1. Model 사용
```javascript
// ❌ OLD - 사용하지 마세요
const VenueModel = require('./models/venueModel');

// ✅ NEW - 이렇게 사용하세요
const GlobalVenueModel = require('./models/globalVenueModel');
```

### 2. SQL 쿼리 변경

#### 기본 SELECT
```sql
-- ❌ OLD
SELECT * FROM venues WHERE city = '서울'

-- ✅ NEW
SELECT * FROM global_venues WHERE city = '서울'
```

#### JOIN 쿼리
```sql
-- ❌ OLD
SELECT e.*, v.name, v.instagram
FROM exhibitions e
JOIN venues v ON e.venue_id = v.id

-- ✅ NEW
SELECT e.*, v.name, v.social_media->>'instagram' as instagram
FROM exhibitions e
JOIN global_venues v ON e.venue_id = v.id
```

### 3. 필드 매핑

| venues (OLD) | global_venues (NEW) | 비고 |
|-------------|-------------------|------|
| `name` | `name` | 동일 |
| `name_en` | `name_en` | 동일 |
| `type` | `venue_type` | 필드명 변경 |
| `instagram` | `social_media->>'instagram'` | JSONB 구조 |
| `city` | `city` | 동일 |
| `country` | `country` | 동일 |
| `district` | `district` | 한국 특화 필드 |
| `tier` | `tier` | 한국 특화 필드 |
| `rating` | `rating` | 동일 |
| `review_count` | `review_count` | 동일 |

### 4. 새로운 필드 활용

global_venues의 추가 필드들:
- `venue_category`: 'public', 'commercial', 'private'
- `data_quality_score`: 0-100 품질 점수
- `verification_status`: 'verified', 'unverified'
- `name_local`: 현지어 이름

## 🔧 마이그레이션 체크리스트

### Backend 파일 업데이트 필요:
- [ ] `/src/models/exhibitionModel.js`
- [ ] `/src/controllers/exhibitionController.js` ✅
- [ ] `/src/services/exhibitionDataCollectorService.js`
- [ ] `/src/services/enhancedExhibitionCollectorService.js`
- [ ] `/src/services/intelligentCurationEngine.js`
- [ ] `/src/services/culturePortalIntegration.js`
- [ ] `/src/services/artmapCrawlerService.js`
- [ ] `/src/services/artmap-crawler/artmapCrawler.js`

### Frontend 파일 확인:
- [ ] API 엔드포인트 변경사항 확인
- [ ] 필드명 변경 반영 (type → venue_type)
- [ ] Instagram 필드 접근 방식 변경

## 📌 주의사항

1. **기존 venues 테이블은 삭제하지 마세요** - 백업 용도로 유지
2. **새로운 기능은 반드시 global_venues 사용**
3. **Instagram 데이터 접근 시 social_media JSONB 필드 사용**
4. **한국 venue 검색 시 country = 'South Korea' 또는 'KR' 조건 추가**

## 🚀 테스트 명령어

```bash
# 통합 상태 확인
node check-unification-status.js

# 새 Model 테스트
node test-global-venue-model.js
```

## 📊 쿼리 예제

### 한국 미술관만 조회
```sql
SELECT * FROM global_venues 
WHERE country IN ('South Korea', 'KR')
ORDER BY tier, rating DESC;
```

### 서울 갤러리 조회
```sql
SELECT * FROM global_venues 
WHERE city = '서울' 
AND venue_type = 'gallery'
AND (is_active = true OR is_active IS NULL);
```

### Instagram 있는 venue 조회
```sql
SELECT name, social_media->>'instagram' as instagram
FROM global_venues
WHERE social_media->>'instagram' IS NOT NULL;
```