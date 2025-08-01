# Google OAuth 간단 설정 가이드

## 1. Supabase Callback URL 확인
1. https://app.supabase.com 접속
2. SAYU 프로젝트 선택
3. 왼쪽 메뉴에서 **Authentication** → **Providers** 클릭
4. **Google** 찾아서 클릭
5. **Callback URL (for OAuth)** 복사하기:
   ```
   https://hgltvdshuyfffskvjmst.supabase.co/auth/v1/callback
   ```

## 2. Google Cloud Console 설정
1. https://console.cloud.google.com/ 접속
2. 상단의 프로젝트 선택 드롭다운 클릭
3. **새 프로젝트** 클릭
4. 프로젝트 이름: `SAYU` 입력
5. **만들기** 클릭

## 3. OAuth 동의 화면 설정
1. 왼쪽 메뉴에서 **APIs & Services** → **OAuth consent screen** 클릭
2. User Type: **External** 선택 → **CREATE**
3. 앱 정보 입력:
   - App name: `SAYU`
   - User support email: 본인 이메일
   - Developer contact: 본인 이메일
4. **SAVE AND CONTINUE** 클릭
5. Scopes 페이지: 그냥 **SAVE AND CONTINUE**
6. Test users 페이지: 그냥 **SAVE AND CONTINUE**
7. Summary 페이지: **BACK TO DASHBOARD**

## 4. OAuth 2.0 Client ID 생성
1. 왼쪽 메뉴에서 **Credentials** 클릭
2. 상단의 **+ CREATE CREDENTIALS** → **OAuth client ID** 클릭
3. Application type: **Web application** 선택
4. Name: `SAYU Web Client` 입력
5. **Authorized redirect URIs** 섹션에서 **+ ADD URI** 클릭
6. 위에서 복사한 Supabase Callback URL 붙여넣기:
   ```
   https://hgltvdshuyfffskvjmst.supabase.co/auth/v1/callback
   ```
7. **CREATE** 클릭

## 5. Client ID와 Secret 복사
팝업 창에 나타나는:
- **Client ID**: 복사해두기
- **Client Secret**: 복사해두기

## 6. Supabase에 입력
1. Supabase 대시보드로 돌아가기
2. **Google** provider에서:
   - **Enable Google** 토글 ON
   - **Client ID**: 복사한 Client ID 붙여넣기
   - **Client Secret**: 복사한 Client Secret 붙여넣기
3. **Save** 클릭

완료! 🎉