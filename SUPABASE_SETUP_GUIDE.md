# 🚀 SAYU Supabase 전시 데이터베이스 설정 가이드

## 📌 빠른 설정 (3단계)

### 1️⃣ Supabase Dashboard 접속
```
https://supabase.com/dashboard/project/hgltvdshuyfffskvjmst
```

### 2️⃣ SQL Editor 실행
1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. **New Query** 버튼 클릭
3. `exhibitions-final-141.sql` 파일 내용 전체 복사/붙여넣기
4. **Run** 버튼 클릭 (또는 Ctrl+Enter)

### 3️⃣ 결과 확인
성공 시 다음 메시지가 표시됩니다:
```
✅ SAYU 전시 데이터베이스 설정 완료!
총 141개 전시가 성공적으로 등록되었습니다.
```

---

## 📊 생성된 데이터 확인

### Table Editor에서 확인
1. 왼쪽 메뉴 **Table Editor** 클릭
2. `exhibitions_clean` 테이블 선택
3. 141개 전시 데이터 확인

### 주요 통계
- **총 전시**: 141개
- **종료**: 24개
- **진행중**: 98개
- **예정**: 19개
- **추천 전시**: 18개 (주요 미술관)

---

## 🔧 코드 업데이트

### 1. chatbot-context-provider.ts 수정
```typescript
// frontend/lib/chatbot-context-provider.ts
// 76번째 줄 근처

// 기존
.from('exhibitions')

// 변경
.from('exhibitions_clean')
```

### 2. API Routes 수정 (필요시)
```typescript
// app/api/exhibitions/route.ts
// 테이블명 변경

// 기존
.from('exhibitions')

// 변경
.from('exhibitions_clean')
```

---

## ⚠️ 주의사항

### SQL 실행 전 확인
1. **백업**: 기존 `exhibitions` 테이블이 있다면 백업
2. **TRUNCATE**: SQL에 `TRUNCATE TABLE` 포함 - 기존 데이터 삭제됨
3. **테스트**: 개발 환경에서 먼저 테스트 권장

### 데이터 특징
- **중복 제거**: 서울미디어시티비엔날레, N/A 차연서 중복 제거
- **우선순위**: 국립/시립 미술관 우선
- **위치**: 서울 137개, 부산 3개, 파주 1개

---

## 🔍 데이터 검증 쿼리

### 전체 카운트
```sql
SELECT COUNT(*) FROM exhibitions_clean;
-- 결과: 141
```

### 상태별 분포
```sql
SELECT status, COUNT(*) 
FROM exhibitions_clean 
GROUP BY status;
```

### 주요 미술관 전시
```sql
SELECT venue_name, exhibition_title 
FROM exhibitions_clean 
WHERE is_featured = true
ORDER BY priority_order;
```

### 현재 진행중 전시
```sql
SELECT * FROM exhibitions_clean 
WHERE status = 'ongoing'
ORDER BY priority_order;
```

---

## 🛠️ 문제 해결

### 테이블이 이미 존재하는 경우
```sql
-- 기존 테이블 삭제 (주의!)
DROP TABLE IF EXISTS exhibitions_clean CASCADE;

-- 그 다음 exhibitions-final-141.sql 실행
```

### 권한 오류
- Supabase Dashboard에서 직접 실행
- 또는 Service Role Key 사용

### 데이터 롤백
```sql
-- 백업이 있다면
INSERT INTO exhibitions_clean 
SELECT * FROM exhibitions_backup;
```

---

## ✅ 완료 체크리스트

- [ ] Supabase SQL Editor에서 `exhibitions-final-141.sql` 실행
- [ ] 141개 데이터 확인
- [ ] `chatbot-context-provider.ts` 테이블명 변경
- [ ] 로컬 테스트
- [ ] 챗봇이 실제 전시 추천하는지 확인

---

## 📝 추가 정보

### 파일 목록
- `exhibitions-final-141.sql` - 메인 SQL (실행용)
- `exhibitions-final-141.json` - JSON 백업
- `exhibitions-final-141.js` - 원본 리스트

### 다음 단계
1. 전시 상세 정보 추가 (입장료, 운영시간 등)
2. 이미지 URL 추가
3. 실시간 업데이트 시스템 구축

---

작성일: 2025-08-31
총 전시: 141개 (중복 제거 완료)
