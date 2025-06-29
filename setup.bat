@echo off
echo 🚀 SAYU 프로젝트 설정 시작...
echo ==================================

REM Node.js 버전 확인
echo Node.js 버전 확인...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js가 설치되어 있지 않습니다!
    echo https://nodejs.org 에서 Node.js를 설치해주세요.
    pause
    exit /b 1
)

FOR /F "tokens=*" %%i IN ('node -v') DO SET NODE_VERSION=%%i
echo ✓ Node.js 버전: %NODE_VERSION%

REM Git 설정
echo.
echo Git 설정...
git config core.autocrlf false
git config core.eol lf
echo ✓ Git 줄 끝 처리 설정 완료

REM Frontend 설정
if exist "frontend" (
    echo.
    echo Frontend 설정...
    cd frontend
    
    REM 기존 의존성 제거
    if exist "node_modules" rmdir /s /q node_modules
    if exist "package-lock.json" del package-lock.json
    echo ✓ 기존 의존성 제거 완료
    
    REM 캐시 정리
    call npm cache clean --force
    echo ✓ npm 캐시 정리 완료
    
    REM 의존성 설치
    echo 의존성 설치 중...
    call npm install
    
    if %errorlevel% equ 0 (
        echo ✓ Frontend 의존성 설치 완료
    ) else (
        echo ❌ Frontend 의존성 설치 실패
        pause
        exit /b 1
    )
    
    REM 환경 변수 설정
    if not exist ".env.local" (
        if exist ".env.local.example" (
            copy .env.local.example .env.local
            echo ⚠️  .env.local 파일이 생성되었습니다. 환경 변수를 설정해주세요.
        )
    ) else (
        echo ✓ 환경 변수 파일 존재
    )
    
    cd ..
)

REM Backend 설정
if exist "backend" (
    echo.
    echo Backend 설정...
    cd backend
    
    REM 기존 의존성 제거
    if exist "node_modules" rmdir /s /q node_modules
    if exist "package-lock.json" del package-lock.json
    echo ✓ 기존 의존성 제거 완료
    
    REM 의존성 설치
    echo 의존성 설치 중...
    call npm install
    
    if %errorlevel% equ 0 (
        echo ✓ Backend 의존성 설치 완료
    ) else (
        echo ❌ Backend 의존성 설치 실패
        pause
        exit /b 1
    )
    
    REM 환경 변수 설정
    if not exist ".env" (
        if exist ".env.example" (
            copy .env.example .env
            echo ⚠️  .env 파일이 생성되었습니다. 환경 변수를 설정해주세요.
        )
    ) else (
        echo ✓ 환경 변수 파일 존재
    )
    
    cd ..
)

echo.
echo ==========================================
echo ✅ SAYU 프로젝트 설정 완료!
echo ==========================================
echo.
echo 다음 명령어로 개발을 시작하세요:
echo Frontend: cd frontend ^&^& npm run dev
echo Backend: cd backend ^&^& npm run dev
echo.
echo 중요: 환경 변수 파일을 확인하고 필요한 값을 설정하세요!
pause