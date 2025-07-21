@echo off
if "%1"=="--version" (
    echo Claude Code v1.0.0
) else if "%1"=="--print" (
    echo %2
) else (
    echo Claude Code mock for superclaude
)
exit /b 0