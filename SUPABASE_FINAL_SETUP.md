# 🎨 SAYU Supabase 최종 설정 가이드

## 📌 빠른 시작 (5분 소요)

### 1️⃣ Supabase Dashboard 접속
```
https://supabase.com/dashboard/project/hgltvdshuyfffskvjmst
```

### 2️⃣ SQL Editor에서 실행

#### Step 1: 새 스키마 생성
1. SQL Editor → New Query
2. `sayu-exhibitions-optimized.sql` 내용 전체 복사
3. Run 버튼 클릭

**예상 결과:**
```
✅ SAYU 최적화 전시 DB 구축 완료!
🎯 마스터-번역 패턴으로 완벽한 다국어 지원
🔗 기존 사용자 활동 테이블과 100% 호환
```

### 3️⃣ 기존 데이터 마이그레이션

#### Step 2: 141개 전시 데이터 이전
SQL Editor에서 다음 실행:

```sql
-- 기존 141개 전시 마이그레이션
-- exhibitions-migration-141.sql 파일 실행
```

### 4️⃣ 데이터 확인

#### Step 3: 검증 쿼리
```sql
-- 전체 카운트
SELECT COUNT(*) FROM exhibitions_master;
-- 결과: 141

-- 상태별 분포
SELECT status, COUNT(*) 
FROM exhibitions_master 
GROUP BY status;

-- 한글 뷰 테스트
SELECT exhibition_title, venue_name, start_date 
FROM exhibitions_ko 
LIMIT 5;
```

---

## 📊 생성된 테이블 구조

### 핵심 테이블
1. **exhibitions_master** - 언어 중립적 전시 정보
2. **exhibitions_translations** - 다국어 번역 (ko, en)
3. **venues_simple** - 간단한 미술관 정보

### 뷰 (편의용)
- **exhibitions_ko** - 한글 전시 통합 뷰
- **exhibitions_en** - 영문 전시 통합 뷰

### 사용자 활동 테이블 (기존 호환)
- exhibition_likes
- exhibition_views
- exhibition_reviews

---

## 🔧 프론트엔드 코드 업데이트

### chatbot-context-provider.ts 수정
```typescript
// 기존
.from('exhibitions_clean')

// 변경
.from('exhibitions_ko')  // 한글 뷰 사용
```

### API 라우트 수정
```typescript
// app/api/exhibitions/route.ts
const { data } = await supabase
  .from('exhibitions_ko')  // 또는 exhibitions_en
  .select('*')
  .eq('status', 'ongoing');
```

---

## ✅ 체크리스트

- [ ] `sayu-exhibitions-optimized.sql` 실행
- [ ] 141개 데이터 마이그레이션
- [ ] 검증 쿼리로 데이터 확인
- [ ] 프론트엔드 코드 업데이트
- [ ] 챗봇 테스트

---

## 🆘 문제 해결

### 테이블이 이미 존재하는 경우
```sql
-- 주의: 기존 데이터 백업 필수!
DROP TABLE IF EXISTS exhibitions_translations CASCADE;
DROP TABLE IF EXISTS exhibitions_master CASCADE;
DROP TABLE IF EXISTS venues_simple CASCADE;
```

### 권한 오류
- Supabase Dashboard에서 직접 실행
- Service Role Key 사용

---

## 📝 다음 단계

자연어 텍스트 파싱 준비 완료!
이제 전시 정보를 텍스트로 주시면:

1. intelligent-parser.js가 자동 파싱
2. venues_simple 신규/기존 구분
3. exhibitions_master + translations 생성
4. SQL 자동 생성 → Supabase 실행

준비 완료! 🚀