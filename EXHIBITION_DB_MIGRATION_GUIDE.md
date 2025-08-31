# 🎨 SAYU 전시 데이터베이스 마이그레이션 가이드

## 📌 현재 상황 요약 (2025-08-31 업데이트)

### 문제점
1. 기존 `exhibitions` 테이블에 더미 데이터와 실제 데이터가 섞여있음
2. "불타는 욕망", "리처드 프린스 전시" 같은 가짜 전시들이 추천되고 있음
3. 실제 조회수가 높은 MMCA 전시들이 무시되고 있음

### 해결 방안
- 새로운 `exhibitions_clean` 테이블 생성
- 실제 전시 정보 144개 수동 입력
- 주요 미술관 우선 추천 로직 구현

## 🔄 진행 상황

### ✅ 완료된 작업

#### 0. Batch 2 데이터 추가 (2025-08-31)
- **추가 전시**: 21개 추가 (145-165번)
- **파일**: `quick-exhibition-parser-batch2.js`, `exhibitions-clean-batch2.sql`
- **특별 처리**: 
  - N/A 장소 → "미정"으로 처리
  - 다중 장소 전시 (서울시립미술관 본관 외 3곳)
  - 부산, 파주 등 지역 전시 포함

#### 1. 챗봇 실시간 데이터 연동
- **파일**: `frontend/lib/chatbot-context-provider.ts`
- **기능**: Supabase에서 실시간 전시 데이터 로드
- **캐싱**: 5분 캐시로 성능 최적화

#### 2. 주요 미술관 우선 추천 로직
```javascript
// frontend/lib/chatbot-context-provider.ts
const MAJOR_VENUES = [
  '국립현대미술관',
  '서울시립미술관',
  '리움미술관',
  '호암미술관',
  '아모레퍼시픽미술관',
  '한가람미술관',
  '예술의전당',
  'DDP',
  '동대문디자인플라자',
  '대림미술관',
  // ...
]
```
- 각 미술관에서 1개씩 먼저 선택
- 그 다음 view_count 순으로 나머지 채움

#### 3. 새 테이블 스키마 설계
- **파일**: `create-clean-exhibitions-table.sql`
- **테이블명**: `exhibitions_clean`
- **주요 필드**:
  - exhibition_title (한글/영문 통합)
  - artists[] (배열)
  - start_date, end_date
  - status (ongoing/upcoming/ended)
  - venue_name, city, address
  - exhibition_type (solo/group/special/biennale)
  - genre (contemporary/painting/photography/media 등)
  - priority_order (우선순위)
  - is_featured (추천 여부)

#### 4. 자동 파싱 도구 개발
- **파일**: `quick-exhibition-parser.js`
- **기능**: 
  - "갤러리명 / 전시명 (날짜)" 형식을 SQL로 자동 변환
  - 전시 타입, 장르 자동 추측
  - 우선순위 자동 설정

### 🚧 진행해야 할 작업

#### 1. Supabase에 새 테이블 생성 ✅
```bash
# Supabase Dashboard > SQL Editor에서 실행
# 파일: create-clean-exhibitions-table.sql
```

#### 2. 전시 데이터 입력 
**✅ Batch 1 완료**: 144개 전시 (exhibitions-clean-batch1.sql)
**🔄 Batch 2 진행**: 21개 추가 전시 (145-165번) - **USER INPUT REQUIRED**

##### Batch 2 Instructions:
1. **파서 준비**: `quick-exhibition-parser-batch2.js` 생성 완료 ✅
2. **필요한 정보**: 21개 전시를 다음 형식으로 제공 필요:
   ```
   갤러리명 / 전시명 (날짜)
   ```
3. **특별 케이스 지원**:
   - N/A venue 자동 처리
   - 다중 장소 (예: "서울시립미술관 본관 외 3곳") 자동 처리
   - 우선순위 자동 배정 (40번대부터)
4. **출력**: `exhibitions-clean-batch2.sql`, `exhibitions-clean-batch2.json`

**우선순위 1: 국립/시립 미술관 (8월-9월)**
```
국립현대미술관 서울 / 김창열 회고전 (8.22-12.21)
국립현대미술관 서울 / 올해의 작가상 2025 (8.29-2026.2.1)
서울시립미술관 / 서울미디어시티비엔날레 (8.26-11.24)
```

**우선순위 2: 블록버스터 전시**
```
리움미술관 / 이불: 1998년 이후 (9.4-2026.1.4)
예술의전당 한가람미술관 / 오랑주리-오르세 특별전 (9.20-2026.1.25)
예술의전당 한가람미술관 / 마르크 샤갈 특별전 (5.15-9.21)
DDP / 톰 삭스 (4.25-9.7)
DDP 뮤지엄 / 장 미셸 바스키아 (9.23-2026.1.31)
대림미술관 / 페트라 콜린스 (8.29-11.30)
아모레퍼시픽미술관 / 무라카미 다카시 (9.2-10.11)
```

**우선순위 3: 아트페어**
```
코엑스 / Frieze Seoul 2025 (9.3-9.6)
코엑스 / Kiaf 서울 2025 (9.3-9.7)
```

**우선순위 4: 주요 갤러리 (9월)**
```
국제갤러리 / 갈라 포라스-김 (9.2-10.26)
국제갤러리 / 루이즈 부르주아 (9.2-10.26)
타데우스 로팍 서울 / 안토니 곰리 (9.2-11.8)
페이스갤러리 / 제임스 터렐 (7.1-9.27)
글래드스톤갤러리 / 우고 론디노네 (8.29-10.30)
```

#### 3. 데이터 입력 방법

**방법 1: 파서 사용 (권장)**
```bash
# 1. quick-exhibition-parser.js 수정
# 2. 전시 목록 추가
# 3. 실행
node quick-exhibition-parser.js

# 4. 생성된 exhibitions-clean-batch1.sql을 Supabase에서 실행
```

**방법 2: 직접 입력**
```sql
INSERT INTO exhibitions_clean (
  exhibition_title, venue_name, start_date, end_date,
  exhibition_type, genre, priority_order, is_featured
) VALUES 
('김창열 회고전', '국립현대미술관 서울', '2025-08-22', '2025-12-21', 
 'solo', 'contemporary', 1, true);
```

**방법 3: Supabase Dashboard**
- Table Editor > exhibitions_clean > Insert Row

#### 4. 코드 수정 필요 사항

**chatbot-context-provider.ts 수정**
```typescript
// 기존 'exhibitions' → 'exhibitions_clean'으로 변경
const { data } = await supabase
  .from('exhibitions_clean')  // 변경
  .select('*')
```

**API route 수정**
```typescript
// app/api/exhibitions/route.ts
// 테이블명 변경 필요
```

## 📊 전체 전시 목록 (165개 - Batch 1: 144개 + Batch 2: 21개)

### 8월 종료 (45개) - 낮은 우선순위
```
케이옥션 / 8월 메이저 경매 (-8.20)
상업화랑 을지로 / 김민조·오주안·홍세진 (-8.20)
눈 컨템포러리 / 김기정·로지은 (-8.20)
... (나머지는 exhibition-input-template.md 참조)
```

### 진행중/9월 시작 (99개) - 높은 우선순위
```
(위의 우선순위 1-4 참조)
갤러리현대 / 김민정 (8.27-10.19)
송은 / 파노라마 (8.22-10.16)
일민미술관 / 형상 회로 (8.22-10.26)
... (나머지는 exhibition-input-template.md 참조)
```

## 🛠️ 필요한 추가 정보

각 전시별로 수집해야 할 정보:
1. **필수**: 정확한 날짜, 장소명
2. **중요**: 입장료, 운영시간
3. **선택**: 전시 설명 (2-3문장), 작가명, 주소, 전화번호, 웹사이트

## 📝 다음 단계 체크리스트

- [ ] Supabase에 `exhibitions_clean` 테이블 생성
- [ ] 우선순위 1-2 전시 데이터 입력 (약 20개)
- [ ] chatbot-context-provider.ts 테이블명 변경
- [ ] 로컬에서 테스트
- [ ] 나머지 전시 데이터 단계적 입력
- [ ] 기존 exhibitions 테이블 백업 후 제거 고려

## 💡 팁

1. **빠른 입력을 위해**: quick-exhibition-parser.js 활용
2. **데이터 검증**: 날짜가 올바른지, venue_name이 일관되는지 확인
3. **우선순위**: 국립미술관(1-10) > 블록버스터(11-20) > 주요갤러리(21-30) > 일반(31+)

## 🔗 관련 파일

- `/create-clean-exhibitions-table.sql` - 테이블 생성 SQL
- `/clean-exhibitions-data.js` - 샘플 데이터 (23개)
- `/quick-exhibition-parser.js` - 자동 파싱 도구 (Batch 1)
- `/quick-exhibition-parser-batch2.js` - 자동 파싱 도구 (Batch 2)
- `/exhibition-input-template.md` - 입력 가이드
- `/exhibitions-clean-batch1.sql` - 첫 배치 SQL (28개)
- `/exhibitions-clean-batch1.json` - 첫 배치 JSON
- `/exhibitions-clean-batch2.sql` - 두번째 배치 SQL (21개 추가, 총 165개)
- `/exhibitions-clean-batch2.json` - 두번째 배치 JSON

## 🚨 주의사항

1. **Supabase URL 확인**: `hgltvdshuyfffskvjmst.supabase.co` (ffjasggfifzxnsuagiml 아님!)
2. **포트 확인**: 현재 개발 서버는 3004 포트 사용 중
3. **캐시 이슈**: 변경사항이 반영 안되면 서버 재시작 필요

---

작성일: 2025-08-30
작성자: Claude
다음 작업자를 위한 메모: 파서가 이미 준비되어 있으니 텍스트 형식으로 전시 목록만 정리하면 빠르게 SQL 생성 가능!