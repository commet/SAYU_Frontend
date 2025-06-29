@echo off
echo 🚀 SAYU 개발 서버 시작...

REM 동기화 먼저 실행
call sync.bat

REM Frontend 서버 시작 (새 창)
start "SAYU Frontend" cmd /k "cd frontend && npm run dev"

REM Backend 서버 시작 (새 창)
start "SAYU Backend" cmd /k "cd backend && npm run dev"

echo.
echo ✅ 서버가 시작되었습니다!
echo    Frontend: http://localhost:3000
echo    Backend: http://localhost:5000
timeout /t 5