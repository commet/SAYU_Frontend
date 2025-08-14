# Supabase Redirect URL 설정 가이드

## 1. Supabase Dashboard에서 설정

### 위치 찾기:
1. https://supabase.com/dashboard/project/hgltvdshuyfffskvjmst 접속
2. 왼쪽 메뉴에서 **Authentication** 클릭
3. **URL Configuration** 클릭

### Redirect URLs 섹션:
"Redirect URLs" 박스에 다음 URL들을 모두 추가 (각 줄에 하나씩):

```
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
http://localhost:3002/auth/callback
http://localhost:3003/auth/callback
https://sayu.my/auth/callback
https://www.sayu.my/auth/callback
https://sayu-frontend.vercel.app/auth/callback
```

### Site URL 설정:
- Site URL: `http://localhost:3002` (현재 개발 환경)
- 또는 Production URL: `https://www.sayu.my`

## 2. Google Cloud Console에서 설정

### Google OAuth 2.0 설정:
1. https://console.cloud.google.com/ 접속
2. APIs & Services → Credentials
3. OAuth 2.0 Client ID 클릭
4. Authorized redirect URIs에 추가:

```
https://hgltvdshuyfffskvjmst.supabase.co/auth/v1/callback
http://localhost:3002/auth/callback
http://localhost:3000/auth/callback
https://www.sayu.my/auth/callback
```

## 3. 테스트 방법

1. 브라우저 캐시 클리어
2. http://localhost:3002/clear-auth 접속
3. http://localhost:3002/login 에서 구글 로그인 시도

## 4. 디버깅

콘솔에서 확인할 내용:
- 🔐 Auth Provider: google
- 📍 Window Origin: http://localhost:3002
- 🔄 Redirect URL: http://localhost:3002/auth/callback

## 5. 주의사항

- Redirect URL은 정확히 일치해야 함 (http/https, 포트 번호 포함)
- 개발 환경과 프로덕션 환경의 URL을 모두 등록
- URL 끝에 슬래시(/) 없어야 함