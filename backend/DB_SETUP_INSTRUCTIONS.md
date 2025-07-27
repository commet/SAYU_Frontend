# 데이터베이스 설정 실행 가이드

## Railway에서 데이터베이스 초기화하기

### 방법 1: Railway Query 탭 사용 (권장)

1. Railway 대시보드에서 PostgreSQL 서비스 클릭
2. **Query** 탭 선택
3. 다음 파일의 내용을 복사하여 붙여넣기:
   ```
   backend/migrations/master-schema.sql
   ```
4. **Run Query** 클릭
5. 성공 메시지 확인

### 방법 2: 로컬에서 스크립트 실행

1. Railway에서 DATABASE_URL 복사
2. 로컬 환경변수 설정:
   ```bash
   cd backend
   cp .env.example .env
   # .env 파일에 DATABASE_URL 입력
   ```

3. 데이터베이스 초기화 실행:
   ```bash
   npm run db:setup
   ```

### 방법 3: psql 직접 사용

```bash
# PostgreSQL 클라이언트 설치 필요
psql $DATABASE_URL < migrations/master-schema.sql
```

## 초기화 확인

다음 쿼리로 테이블 생성 확인:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

예상 결과:
- art_profiles
- artists
- artworks
- collection_items
- exhibitions
- global_venues
- perception_exchange_sessions
- perception_messages
- personality_types
- quiz_answers
- quiz_questions
- quiz_results
- user_achievements
- user_collections
- user_follows
- user_points
- user_profiles
- user_quiz_responses
- users

## 트러블슈팅

### SSL 연결 오류
환경변수에 추가:
```
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

### 권한 오류
Railway PostgreSQL은 전체 권한을 가지므로 권한 오류는 발생하지 않아야 합니다.

### 테이블이 이미 존재함
`master-schema.sql`은 `IF NOT EXISTS`를 사용하므로 재실행해도 안전합니다.