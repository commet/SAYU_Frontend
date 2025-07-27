# SAYU Supabase 완전 마이그레이션 가이드

## 🎯 목표
Railway + Supabase 하이브리드 → Supabase 단독 아키텍처로 전환

## 📋 사전 준비사항

### 1. Supabase 프로젝트 확인
- URL: `https://hgltvdshuyfffskvjmst.supabase.co`
- 대시보드 접속 및 권한 확인
- 프로젝트 설정 확인

### 2. 필요한 도구
```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 연결
supabase link --project-ref hgltvdshuyfffskvjmst
```

## 🚀 마이그레이션 단계

### Phase 1: 데이터베이스 스키마 생성 (2시간)

#### 1.1 Extensions 활성화
```sql
-- Supabase SQL Editor에서 실행
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

#### 1.2 스키마 마이그레이션
```bash
# 로컬에서 실행
cd supabase
supabase db push
```

또는 Supabase Dashboard > SQL Editor에서 직접 실행:
- `/supabase/migrations/001_complete_schema.sql` 내용 복사하여 실행

#### 1.3 확인사항
- [ ] 모든 테이블 생성 확인
- [ ] RLS 정책 적용 확인
- [ ] 인덱스 생성 확인
- [ ] 트리거 작동 확인

### Phase 2: 백엔드 코드 리팩토링 (3시간)

#### 2.1 Supabase 클라이언트 설정
```javascript
// backend/src/config/supabase-client.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Public client (브라우저에서 사용)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (서버에서 사용)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = { supabase, supabaseAdmin };
```

#### 2.2 Database 레이어 교체
```javascript
// backend/src/services/database.service.js
const { supabaseAdmin } = require('../config/supabase-client');

class DatabaseService {
  async query(table, operation, params = {}) {
    let query = supabaseAdmin.from(table);
    
    switch (operation) {
      case 'select':
        // 구현...
        break;
      case 'insert':
        // 구현...
        break;
      // ... 기타 operations
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}
```

#### 2.3 인증 시스템 전환
```javascript
// backend/src/middleware/auth.js
const { supabaseAdmin } = require('../config/supabase-client');

const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error) throw error;
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Phase 3: API 엔드포인트 마이그레이션 (2시간)

#### 3.1 Express → Vercel Functions
```javascript
// frontend/pages/api/quiz/start.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { userId, language } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: userId,
        session_id: generateSessionId(),
        language: language || 'ko',
        status: 'in_progress'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

#### 3.2 주요 API 변환 목록
- [ ] `/api/auth/*` → Supabase Auth
- [ ] `/api/quiz/*` → Vercel Functions
- [ ] `/api/exhibitions/*` → Vercel Functions
- [ ] `/api/art-profile/*` → Vercel Functions
- [ ] `/api/perception-exchange/*` → Vercel Functions

### Phase 4: 프론트엔드 통합 (2시간)

#### 4.1 Supabase 클라이언트 설정
```typescript
// frontend/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

#### 4.2 인증 Hook
```typescript
// frontend/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
```

#### 4.3 실시간 기능
```typescript
// frontend/hooks/useRealtimeExhibition.ts
export function useRealtimeExhibition(exhibitionId: string) {
  const [likes, setLikes] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`exhibition:${exhibitionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exhibition_likes',
          filter: `exhibition_id=eq.${exhibitionId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLikes(prev => prev + 1);
          } else if (payload.eventType === 'DELETE') {
            setLikes(prev => prev - 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [exhibitionId]);

  return likes;
}
```

### Phase 5: 데이터 마이그레이션 (3시간)

#### 5.1 백업
```bash
# Railway 데이터 백업
pg_dump $RAILWAY_DATABASE_URL > railway_backup.sql
```

#### 5.2 데이터 전송 스크립트
```javascript
// scripts/migrate-data.js
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const railwayPool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function migrateTable(tableName) {
  console.log(`Migrating ${tableName}...`);
  
  // Railway에서 데이터 가져오기
  const { rows } = await railwayPool.query(`SELECT * FROM ${tableName}`);
  
  // Supabase로 삽입 (배치 처리)
  const batchSize = 1000;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(tableName).insert(batch);
    
    if (error) {
      console.error(`Error migrating ${tableName}:`, error);
      throw error;
    }
    
    console.log(`Migrated ${i + batch.length}/${rows.length} rows`);
  }
}

// 순서대로 마이그레이션
async function migrate() {
  const tables = [
    'users',
    'quiz_sessions',
    'quiz_answers',
    'quiz_results',
    'artworks',
    'exhibitions',
    // ... 나머지 테이블
  ];
  
  for (const table of tables) {
    await migrateTable(table);
  }
}
```

### Phase 6: 환경 변수 업데이트

#### 6.1 Backend (.env)
```env
# Supabase
SUPABASE_URL=https://hgltvdshuyfffskvjmst.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Remove Railway 관련 변수들
# DATABASE_URL=... (제거)
# REDIS_URL=... (제거)
```

#### 6.2 Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://hgltvdshuyfffskvjmst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API는 Vercel Functions로 처리
# NEXT_PUBLIC_API_URL 제거
```

### Phase 7: 배포 및 전환

#### 7.1 Vercel 배포
```bash
# Frontend 배포
cd frontend
vercel --prod
```

#### 7.2 DNS 및 환경 설정
- Vercel Dashboard에서 환경 변수 설정
- Custom domain 설정

#### 7.3 트래픽 전환
1. 새 시스템 테스트 (10% 트래픽)
2. 점진적 트래픽 증가 (25% → 50% → 100%)
3. 모니터링 및 롤백 준비

## 🔍 테스트 체크리스트

### 기능 테스트
- [ ] 회원가입/로그인
- [ ] APT 테스트 진행
- [ ] AI 아트 프로필 생성
- [ ] 전시 정보 조회
- [ ] 좋아요/팔로우 기능
- [ ] 감상 교환 시스템
- [ ] 실시간 업데이트

### 성능 테스트
- [ ] 페이지 로딩 시간
- [ ] API 응답 시간
- [ ] 동시 사용자 처리
- [ ] 벡터 검색 성능

### 보안 테스트
- [ ] RLS 정책 작동
- [ ] 인증 토큰 검증
- [ ] API 권한 체크

## 🚨 롤백 계획

### 즉시 롤백 조건
- 인증 시스템 장애
- 데이터 손실 발생
- 성능 50% 이상 저하

### 롤백 절차
1. Vercel 이전 배포로 복원
2. 환경 변수를 Railway로 복원
3. DNS를 이전 설정으로 변경

## 📊 예상 결과

### 비용 절감
- Railway: 월 $40-50 → $0
- Supabase: Free tier 또는 $25/월
- 총 절감: 50-100%

### 성능 개선
- API 레이턴시: -40%
- 전역 CDN 활용
- 자동 스케일링

### 개발 효율성
- 통합 관리 콘솔
- 실시간 기능 내장
- 자동 백업/복원

## 📝 주의사항

1. **데이터 백업**: 마이그레이션 전 반드시 전체 백업
2. **점진적 전환**: 한 번에 모든 것을 바꾸지 말 것
3. **모니터링**: Sentry, Vercel Analytics 활용
4. **사용자 공지**: 점검 시간 사전 안내

## 🎯 다음 단계

1. Supabase 프로젝트 설정 확인
2. 개발 환경에서 테스트
3. 스테이징 환경 구축
4. 프로덕션 마이그레이션
5. Railway 서비스 종료