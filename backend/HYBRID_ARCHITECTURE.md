# 하이브리드 데이터베이스 아키텍처

## 개요
SAYU 백엔드는 Railway PostgreSQL과 Supabase를 동시에 사용하는 하이브리드 아키텍처를 지원합니다. 이를 통해 점진적으로 Supabase로 마이그레이션할 수 있습니다.

## 아키텍처 구성

### 1. Railway PostgreSQL (기존)
- 현재 모든 데이터가 저장된 메인 데이터베이스
- 직접적인 연결과 쿼리 지원
- 기존 서비스와 완벽한 호환성

### 2. Supabase (신규)
- 점진적으로 마이그레이션될 새로운 데이터베이스
- Auth, Storage, Realtime 기능 제공
- 더 나은 확장성과 관리 기능

## 구현 내용

### 1. 하이브리드 데이터베이스 클래스
```javascript
// src/config/hybridDatabase.js
class HybridDatabase {
  constructor() {
    this.railway = pool;
    this.supabase = getSupabaseClient();
    this.admin = getSupabaseAdmin();
    
    // 서비스별 데이터베이스 매핑
    this.serviceMapping = {
      gamification: 'railway',
      artProfiles: 'railway',
      // 추후 supabase로 변경
    };
  }
}
```

### 2. 통합 쿼리 인터페이스
```javascript
async query(text, params, options = {}) {
  const db = this.getDatabase(options.service);
  
  if (db === 'supabase') {
    return this.supabaseQuery(text, params, options);
  }
  
  return this.railway.query(text, params);
}
```

### 3. 트랜잭션 지원
```javascript
async transaction(fn, options = {}) {
  const db = this.getDatabase(options.service);
  
  if (db === 'supabase') {
    return this.supabaseTransaction(fn);
  }
  
  return this.railwayTransaction(fn);
}
```

## 마이그레이션 전략

### Phase 1: 하이브리드 설정 (현재)
- [x] Supabase 클라이언트 설정
- [x] 하이브리드 데이터베이스 클래스 구현
- [x] 미들웨어 통합
- [x] 환경 변수 설정

### Phase 2: 서비스별 마이그레이션
- [ ] Gamification 서비스 마이그레이션
- [ ] Art Profile 서비스 마이그레이션
- [ ] User Profile 서비스 마이그레이션
- [ ] Follow 시스템 마이그레이션

### Phase 3: 완전 이전
- [ ] Railway 데이터베이스 비활성화
- [ ] Supabase로 완전 이전
- [ ] 레거시 코드 정리

## 환경 변수 설정

```env
# Railway Database
DATABASE_URL=postgresql://...

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Hybrid Settings
ENABLE_SUPABASE=true
MIGRATE_TO_SUPABASE=false
SUPABASE_SERVICES=gamification,artProfiles
```

## 사용 방법

### 1. 기본 사용
```javascript
// 미들웨어가 자동으로 req.hybridDB 제공
app.get('/api/users/:id', async (req, res) => {
  const result = await req.hybridDB.query(
    'SELECT * FROM users WHERE id = $1',
    [req.params.id]
  );
  res.json(result.rows[0]);
});
```

### 2. 서비스 지정
```javascript
// 특정 서비스를 Supabase로 강제
const result = await req.hybridDB.query(
  'SELECT * FROM gamification WHERE user_id = $1',
  [userId],
  { service: 'gamification', forceSupabase: true }
);
```

### 3. 트랜잭션
```javascript
const result = await req.hybridDB.transaction(async (trx) => {
  await trx.query('INSERT INTO ...');
  await trx.query('UPDATE ...');
  return { success: true };
});
```

## 모니터링

### 1. 데이터베이스 상태 확인
```javascript
const status = await req.hybridDB.getStatus();
// {
//   railway: { connected: true, latency: 5 },
//   supabase: { connected: true, latency: 12 }
// }
```

### 2. 마이그레이션 진행 상황
```javascript
const progress = await req.hybridDB.getMigrationProgress();
// {
//   gamification: { migrated: false, records: 1000 },
//   artProfiles: { migrated: true, records: 500 }
// }
```

## 주의사항

1. **데이터 일관성**: 마이그레이션 중 데이터 일관성 유지
2. **성능**: 하이브리드 모드에서는 약간의 오버헤드 발생
3. **트랜잭션**: 크로스 데이터베이스 트랜잭션은 지원하지 않음
4. **캐싱**: Redis 캐시 무효화 전략 필요

## 문제 해결

### Supabase 연결 실패
```bash
# 환경 변수 확인
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# 연결 테스트
node scripts/test-supabase-connection.js
```

### 마이그레이션 롤백
```bash
# 특정 서비스를 Railway로 롤백
SUPABASE_SERVICES=artProfiles npm run server
```

## 다음 단계

1. Supabase 프로젝트 생성
2. 환경 변수 설정
3. 스키마 마이그레이션 실행
4. 서비스별 점진적 마이그레이션
5. 모니터링 및 성능 최적화