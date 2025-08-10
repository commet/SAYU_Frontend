# Instagram (Facebook) OAuth 설정 확인 가이드

## 1. Supabase Dashboard 확인사항

### Authentication > Providers > Facebook
1. **Facebook이 활성화되어 있는지 확인**
2. **App ID와 App Secret이 올바르게 입력되어 있는지 확인**
3. **Redirect URL 확인**:
   - Supabase에서 제공하는 callback URL을 복사
   - 보통: `https://[PROJECT_ID].supabase.co/auth/v1/callback`

## 2. Facebook App 설정 확인

Facebook Developers (https://developers.facebook.com) 에서:

### 기본 설정
1. **앱 ID** 확인
2. **앱 시크릿** 확인  
3. **앱 상태**: 개발 모드인지 라이브 모드인지 확인
   - 개발 모드면 테스트 사용자만 로그인 가능

### Facebook 로그인 설정
1. **제품** > **Facebook 로그인** > **설정**
2. **유효한 OAuth 리디렉션 URI**에 다음 추가:
   ```
   https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/auth/v1/callback
   http://localhost:3000/api/auth/callback (개발용)
   ```
3. **클라이언트 OAuth 설정**:
   - "클라이언트 OAuth 로그인" 활성화
   - "웹 OAuth 로그인" 활성화
   - "OAuth 리디렉션 적용" 활성화

### 앱 권한
1. **앱 검수** > **권한 및 기능**
2. 필요한 권한:
   - email (기본)
   - public_profile (기본)

## 3. 현재 문제 진단

### 증상
- OAuth code는 정상적으로 받아옴
- `exchangeCodeForSession()` 에서 timeout 발생
- 세션이 생성되지 않음

### 가능한 원인
1. **Facebook App Secret이 잘못됨**
2. **Redirect URI 불일치**
3. **Facebook 앱이 개발 모드**
4. **Supabase 프로젝트의 Site URL 설정 문제**

## 4. 디버깅 단계

### Step 1: Supabase 로그 확인
Supabase Dashboard > Logs > Auth 에서 에러 로그 확인

### Step 2: Facebook App 테스트
Facebook Developers > 앱 > 역할 > 테스트 사용자 추가 후 테스트

### Step 3: Network 탭 확인
브라우저 개발자 도구 > Network 탭에서:
1. `/auth/v1/authorize` 요청 확인
2. `/auth/v1/callback` 요청 확인
3. 에러 응답 확인

## 5. 임시 해결책

Instagram OAuth가 작동하지 않을 경우:
1. **Google OAuth 사용** (가장 안정적)
2. **Discord OAuth 사용** (게이머 친화적)
3. **이메일/비밀번호 인증 추가**

## 6. 확인 필요 사항

터미널에서 실행:
```bash
# Supabase 환경변수 확인
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 7. 서버 로그 확인

서버를 재시작하고 Instagram 로그인을 시도한 후, 터미널 로그 확인:
```
=== AUTH CALLBACK ROUTE HANDLER ===
Callback params: ...
Exchange Error Details: ...
```

이 정보를 확인하면 정확한 문제를 파악할 수 있습니다.