# Supabase 설정 단계별 가이드

## 1. 환경 변수 설정

backend 폴더에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# 기존 설정은 그대로 유지하고 아래 내용 추가

# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# Hybrid Database Settings
ENABLE_SUPABASE=false  # 테스트 후 true로 변경
MIGRATE_TO_SUPABASE=false
SUPABASE_SERVICES=  # 아직 비워두세요
```

## 2. Supabase 연결 테스트 스크립트

다음 테스트 스크립트를 실행하여 연결을 확인하세요:

```javascript
// backend/test-supabase-connection.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  console.log('🔍 Supabase 연결 테스트 시작...\n');
  
  // 환경 변수 확인
  console.log('1. 환경 변수 확인:');
  console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ 설정됨' : '❌ 없음');
  console.log('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ 설정됨' : '❌ 없음');
  console.log('   SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ 설정됨' : '❌ 없음');
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('\n❌ 필수 환경 변수가 설정되지 않았습니다!');
    return;
  }
  
  // Supabase 클라이언트 생성
  console.log('\n2. Supabase 클라이언트 생성 중...');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  // 연결 테스트
  console.log('\n3. 데이터베이스 연결 테스트:');
  try {
    const { data, error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      console.error('   ❌ 연결 실패:', error.message);
    } else {
      console.log('   ✅ Supabase 연결 성공!');
    }
  } catch (err) {
    console.error('   ❌ 연결 오류:', err.message);
  }
  
  // 서비스 키 테스트 (옵션)
  if (process.env.SUPABASE_SERVICE_KEY) {
    console.log('\n4. 서비스 키 테스트:');
    const adminClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    try {
      const { data, error } = await adminClient.auth.admin.listUsers();
      if (error) {
        console.error('   ❌ 서비스 키 인증 실패:', error.message);
      } else {
        console.log('   ✅ 서비스 키 인증 성공!');
      }
    } catch (err) {
      console.error('   ❌ 서비스 키 오류:', err.message);
    }
  }
  
  console.log('\n✨ 테스트 완료!');
}

testConnection();
```

## 3. 테스트 실행

```bash
cd backend
node test-supabase-connection.js
```

## 4. 스키마 마이그레이션

Supabase SQL Editor에서 실행:

1. Supabase 대시보드 → SQL Editor
2. "New query" 클릭
3. 다음 파일의 내용을 복사하여 붙여넣기:
   - `backend/migrations/supabase-initial-schema.sql`
4. "Run" 클릭

## 5. 하이브리드 모드 활성화

`.env` 파일 수정:

```bash
# Hybrid Database Settings
ENABLE_SUPABASE=true  # 활성화
MIGRATE_TO_SUPABASE=false
SUPABASE_SERVICES=  # 아직 비워두세요
```

## 6. 서버 재시작 및 테스트

```bash
# 서버 재시작
npm run dev

# 다른 터미널에서 API 테스트
curl http://localhost:3001/api/health
```

## 7. 단계별 마이그레이션

특정 서비스를 Supabase로 이전하려면:

```bash
# .env 파일에서
SUPABASE_SERVICES=gamification,artProfiles
```

## 문제 해결

### "Invalid API key" 오류
- API 키가 올바른지 확인
- 키 앞뒤 공백 제거

### "Connection refused" 오류
- SUPABASE_URL이 올바른지 확인
- 인터넷 연결 확인

### "Table not found" 오류
- 스키마 마이그레이션 실행 여부 확인
- SQL Editor에서 테이블 생성 확인

## 다음 단계

1. ✅ Supabase 프로젝트 생성
2. ✅ 환경 변수 설정
3. ✅ 연결 테스트
4. ⏳ 스키마 마이그레이션
5. ⏳ 하이브리드 모드 테스트
6. ⏳ 서비스별 점진적 마이그레이션