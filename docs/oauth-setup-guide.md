# SAYU OAuth 설정 가이드

## 현재 상황

현재 SAYU 프로젝트는 인증 시스템으로 **NextAuth.js**를 사용하고 있으며, Supabase는 데이터베이스로만 활용되고 있습니다.

### 문제점
1. **Supabase Auth Providers**: Email만 활성화되어 있음
2. **NextAuth 설정**: Google, Apple, GitHub, Discord는 코드에 있지만 환경 변수 미설정
3. **프론트엔드 UI**: Google, Instagram, Kakao 로그인 버튼 표시
4. **불일치**: Kakao는 NextAuth에 미구현, Instagram은 커스텀 구현

## 두 가지 선택지

### 옵션 1: Supabase Auth 사용 (권장)
Supabase의 내장 Auth 시스템을 사용하면 더 간단하고 안정적입니다.

**장점:**
- Supabase 대시보드에서 직접 OAuth 설정 가능
- RLS (Row Level Security) 정책과 자연스럽게 통합
- 세션 관리 자동화

**설정 방법:**
1. Supabase 대시보드 → Authentication → Providers
2. 각 Provider 활성화:
   - **Google**: Client ID, Client Secret 입력
   - **Apple**: Services ID, Team ID, Key ID, Private Key 입력
   - **Kakao**: REST API Key, Client Secret 입력

### 옵션 2: NextAuth 계속 사용 (현재 구조)
현재 구현된 NextAuth를 계속 사용하는 방법입니다.

**필요한 환경 변수 (.env.local):**
```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple OAuth
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret

# Kakao OAuth (추가 필요)
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

# Instagram OAuth (커스텀)
NEXT_PUBLIC_INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
```

## 각 Provider 설정 방법

### Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. APIs & Services → Credentials
4. Create Credentials → OAuth client ID
5. Application type: Web application
6. Authorized redirect URIs:
   - NextAuth: `http://localhost:3000/api/auth/callback/google`
   - Supabase: `https://[PROJECT_ID].supabase.co/auth/v1/callback`

### Apple OAuth
1. [Apple Developer](https://developer.apple.com/) 접속
2. Certificates, Identifiers & Profiles
3. Identifiers → App IDs 생성
4. Services → Sign In with Apple 활성화
5. Keys → Create a Key → Sign In with Apple 선택
6. Services ID 생성 및 설정

### Kakao OAuth
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. 앱 설정 → 플랫폼 → Web 플랫폼 등록
4. 카카오 로그인 → 활성화
5. Redirect URI:
   - NextAuth: `http://localhost:3000/api/auth/callback/kakao`
   - Supabase: `https://[PROJECT_ID].supabase.co/auth/v1/callback`

### Instagram OAuth
Instagram은 Facebook 앱을 통해 설정해야 합니다.

1. [Facebook Developers](https://developers.facebook.com/) 접속
2. 앱 생성 → 비즈니스 선택
3. Instagram Basic Display 추가
4. Instagram App ID, Instagram App Secret 획득
5. Valid OAuth Redirect URIs 설정

## 권장 구현 방안

### 1단계: Supabase Auth로 마이그레이션
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 소셜 로그인 함수
export async function signInWithProvider(provider: 'google' | 'apple' | 'kakao') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  
  if (error) throw error
  return data
}
```

### 2단계: Kakao Provider 추가 (NextAuth 사용 시)
```typescript
// lib/auth.ts에 추가
import KakaoProvider from 'next-auth/providers/kakao';

if (process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET) {
  providers.push(
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
    })
  );
}
```

### 3단계: UI 수정
Apple 로그인 버튼을 추가하거나, 현재 UI에 맞게 provider를 조정해야 합니다.

## 다음 단계

1. **결정 필요**: Supabase Auth vs NextAuth
2. **OAuth 앱 생성**: 각 플랫폼에서 OAuth 앱 생성
3. **환경 변수 설정**: 필요한 Client ID/Secret 설정
4. **테스트**: 각 소셜 로그인 테스트

## 주의사항

- Production 환경에서는 반드시 HTTPS 사용
- Redirect URI는 정확히 일치해야 함
- Client Secret은 절대 클라이언트 코드에 노출되면 안 됨
- Apple 로그인은 iOS 앱 심사 시 필수