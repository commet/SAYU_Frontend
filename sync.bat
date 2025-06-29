@echo off
echo 🔄 SAYU 프로젝트 동기화 중...

REM 최신 코드 가져오기
git pull origin main

REM Frontend 의존성 설치
cd frontend
call npm ci
cd ..

REM Backend 의존성 설치  
cd backend
call npm ci
cd ..

echo.
echo ✅ 동기화 완료! 
echo.
echo 🚀 개발 서버 시작하기:
echo    Frontend: cd frontend ^&^& npm run dev
echo    Backend: cd backend ^&^& npm run dev
pause