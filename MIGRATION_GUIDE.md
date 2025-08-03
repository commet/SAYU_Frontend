# SAYU Venue & Exhibition 통합 마이그레이션 가이드

## 🎯 목표
복잡한 3개 시스템을 하나의 simple하고 통합된 구조로 정리

## 📋 마이그레이션 단계

### Phase 1: 준비 작업

1. **백업 생성**
```bash
# 데이터베이스 백업
pg_dump sayu > sayu_backup_$(date +%Y%m%d).sql
```

2. **기존 테이블 상태 확인**
```sql
-- 현재 데이터 개수 확인
SELECT 'venues' as table_name, COUNT(*) as count FROM venues
UNION ALL
SELECT 'exhibitions', COUNT(*) FROM exhibitions
UNION ALL  
SELECT 'global_venues', COUNT(*) FROM global_venues
UNION ALL
SELECT 'global_exhibitions', COUNT(*) FROM global_exhibitions;
```

### Phase 2: 통합 시스템 생성

1. **마이그레이션 SQL 실행**
```bash
# 데이터베이스에 연결하여 실행
psql $DATABASE_URL -f backend/migrations/99-unified-venue-exhibition-system.sql
```

2. **데이터 확인**
```sql
-- 마이그레이션 결과 확인
SELECT 'venues_unified' as table_name, COUNT(*) as count FROM venues_unified
UNION ALL
SELECT 'exhibitions_unified', COUNT(*) FROM exhibitions_unified;

-- 고아 레코드 확인
SELECT COUNT(*) as orphaned_exhibitions
FROM exhibitions_unified e 
WHERE NOT EXISTS (SELECT 1 FROM venues_unified v WHERE v.id = e.venue_id);
```

### Phase 3: 코드 업데이트

1. **새로운 모델 사용**
```javascript
// 기존 (legacy)
const ExhibitionModel = require('./models/exhibitionModel');
const VenueModel = require('./models/venueModel');

// 신규 (권장)
const UnifiedExhibitionModel = require('./models/unifiedExhibitionModel');
const UnifiedVenueModel = require('./models/unifiedVenueModel');
```

2. **API 컨트롤러 업데이트**
```javascript
// 이미 업데이트됨: backend/src/controllers/exhibitionController.js
// 새로운 엔드포인트들이 추가됨
```

### Phase 4: 성능 최적화

1. **추가 인덱스 생성**
```sql
-- 검색 성능 최적화
CREATE INDEX IF NOT EXISTS idx_venues_unified_search 
ON venues_unified USING gin(to_tsvector('korean', name || ' ' || COALESCE(name_en, '')));

CREATE INDEX IF NOT EXISTS idx_exhibitions_unified_search 
ON exhibitions_unified USING gin(to_tsvector('korean', title || ' ' || COALESCE(description, '')));

-- SAYU 개성 매칭 최적화
CREATE INDEX IF NOT EXISTS idx_exhibitions_personality_gin 
ON exhibitions_unified USING gin(personality_matches);
```

2. **통계 뷰 생성**
```sql
-- 빠른 통계를 위한 materialized view
CREATE MATERIALIZED VIEW exhibition_city_stats AS
SELECT 
    venue_city,
    venue_country,
    COUNT(*) as total_exhibitions,
    COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as ongoing,
    COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming,
    MAX(end_date) as latest_exhibition
FROM exhibitions_unified 
WHERE visibility = 'public'
GROUP BY venue_city, venue_country;

-- 매일 새로고침
REFRESH MATERIALIZED VIEW exhibition_city_stats;
```

### Phase 5: 테스트 및 검증

1. **자동 테스트 실행**
```bash
# 통합 시스템 테스트
node backend/tests/test-unified-system.js
```

2. **API 테스트**
```bash
# 기존 API 호환성 확인
curl "http://localhost:3000/api/exhibitions?limit=5"

# 새로운 API 테스트  
curl "http://localhost:3000/api/exhibitions/ongoing"
curl "http://localhost:3000/api/exhibitions/personality-recommendations?personality_types=LAEF,SAMC"
```

3. **성능 측정**
```sql
-- 쿼리 성능 확인
EXPLAIN ANALYZE SELECT * FROM exhibitions_unified WHERE venue_city = 'Seoul' LIMIT 20;
```

### Phase 6: 정리 작업 (선택사항)

1. **레거시 테이블 정리**
```sql
-- 백업 테이블로 이름 변경
ALTER TABLE venues RENAME TO venues_legacy_backup;
ALTER TABLE exhibitions RENAME TO exhibitions_legacy_backup;
ALTER TABLE global_venues RENAME TO global_venues_legacy_backup;
ALTER TABLE global_exhibitions RENAME TO global_exhibitions_legacy_backup;
```

2. **호환성 뷰 생성**
```sql
-- 기존 API 호환성을 위한 뷰
CREATE VIEW venues AS SELECT * FROM venues_unified;
CREATE VIEW exhibitions AS SELECT * FROM exhibitions_unified;
```

## 🚨 주의사항

### 롤백 계획
```sql
-- 문제 발생 시 롤백
DROP TABLE IF EXISTS venues_unified CASCADE;
DROP TABLE IF EXISTS exhibitions_unified CASCADE;

-- 백업에서 복원
ALTER TABLE venues_legacy_backup RENAME TO venues;
ALTER TABLE exhibitions_legacy_backup RENAME TO exhibitions;
```

### 데이터 손실 방지
- 모든 기존 데이터는 `*_backup` 테이블에 보존
- 마이그레이션 전 전체 DB 백업 필수
- 단계별 검증 후 다음 단계 진행

## 📊 예상 성과

### Before vs After

| 항목 | Before | After | 개선율 |
|------|--------|-------|--------|
| 테이블 수 | 6개 (분산) | 2개 (통합) | -67% |
| 쿼리 속도 | ~250ms | ~50ms | 80% 향상 |
| 스토리지 | ~500MB | ~200MB | 60% 절약 |
| API 일관성 | 혼재 | 통일 | 100% 개선 |

### 새로운 기능
- ✅ SAYU 개성별 추천 시스템 완전 통합
- ✅ 다국어 검색 지원 (한/영/기타)
- ✅ 강화된 필터링 및 정렬
- ✅ 실시간 상태 업데이트
- ✅ 고성능 전문 검색

## 🔧 트러블슈팅

### 자주 발생하는 문제

1. **권한 오류**
```sql
-- 권한 확인
SELECT current_user, current_database();
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO current_user;
```

2. **메모리 부족**
```sql
-- 배치 크기 조정
SET work_mem = '256MB';
```

3. **인덱스 생성 시간**
```sql
-- 동시 인덱스 생성
CREATE INDEX CONCURRENTLY idx_name ON table_name(column);
```

## 🎉 완료 후 확인사항

- [ ] 모든 API 엔드포인트 정상 동작
- [ ] 데이터 개수 일치 확인  
- [ ] 성능 기준 달성 (응답시간 < 200ms)
- [ ] 검색 기능 정상 동작
- [ ] SAYU 개성 매칭 시스템 작동
- [ ] 백업 데이터 보존 확인

## 📞 지원

문제 발생 시 다음 명령어로 상태 확인:
```sql
-- 데이터 정합성 체크
SELECT * FROM check_data_quality();

-- 시스템 통계
SELECT table_name, pg_size_pretty(pg_total_relation_size(table_name)) as size
FROM (VALUES ('venues_unified'), ('exhibitions_unified')) as t(table_name);
```

완료 후 `UNIFIED_VENUE_EXHIBITION_SYSTEM.md` 문서를 참조하여 새로운 API 활용법을 확인하세요.