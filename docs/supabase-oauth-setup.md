# SAYU - Supabase OAuth 설정 가이드

## 개요
SAYU는 이제 Supabase Auth를 사용하여 소셜 로그인을 처리합니다. 
이 가이드는 Supabase 대시보드에서 Google, Apple, Instagram(Facebook), Kakao OAuth를 설정하는 방법을 안내합니다.

## 1. Supabase 대시보드 접속
1. https://app.supabase.com 으로 이동
2. SAYU 프로젝트 선택
3. 왼쪽 메뉴에서 **Authentication** → **Providers** 클릭

## 2. Google OAuth 설정

### Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **APIs & Services** → **Credentials** 이동
4. **Create Credentials** → **OAuth client ID** 클릭
5. Application type: **Web application** 선택
6. Name: "SAYU Web App" (원하는 이름)
7. Authorized redirect URIs에 추가:
   ```
   https://hgltvdshuyfffskvjmst.supabase.co/auth/v1/callback
   ```
8. **Create** 클릭
9. Client ID와 Client Secret 복사

### Supabase 설정
1. Supabase 대시보드의 **Google** provider 찾기
2. **Enable Google** 토글 ON
3. Google Cloud Console에서 복사한 정보 입력:
   - Client ID
   - Client Secret
4. **Save** 클릭

## 3. Apple OAuth 설정

### Apple Developer 설정
1. [Apple Developer](https://developer.apple.com/) 접속
2. **Certificates, Identifiers & Profiles** 이동
3. **Identifiers** → **App IDs** → **+** 클릭
4. App ID 생성:
   - Platform: iOS
   - Description: SAYU
   - Bundle ID: com.sayu.app
   - Capabilities에서 **Sign In with Apple** 체크
5. **Services IDs** → **+** 클릭
6. Services ID 생성:
   - Description: SAYU Web Service
   - Identifier: com.sayu.web
7. **Sign In with Apple** 설정:
   - Primary App ID: 위에서 만든 App ID 선택
   - Website URLs에 추가:
     - Domain: `hgltvdshuyfffskvjmst.supabase.co`
     - Return URL: `https://hgltvdshuyfffskvjmst.supabase.co/auth/v1/callback`
8. **Keys** → **+** 클릭
9. Key 생성:
   - Key Name: SAYU Auth Key
   - **Sign In with Apple** 체크
10. Key 파일(.p8) 다운로드 및 Key ID 저장

### Supabase 설정
1. Supabase 대시보드의 **Apple** provider 찾기
2. **Enable Apple** 토글 ON
3. 다음 정보 입력:
   - Service ID: `com.sayu.web`
   - Team ID: Apple Developer 계정의 Team ID
   - Key ID: 위에서 생성한 Key ID
   - Private Key: .p8 파일의 내용 전체 복사하여 붙여넣기
4. **Save** 클릭

## 4. Kakao OAuth 설정

### Kakao Developers 설정
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. **내 애플리케이션** → **애플리케이션 추가하기**
3. 앱 정보 입력:
   - 앱 이름: SAYU
   - 회사명: (선택사항)
4. 생성된 앱 클릭 → **앱 설정** → **플랫폼**
5. **Web 플랫폼 등록**:
   - 사이트 도메인: `https://hgltvdshuyfffskvjmst.supabase.co`
6. **카카오 로그인** → **활성화 설정** ON
7. **Redirect URI** 등록:
   ```
   https://hgltvdshuyfffskvjmst.supabase.co/auth/v1/callback
   ```
8. **보안** 탭에서 Client Secret 생성
9. **앱 키** 탭에서 REST API 키 확인

### Supabase 설정
1. Supabase 대시보드의 **Kakao** provider 찾기
2. **Enable Kakao** 토글 ON
3. 다음 정보 입력:
   - Client ID: Kakao의 **REST API 키**
   - Client Secret: Kakao에서 생성한 **Client Secret**
4. **Save** 클릭

## 5. Instagram (Facebook) OAuth 설정

Instagram은 Facebook 앱을 통해 설정해야 합니다.

### Facebook Developers 설정
1. [Facebook Developers](https://developers.facebook.com/) 접속
2. **내 앱** → **앱 만들기**
3. 앱 유형: **비즈니스** 선택
4. 앱 이름: SAYU
5. 앱 생성 후 **제품 추가** → **Instagram Basic Display** 선택
6. **Instagram Basic Display** 설정:
   - **Create New App** 클릭
   - Display Name: SAYU Instagram
   - Valid OAuth Redirect URIs:
     ```
     https://hgltvdshuyfffskvjmst.supabase.co/auth/v1/callback
     ```
   - Deauthorize Callback URL: (같은 URL)
   - Data Deletion Request URL: (같은 URL)
7. **Instagram App ID**와 **Instagram App Secret** 복사

### Supabase 설정
1. Supabase 대시보드의 **Facebook** provider 찾기 (Instagram은 Facebook을 통해 처리)
2. **Enable Facebook** 토글 ON
3. 다음 정보 입력:
   - Facebook Client ID: Instagram App ID
   - Facebook Client Secret: Instagram App Secret
4. **Save** 클릭

## 6. 프로덕션 체크리스트

### 도메인 설정
프로덕션 환경에서는 모든 Redirect URI를 실제 도메인으로 변경해야 합니다:
- 개발: `http://localhost:3000/auth/callback`
- 프로덕션: `https://sayu.art/auth/callback`

### 각 Provider별 추가 설정
- **Google**: OAuth 동의 화면 구성 완료
- **Apple**: 
  - App Store에 앱 출시 시 Sign In with Apple 필수
  - 도메인 검증 필요
- **Kakao**: 
  - 비즈니스 앱 신청 (사용자 수 제한 해제)
  - 개인정보 처리방침 URL 등록
- **Facebook/Instagram**: 
  - 앱 검토 제출 (공개 액세스)
  - 비즈니스 인증

## 7. 테스트 방법

1. 프론트엔드에서 소셜 로그인 버튼 클릭
2. 각 Provider의 로그인 페이지로 리다이렉트 확인
3. 로그인 성공 후 `/dashboard`로 리다이렉트 확인
4. Supabase 대시보드 **Authentication** → **Users**에서 사용자 생성 확인

## 8. 트러블슈팅

### "Provider not enabled" 에러
- Supabase 대시보드에서 해당 Provider가 활성화되어 있는지 확인
- Client ID/Secret이 올바르게 입력되었는지 확인

### 리다이렉트 실패
- Redirect URI가 정확히 일치하는지 확인 (trailing slash 포함)
- Provider 설정에서 URI가 승인되었는지 확인

### 로그인 후 세션 없음
- `app/auth/callback/route.ts` 파일이 존재하는지 확인
- Supabase URL과 Anon Key가 올바른지 확인

## 9. 보안 권장사항

1. **환경 변수 관리**
   - Supabase URL과 Anon Key는 공개되어도 안전
   - Service Role Key는 절대 클라이언트에 노출하지 말 것

2. **Row Level Security (RLS)**
   - 모든 테이블에 RLS 정책 설정
   - 인증된 사용자만 자신의 데이터에 접근하도록 제한

3. **Rate Limiting**
   - Supabase 대시보드에서 Auth Rate Limits 설정
   - 브루트 포스 공격 방지

## 10. 다음 단계

1. 사용자 프로필 테이블 생성
2. 로그인 후 온보딩 플로우 구현
3. 소셜 로그인 사용자의 추가 정보 수집
4. 사용자별 권한 관리 시스템 구축