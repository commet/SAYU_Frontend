# Supabase Dashboard SQL 실행 가이드

## 단계별 진행 방법

### 1. Supabase Dashboard 접속
- URL: https://supabase.com/dashboard
- 프로젝트: SAYU 선택

### 2. SQL Editor 실행
- 왼쪽 사이드바에서 **SQL Editor** 클릭
- 또는 상단 메뉴의 **SQL** 탭 클릭

### 3. SQL 실행 방법

#### 옵션 A: 전체 파일 한번에 실행
1. SQL Editor에 `batch-exhibitions-update.sql` 파일 전체 내용 복사
2. 우측 상단 **RUN** 버튼 클릭 (또는 Ctrl+Enter)

#### 옵션 B: 단계별 실행 (권장)
더 안전하게 실행하려면 다음 순서로 나누어 실행:

**Step 1: Venues 데이터 삽입**
```sql
-- 기존 venue 데이터 삭제 (중복 방지)
DELETE FROM venues_simple WHERE name_ko IN (
  '케이옥션', '상업화랑 을지로', '눈 컨템포러리', 
  -- ... (나머지 venue 이름들)
);

-- Venues 삽입
INSERT INTO venues_simple (name_ko, name_en, city, district, venue_type, is_major, priority_order) VALUES
-- ... (venue 데이터)
```

**Step 2: 각 전시별로 순차 실행**
각 전시(1번~71번)를 개별적으로 실행하여 오류 발생 시 쉽게 파악 가능

### 4. 실행 결과 확인
- 각 SQL 실행 후 하단에 결과 메시지 확인
- 성공: "Success. No rows returned" 또는 삽입된 행 수 표시
- 실패: 빨간색 오류 메시지 확인

### 5. 데이터 확인
1. 왼쪽 메뉴에서 **Table Editor** 클릭
2. 테이블 선택:
   - `exhibitions_master` - 전시 기본 정보
   - `exhibitions_translations` - 전시 번역 정보
   - `venues_simple` - 갤러리/미술관 정보
3. 새로 추가된 데이터 확인

## 주의사항
- 중복 실행 방지: 이미 실행한 SQL은 다시 실행하지 않기
- 오류 발생 시: 오류 메시지를 복사하여 문제 파악
- 트랜잭션 사용: 대량 데이터는 BEGIN/COMMIT으로 감싸기

## 문제 해결
- "duplicate key" 오류: 이미 데이터가 존재함. DELETE 후 재실행
- "foreign key violation": venue_id가 venues_simple에 없음
- 연결 오류: 네트워크 확인 후 재시도