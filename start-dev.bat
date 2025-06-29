@echo off
echo 🚀 SAYU 개발 서버 시작...

REM 환경 변수 파일 확인
if not exist "frontend\.env.local" (
    echo.
    echo ⚠️  frontend/.env.local 파일이 없습니다!
    echo.
    echo 💡 해결 방법:
    echo    1. create-env.bat 실행하여 템플릿 생성
    echo    2. 노트북에서 환경 변수 값 복사
    echo.
    choice /C YN /M "지금 create-env.bat을 실행할까요?"
    if errorlevel 2 goto :end
    if errorlevel 1 call create-env.bat
    goto :end
)

if not exist "backend\.env" (
    echo.
    echo ⚠️  backend/.env 파일이 없습니다!
    echo.
    choice /C YN /M "지금 create-env.bat을 실행할까요?"
    if errorlevel 2 goto :end
    if errorlevel 1 call create-env.bat
    goto :end
)

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

:end