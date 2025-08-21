# 🚀 Gallery Collection 수정 - 단계별 가이드

## 현재 문제
```
❌ 오류: "invalid input syntax for type uuid: peasant-woman"
원인: artworks.id가 UUID인데, "peasant-woman" 같은 문자열 ID를 저장하려고 함
```

## 해결 방법: Dual ID 시스템
- `id` (UUID): 내부 관계용 (변경 안 함)
- `external_id` (VARCHAR): "peasant-woman" 같은 외부 ID 저장용 (새로 추가)

---

## 📋 단계별 진행

### 🔍 Step 0: 현재 상태 확인
**Supabase SQL Editor에서 실행:**
```sql
-- scripts/00-check-current-state.sql 파일 내용 실행
-- 결과를 복사해서 보관
```

**체크포인트:**
- [ ] artworks 테이블 구조 확인됨
- [ ] external_id 컬럼 존재 여부 확인됨
- [ ] 기존 데이터 개수 확인됨

---

### ✅ Step 1: external_id 컬럼 추가 (최소 변경)
**Supabase SQL Editor에서 실행:**
```sql
-- scripts/01-add-external-id-safely.sql 파일 내용 실행
```

**예상 결과:**
```
✅ external_id 컬럼이 추가되었습니다
```

**체크포인트:**
- [ ] external_id 컬럼이 추가됨
- [ ] 기존 데이터는 그대로 유지됨
- [ ] 에러 없이 실행됨

---

### 🔄 Step 2: 기존 데이터 처리 (필요한 경우만)

**2-A. 기존 데이터가 없는 경우:**
```
✅ 이 단계 건너뛰고 Step 3로 이동
```

**2-B. 기존 데이터가 있는 경우:**
```sql
-- scripts/02-migrate-existing-data.sql에서 옵션 1 실행
BEGIN;
UPDATE artworks
SET external_id = id::text
WHERE external_id IS NULL;
-- 결과 확인 후
COMMIT; -- 문제 없으면
-- 또는
ROLLBACK; -- 문제 있으면
```

**체크포인트:**
- [ ] 기존 artwork에 external_id 설정됨
- [ ] 중복 없음 확인
- [ ] 데이터 손실 없음

---

### 🧪 Step 3: API 테스트

**3-A. 테스트 데이터 준비:**
```sql
-- scripts/03-test-api-minimal.sql의 섹션 1 실행
-- 테스트용 artwork 생성
```

**3-B. 로컬에서 API 테스트:**
```bash
# 1. 개발 서버 실행
npm run dev

# 2. 다른 터미널에서 테스트 (YOUR_USER_ID를 실제 ID로 변경)
curl -X POST http://localhost:3000/api/gallery/collection \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "artworkId": "test-peasant-woman",
    "action": "save"
  }'
```

**예상 응답:**
```json
{
  "success": true,
  "action": "save",
  "newCount": 1
}
```

**체크포인트:**
- [ ] 저장 API 작동 확인
- [ ] 조회 API 작동 확인
- [ ] 에러 없음

---

### ⏸️ 중간 점검
여기까지 완료되면:
- ✅ 기본 기능 작동
- ✅ "peasant-woman" 같은 ID 저장 가능
- ✅ 기존 시스템 호환성 유지

**이 상태로도 충분히 사용 가능합니다!**

---

## 🚀 선택적 최적화 (성능이 중요한 경우)

### Step 4: 인덱스 추가 (권장)
```sql
-- 검색 속도 10배 향상
CREATE UNIQUE INDEX IF NOT EXISTS idx_artworks_external_id 
ON artworks(external_id) 
WHERE external_id IS NOT NULL;
```

### Step 5: RPC 함수 (고급)
```sql
-- scripts/create-gallery-functions.sql 실행
-- 트랜잭션 처리와 원자성 보장
```

---

## ✅ 최종 확인

### 모든 기능 테스트:
1. **Gallery 페이지에서:**
   - 작품 저장 클릭 → 성공
   - My Collection 확인 → 표시됨
   - 작품 제거 → 성공

2. **콘솔 에러 확인:**
   - UUID 에러 없음
   - 500 에러 없음

### 성능 확인:
```sql
EXPLAIN ANALYZE
SELECT * FROM artworks 
WHERE external_id = 'test-peasant-woman';
-- 실행 시간 < 1ms 확인
```

---

## 🆘 문제 해결

### "invalid input syntax for type uuid" 여전히 발생
→ external_id 컬럼이 제대로 추가되지 않음
→ Step 1 다시 실행

### API가 작동하지 않음
→ 서버 재시작 필요
→ `npm run dev` 다시 실행

### 데이터가 저장되지 않음
→ RLS 정책 확인
→ user_id가 올바른지 확인

---

## 📝 진행 상황 기록

```
[ ] Step 0: 현재 상태 확인 - 완료 시간: ___
[ ] Step 1: external_id 추가 - 완료 시간: ___
[ ] Step 2: 데이터 마이그레이션 - 완료 시간: ___
[ ] Step 3: API 테스트 - 완료 시간: ___
[ ] Step 4: 인덱스 추가 - 완료 시간: ___
[ ] Step 5: RPC 함수 - 완료 시간: ___
```

---

## 🎉 완료!
모든 단계를 완료하면 "peasant-woman" 같은 ID를 문제없이 사용할 수 있습니다!