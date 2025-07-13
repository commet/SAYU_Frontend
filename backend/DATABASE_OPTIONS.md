# 데이터베이스 옵션

## 현재 상황
제공하신 Supabase URL이 연결되지 않습니다:
- `db.dvbsopkjedkrjvhmwdpn.supabase.co`

## 해결 방법

### 1. Supabase 대시보드에서 정확한 URL 확인
1. [Supabase](https://app.supabase.com) 로그인
2. 프로젝트 선택
3. **Settings** → **Database**
4. **Connection string** 섹션에서 **URI** 복사
   - 대괄호 `[]`는 제거하고 실제 비밀번호만 사용

### 2. Railway PostgreSQL 사용 (대안)
Railway를 사용 중이시라면:
```bash
# Railway CLI로 DATABASE_URL 가져오기
railway link
railway variables | grep DATABASE_URL
```

### 3. 로컬 PostgreSQL 사용 (개발용)
```bash
# PostgreSQL 설치 (Windows WSL)
sudo apt update
sudo apt install postgresql postgresql-contrib

# 데이터베이스 생성
sudo -u postgres createdb sayu_db
sudo -u postgres psql -c "CREATE USER sayu_user WITH PASSWORD 'password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sayu_db TO sayu_user;"

# .env 업데이트
DATABASE_URL=postgresql://sayu_user:password@localhost:5432/sayu_db
```

### 4. 무료 PostgreSQL 서비스
- [Neon](https://neon.tech) - 무료 3GB
- [Aiven](https://aiven.io) - 1개월 무료
- [ElephantSQL](https://www.elephantsql.com) - 무료 20MB

## 백엔드 실행 (데이터베이스 없이)
임시로 데이터베이스 없이 실행하려면:

```javascript
// src/config/database.js 수정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/temp',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 연결 실패 시 경고만 표시
pool.on('error', (err) => {
  console.warn('Database connection error:', err);
});
```

어떤 방법으로 진행하시겠어요?