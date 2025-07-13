# Supabase 연결 가이드

## Supabase 대시보드에서 정확한 연결 정보 찾기

### 1. Supabase 대시보드 접속
1. [https://app.supabase.com](https://app.supabase.com) 로그인
2. 프로젝트 선택 (dvbsopkjedkrjvhmwdpn)

### 2. 연결 정보 확인 위치

#### 방법 A: Settings → Database
1. 좌측 메뉴에서 **Settings** 클릭
2. **Database** 탭 선택
3. **Connection string** 섹션 확인
4. **URI** 복사 (대괄호는 제외)

#### 방법 B: 프로젝트 홈에서
1. 프로젝트 홈 페이지
2. **Connect** 버튼 클릭
3. **Connection string** 탭
4. URI 복사

### 3. 연결 문자열 형식

Supabase는 여러 연결 형식을 제공합니다:

#### Direct connection (기본)
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### Connection pooling (Supavisor)
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

#### Transaction pooling
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### 4. 프로젝트 참조: dvbsopkjedkrjvhmwdpn

가능한 연결 URL들:
1. `postgresql://postgres:Daniel1024!@db.dvbsopkjedkrjvhmwdpn.supabase.co:5432/postgres`
2. `postgresql://postgres.dvbsopkjedkrjvhmwdpn:Daniel1024!@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres`
3. `postgresql://postgres.dvbsopkjedkrjvhmwdpn:Daniel1024!@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`

### 5. 연결 테스트

```bash
# 테스트 스크립트 실행
node test-art-profile.js

# 또는 psql로 직접 테스트
psql "YOUR_DATABASE_URL" -c "SELECT version();"
```

### 6. 문제 해결

**"Tenant or user not found" 오류**
- 사용자명 형식이 잘못됨
- 비밀번호가 틀림
- 프로젝트가 일시정지됨

**"could not translate host name" 오류**
- 호스트명이 잘못됨
- 네트워크 문제
- DNS 해석 실패

### 7. 대시보드 스크린샷 위치

```
Supabase Dashboard
├── Settings
│   └── Database
│       └── Connection string
│           ├── URI ← 여기!
│           ├── PSQL
│           └── .NET, JDBC, etc.
└── Project Home
    └── Connect button
        └── Connection string tab
```

정확한 DATABASE_URL을 대시보드에서 복사해주세요!