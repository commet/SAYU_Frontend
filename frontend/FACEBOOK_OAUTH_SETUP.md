# Facebook/Instagram OAuth 설정 가이드

## 1. Supabase Dashboard 설정

### Facebook Provider 활성화
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. Authentication → Providers → Facebook 선택
3. **Enable Facebook** 토글 ON
4. 다음 정보 입력:
   - **Facebook App ID**: (Facebook 개발자 콘솔에서 확인)
   - **Facebook App Secret**: (Facebook 개발자 콘솔에서 확인)

### Redirect URL 확인
Supabase에서 제공하는 Callback URL 복사:
```
https://hgltvdshuyfffskvjmst.supabase.co/auth/v1/callback
```

## 2. Facebook 개발자 콘솔 설정

### Facebook App 설정
1. [Facebook Developers](https://developers.facebook.com) 접속
2. 앱 선택 → 설정 → 기본 설정
3. **앱 도메인**에 추가:
   - `sayu.my`
   - `www.sayu.my`
   - `hgltvdshuyfffskvjmst.supabase.co`

### Facebook Login 설정
1. 제품 → Facebook 로그인 → 설정
2. **유효한 OAuth 리디렉션 URI**에 추가:
   ```
   https://hgltvdshuyfffskvjmst.supabase.co/auth/v1/callback
   https://sayu.my/auth/callback
   https://www.sayu.my/auth/callback
   ```
3. **웹 OAuth 로그인** 활성화
4. **JWT를 사용한 웹 OAuth 로그인** 활성화

### 권한 설정
1. 앱 검수 → 권한 및 기능
2. 다음 권한 요청:
   - `email` (필수)
   - `public_profile` (필수)

### 앱 모드
1. 앱이 **라이브 모드**인지 확인
2. 개발 모드인 경우: 앱 검수 → 기본 설정 → 앱 모드를 "라이브"로 전환

## 3. 디버깅 체크리스트

### 에러: "Invalid OAuth redirect URI"
- Facebook 앱의 OAuth 리디렉션 URI 확인
- Supabase callback URL이 정확히 등록되어 있는지 확인

### 에러: "App not set up"
- Facebook 앱이 라이브 모드인지 확인
- 앱 도메인이 올바르게 설정되어 있는지 확인

### 에러: "Code exchange failed"
- Facebook App Secret이 Supabase에 올바르게 입력되어 있는지 확인
- Supabase Dashboard에서 Facebook Provider가 활성화되어 있는지 확인

## 4. 테스트 방법

1. 브라우저 개발자 도구 콘솔 열기
2. 인스타그램/Facebook 로그인 클릭
3. 콘솔에서 다음 확인:
   - "Found OAuth code:" 메시지
   - "Exchange error details:" 에러 메시지 (있는 경우)
   - "Session created from code exchange!" 성공 메시지

## 5. 일반적인 문제 해결

### 모바일에서만 실패하는 경우
- Facebook 앱의 플랫폼 설정에서 "웹사이트" 플랫폼 추가
- 사이트 URL: `https://sayu.my`

### 특정 사용자만 로그인 실패
- Facebook 앱이 개발 모드인 경우, 테스터로 추가된 사용자만 로그인 가능
- 앱 역할 → 테스터 추가 또는 앱을 라이브 모드로 전환

### CORS 에러
- Supabase Dashboard → Settings → API → CORS Allowed Origins에 추가:
  - `https://sayu.my`
  - `https://www.sayu.my`