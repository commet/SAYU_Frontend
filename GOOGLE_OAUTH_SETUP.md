# Google OAuth Setup Guide for SAYU

## Prerequisites
- Google account
- Access to Google Cloud Console (https://console.cloud.google.com)

## Step-by-Step Setup

### 1. Create a Google Cloud Project
이미 프로젝트가 있다면 이 단계는 건너뛰세요.
1. Go to https://console.cloud.google.com
2. 상단의 프로젝트 드롭다운을 클릭 (현재 프로젝트 이름이 표시됨)
3. "새 프로젝트" 클릭 (필요한 경우)
4. 프로젝트 이름: "SAYU" 입력
5. "만들기" 클릭

### 2. OAuth 설정 (API 활성화는 선택사항)
Google OAuth 2.0은 기본적으로 활성화되어 있으므로 별도의 API 활성화가 필요하지 않을 수 있습니다.
바로 3단계로 진행하세요.

(선택사항) 사용자 정보를 더 자세히 가져오려면:
1. 왼쪽 메뉴에서 "API 및 서비스" → "라이브러리" 클릭
2. "People API" 검색
3. People API를 클릭하고 "사용" 버튼 클릭

### 3. OAuth Consent Screen 설정 (필수)
OAuth client ID를 만들기 전에 먼저 OAuth consent screen을 설정해야 합니다.

1. 왼쪽 메뉴에서 "OAuth consent screen" 클릭
2. User Type 선택:
   - "External" 선택 (일반 사용자용)
   - "CREATE" 클릭

3. App information 입력:
   - App name: SAYU
   - User support email: 본인 이메일
   - App logo: (선택사항)

4. App domain (선택사항 - 개발 중에는 비워둬도 됨):
   - Application home page
   - Application privacy policy link
   - Application terms of service link

5. Developer contact information:
   - 이메일 주소 입력

6. "SAVE AND CONTINUE" 클릭

7. Scopes 페이지:
   - "ADD OR REMOVE SCOPES" 클릭
   - 다음 scope들을 선택:
     - .../auth/userinfo.email
     - .../auth/userinfo.profile
   - "UPDATE" 클릭
   - "SAVE AND CONTINUE" 클릭

8. Test users (선택사항):
   - 개발 중에는 테스트 사용자 추가 가능
   - "SAVE AND CONTINUE" 클릭

9. Summary 확인 후 "BACK TO DASHBOARD" 클릭

### 4. Create OAuth 2.0 Client ID
이제 OAuth client ID를 만들 수 있습니다.

1. "Credentials" 메뉴로 이동
2. 상단의 "+ CREATE CREDENTIALS" 클릭 → "OAuth client ID" 선택
   - Choose "External" user type
   - Fill in application name: "SAYU"
   - Add your email as support email
   - Add authorized domains if you have a production domain
   - Save and continue through the scopes (you can leave default)
   - Add test users if needed

### 4. Create OAuth Client ID
1. After consent screen setup, go back to create OAuth client ID
2. Choose "Web application"
3. Name: "SAYU Web Client"
4. Add Authorized JavaScript origins:
   - http://localhost:3000 (for development)
   - http://localhost:3002 (your current frontend)
   - Your production domain (if applicable)
5. Add Authorized redirect URIs:
   - http://localhost:3001/api/auth/google/callback
   - Your production backend URL + /api/auth/google/callback

### 5. Update Environment Variables
Copy the generated credentials and update your backend `.env` file:

```env
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
```

### 6. Restart Backend Server
After updating the .env file, restart your backend server for changes to take effect.

## Testing
1. Make sure both frontend (port 3002) and backend (port 3001) are running
2. Try clicking "Continue with Google" on the login page
3. You should be redirected to Google's OAuth consent screen
4. After authorization, you'll be redirected back to your app

## Common Issues
- **Error 400: redirect_uri_mismatch**: Make sure the redirect URI in Google Console exactly matches your backend URL
- **Error 401**: Check that your client ID and secret are correct
- **Connection refused**: Ensure your backend is running on the correct port

## Production Deployment
When deploying to production, remember to:
1. Add your production URLs to authorized origins and redirect URIs
2. Update the OAuth consent screen with production information
3. Submit for verification if using sensitive scopes