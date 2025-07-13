# 🚀 Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://app.supabase.com) 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `sayu-production`
   - Database Password: 강력한 비밀번호 생성
   - Region: `Northeast Asia (Seoul)`
   - Pricing Plan: Free tier

## 2. 프로젝트 설정 복사

프로젝트가 생성되면 다음 정보를 복사:

```bash
# Supabase 대시보드 > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# Settings > Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

## 3. 데이터베이스 마이그레이션

### SQL Editor에서 실행할 스키마:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for text search

-- Users 테이블 (Supabase Auth와 연동)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    personality_type VARCHAR(10),
    is_premium BOOLEAN DEFAULT false,
    profile_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles 정책
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Art Profiles
CREATE TABLE art_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    original_image TEXT NOT NULL,
    transformed_image TEXT NOT NULL,
    style_id VARCHAR(50) NOT NULL,
    settings JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Art Profiles RLS
ALTER TABLE art_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public art profiles are viewable" 
ON art_profiles FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create own art profiles" 
ON art_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own art profiles" 
ON art_profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own art profiles" 
ON art_profiles FOR DELETE 
USING (auth.uid() = user_id);

-- Quiz Results
CREATE TABLE quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    quiz_type VARCHAR(50) NOT NULL,
    personality_type VARCHAR(10),
    scores JSONB NOT NULL,
    analysis JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Results RLS
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz results" 
ON quiz_results FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quiz results" 
ON quiz_results FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Follows (소셜 기능)
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Follows RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows" 
ON follows FOR SELECT 
USING (true);

CREATE POLICY "Users can create follows" 
ON follows FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows" 
ON follows FOR DELETE 
USING (auth.uid() = follower_id);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## 4. Storage 버킷 생성

1. Storage 탭으로 이동
2. 다음 버킷 생성:
   - `profile-images` (공개)
   - `art-profiles` (공개)
   - `user-uploads` (비공개)

### Storage 정책:

```sql
-- Profile Images 버킷
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload own profile image"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Art Profiles 버킷
CREATE POLICY "Anyone can view art profiles"
ON storage.objects FOR SELECT
USING (bucket_id = 'art-profiles');

CREATE POLICY "Users can upload art profiles"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'art-profiles' AND
    auth.uid() IS NOT NULL
);
```

## 5. Edge Functions 설정

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 링크
supabase link --project-ref [your-project-ref]

# Edge Function 생성
supabase functions new art-profile-generate
```

## 6. 환경 변수 설정

### Frontend (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

### Edge Functions (환경 변수)
```bash
REPLICATE_API_TOKEN=your-replicate-api-token
OPENAI_API_KEY=sk-xxxxx
```

## 7. 인증 설정

1. Authentication > Providers
2. 활성화할 제공자:
   - Email (기본)
   - Google
   - GitHub

## 완료 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] 환경 변수 복사
- [ ] 데이터베이스 스키마 실행
- [ ] RLS 정책 설정
- [ ] Storage 버킷 생성
- [ ] Edge Functions 준비
- [ ] 인증 제공자 설정