@echo off
echo.
echo ====================================
echo    SAYU 개발 서버 간단 실행기
echo ====================================
echo.

REM 현재 폴더 확인
echo 📁 현재 위치: %CD%
echo.

REM Git 상태 확인
echo 🔍 Git 상태 확인 중...
git status --short
echo.

REM 최신 코드 받기
echo 📥 최신 코드 받는 중...
git pull origin main
echo.

REM Frontend 서버
echo 🎨 Frontend 서버 시작...
start "SAYU Frontend" cmd /k "cd frontend && npm install && npm run dev"

REM Backend 서버
echo 🔧 Backend 서버 시작...  
start "SAYU Backend" cmd /k "cd backend && npm install && npm run dev"

echo.
echo ====================================
echo ✅ 서버 시작 완료!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔌 Backend:  http://localhost:5000
echo.
echo 💡 GitHub Desktop에서 변경사항을
echo    커밋하고 Push 하세요!
echo ====================================
echo.
pause