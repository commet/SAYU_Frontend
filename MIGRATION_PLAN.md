# 🚀 SAYU 마이그레이션 실행 계획

## 📅 일정 (총 2-3주)

### Week 1: Supabase 설정 및 데이터 마이그레이션
- [ ] Day 1-2: Supabase 프로젝트 생성 및 스키마 설정
- [ ] Day 3-4: 기존 데이터 마이그레이션
- [ ] Day 5-7: 인증 시스템 전환

### Week 2: API 마이그레이션
- [ ] Day 8-9: Vercel Edge Functions 구현
- [ ] Day 10-11: Frontend API 통합
- [ ] Day 12-14: 테스트 및 디버깅

### Week 3: Railway 최소화 및 최적화
- [ ] Day 15-16: Railway 크론 작업 분리
- [ ] Day 17-18: 성능 테스트
- [ ] Day 19-21: 프로덕션 배포

## 🔧 구현 체크리스트

### 1. Supabase 설정 ✅
```bash
# .env.local 업데이트
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. 패키지 설치
```bash
cd frontend
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr
```

### 3. 데이터 마이그레이션 스크립트
```javascript
// migrate-to-supabase.js
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const oldDb = new Pool({ connectionString: process.env.OLD_DATABASE_URL });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function migrateUsers() {
  const { rows: users } = await oldDb.query('SELECT * FROM users');
  
  for (const user of users) {
    // Supabase Auth에 사용자 생성
    const { data: authUser, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password_hash, // 또는 임시 비밀번호
      email_confirm: true
    });
    
    if (!error) {
      // profiles 테이블에 추가 정보 저장
      await supabase.from('profiles').insert({
        id: authUser.user.id,
        username: user.username,
        personality_type: user.personality_type,
        // ... 기타 필드
      });
    }
  }
}
```

### 4. API 엔드포인트 매핑

| 기존 (Express) | 새로운 위치 | 구현 방법 |
|---------------|------------|----------|
| `/api/auth/*` | Supabase Auth | 내장 기능 |
| `/api/quiz/analyze` | Vercel Edge | Edge Function |
| `/api/art-profile/generate` | Vercel Edge | Edge Function |
| `/api/artworks/*` | Supabase REST | PostgREST |
| `/api/recommendations` | Vercel Edge | Edge Function |
| 크론 작업 | Railway | 최소화된 서버 |

### 5. Frontend 코드 변경

#### 이전 (Axios + Express)
```javascript
const response = await axios.post('http://localhost:3001/api/auth/login', {
  email, password
});
```

#### 이후 (Supabase)
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
});
```

### 6. 환경 변수 재구성

#### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
REPLICATE_API_TOKEN=
OPENAI_API_KEY=
```

#### Railway (크론 작업용)
```
DATABASE_URL=
SENDGRID_API_KEY=
```

## 🚨 주의사항

1. **데이터 백업**: 마이그레이션 전 전체 백업 필수
2. **점진적 전환**: 한 번에 모든 것을 바꾸지 말고 단계별로
3. **롤백 계획**: 문제 발생 시 이전 버전으로 돌아갈 수 있도록
4. **모니터링**: 전환 과정에서 에러 모니터링 강화

## 📊 예상 결과

### 비용 절감
- Railway: $20-50 → $5-10
- 총 절감: 75%

### 성능 향상
- API 응답 시간: 200ms → 50ms (Edge 배포)
- 전 세계 latency 개선

### 개발 경험
- 인증 구현 시간: 1주 → 1일
- API 개발 시간: 50% 단축

## 🎯 성공 지표

- [ ] 모든 API 정상 작동
- [ ] 사용자 인증 정상 작동
- [ ] 크론 작업 정상 실행
- [ ] 응답 시간 50% 개선
- [ ] 월 비용 75% 절감

## 다음 단계

1. Supabase 프로젝트 생성
2. 환경 변수 설정
3. 스키마 마이그레이션 실행
4. 간단한 API부터 점진적 전환 시작