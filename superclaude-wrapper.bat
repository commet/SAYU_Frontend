@echo off
echo Running SuperClaude on Windows...

:: Check if Git Bash exists
if exist "C:\Program Files\Git\usr\bin\bash.exe" (
    echo Using Git Bash...
    "C:\Program Files\Git\usr\bin\bash.exe" -c "superclaude %*"
) else (
    echo Git Bash not found. Please install Git for Windows.
    exit /b 1
)