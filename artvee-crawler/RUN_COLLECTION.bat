@echo off
echo ================================
echo   Artvee 유명 작가 작품 수집
echo ================================
echo.

cd /d C:\Users\SAMSUNG\Documents\GitHub\SAYU\SAYU\artvee-crawler

echo 수집 옵션을 선택하세요:
echo 1. 테스트 실행 (5명만)
echo 2. 전체 수집 (112명 모두)
echo 3. 특정 작가 테스트
echo 4. 종료
echo.

set /p choice=선택 (1-4): 

if %choice%==1 (
    echo.
    echo 테스트 수집을 시작합니다...
    node test-batch-collection.js
) else if %choice%==2 (
    echo.
    echo 전체 수집을 시작합니다. 약 1-2시간이 소요됩니다...
    echo 중단하려면 Ctrl+C를 누르세요.
    echo.
    pause
    node collect-famous-artists.js
) else if %choice%==3 (
    echo.
    set /p artist=작가 이름을 입력하세요 (예: vincent-van-gogh): 
    node collect-famous-artists.js test %artist%
) else if %choice%==4 (
    echo.
    echo 프로그램을 종료합니다.
    exit
)

echo.
echo ================================
echo   작업이 완료되었습니다!
echo ================================
echo.
echo 결과 파일 위치: data 폴더
echo.
pause