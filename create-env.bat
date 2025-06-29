@echo off
echo.
echo ====================================
echo   🔐 SAYU 환경 변수 파일 생성기
echo ====================================
echo.

REM Frontend .env.local 생성
echo 📝 Frontend 환경 변수 생성 중...
(
echo # Frontend Environment Variables
echo NEXT_PUBLIC_API_URL=http://localhost:5000
echo.
echo # Gemini API Key를 여기에 입력하세요
echo NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key-here
echo.
echo # Next Auth
echo NEXTAUTH_URL=http://localhost:3000
echo NEXTAUTH_SECRET=your-nextauth-secret-here
echo.
echo # OAuth Keys (선택사항)
echo GOOGLE_CLIENT_ID=
echo GOOGLE_CLIENT_SECRET=
echo INSTAGRAM_CLIENT_ID=
echo INSTAGRAM_CLIENT_SECRET=
echo KAKAO_CLIENT_ID=
echo KAKAO_CLIENT_SECRET=
) > frontend\.env.local

REM Backend .env 생성
echo 📝 Backend 환경 변수 생성 중...
(
echo # Backend Environment Variables
echo PORT=5000
echo NODE_ENV=development
echo.
echo # Database
echo DATABASE_URL=postgresql://user:password@localhost:5432/sayu
echo.
echo # JWT Secret
echo JWT_SECRET=your-jwt-secret-here
echo.
echo # Email Service (선택사항)
echo EMAIL_SERVICE=
echo EMAIL_USER=
echo EMAIL_PASS=
echo.
echo # AWS S3 (선택사항)
echo AWS_ACCESS_KEY_ID=
echo AWS_SECRET_ACCESS_KEY=
echo AWS_REGION=
echo AWS_S3_BUCKET=
) > backend\.env

echo.
echo ✅ 환경 변수 파일이 생성되었습니다!
echo.
echo ⚠️  중요: 생성된 파일을 열어서 실제 값을 입력하세요!
echo    - frontend/.env.local
echo    - backend/.env
echo.
echo 💡 팁: 노트북의 환경 변수 값을 복사해서 붙여넣으세요.
echo.
pause